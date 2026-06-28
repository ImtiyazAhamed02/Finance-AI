const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { authenticate } = require('../middleware/auth');
const { streamGrokChat, generateInsights, generateForecast } = require('../services/grok');

// Helper: get user financial summary for context
async function getUserFinancialData(userId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;

  const [incomeRes, expenseRes, goalsRes, recentExpRes, recentIncRes, debtsRes, allIncomeRes, allExpenseRes] = await Promise.all([
    supabase.from('income').select('amount, category').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('expenses').select('amount, category').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('goals').select('*').eq('user_id', userId).eq('is_completed', false),
    supabase.from('expenses').select('title, amount, category, date').eq('user_id', userId).order('date', { ascending: false }).limit(30),
    supabase.from('income').select('title, amount, category, date').eq('user_id', userId).order('date', { ascending: false }).limit(10),
    supabase.from('debts').select('*').eq('user_id', userId),
    supabase.from('income').select('amount, account_type').eq('user_id', userId),
    supabase.from('expenses').select('amount, account_type').eq('user_id', userId)
  ]);

  const totalIncome = (incomeRes.data || []).reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = (expenseRes.data || []).reduce((s, e) => s + Number(e.amount), 0);
  const totalLent = (debtsRes.data || []).reduce((s, d) => s + Number(d.amount_lent), 0);
  const totalCollected = (debtsRes.data || []).reduce((s, d) => s + Number(d.amount_collected), 0);
  
  const savings = totalIncome - totalExpenses - totalLent + totalCollected;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const categoryMap = {};
  (expenseRes.data || []).forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });

  const topExpenseCategories = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Health score calculation
  const savingsRateScore = Math.min(savingsRate * 2, 40);
  const expenseRatioScore = totalIncome > 0 ? Math.max(0, 30 - ((totalExpenses / totalIncome) * 30)) : 0;
  const goalsScore = (goalsRes.data || []).length > 0 ? 20 : 5;
  const emergencyFundScore = savings >= totalExpenses * 3 ? 10 : (savings / (totalExpenses * 3)) * 10;
  const healthScore = Math.round(Math.min(100, savingsRateScore + expenseRatioScore + goalsScore + emergencyFundScore));

  // Calculate Lifetime Balances
  let hotCash = 0;
  let digitalBalance = 0;
  (allIncomeRes.data || []).forEach(i => {
    if (i.account_type === 'Cash') hotCash += Number(i.amount);
    else digitalBalance += Number(i.amount);
  });
  (allExpenseRes.data || []).forEach(e => {
    if (e.account_type === 'Cash') hotCash -= Number(e.amount);
    else digitalBalance -= Number(e.amount);
  });
  (debtsRes.data || []).forEach(d => {
    if (d.account_type === 'Cash') {
      hotCash = hotCash - Number(d.amount_lent) + Number(d.amount_collected);
    } else {
      digitalBalance = digitalBalance - Number(d.amount_lent) + Number(d.amount_collected);
    }
  });

  return {
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
    hotCash,
    digitalBalance,
    totalBalance: hotCash + digitalBalance,
    topExpenseCategories,
    goals: goalsRes.data || [],
    debts: debtsRes.data || [],
    healthScore,
    recentExpenses: recentExpRes.data || [],
    recentIncome: recentIncRes.data || [],
  };
}

// POST /api/ai/chat - Streaming chat
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { messages, sessionId } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const financialData = await getUserFinancialData(req.userId);

    // Save user message to history
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      await supabase.from('chat_history').insert({
        user_id: req.userId,
        session_id: sessionId,
        role: 'user',
        content: lastUserMessage.content,
      });
    }

    // Stream response
    await streamGrokChat(messages, financialData, res);
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI chat failed: ' + err.message });
    }
  }
});

// POST /api/ai/chat/save - Save AI response to history
router.post('/chat/save', authenticate, async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    await supabase.from('chat_history').insert({
      user_id: req.userId,
      session_id: sessionId,
      role: 'assistant',
      content,
    });
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/chat/history
router.get('/chat/history', authenticate, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;
    res.json({ history: data.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/insights - Get/generate AI insights
router.get('/insights', authenticate, async (req, res) => {
  try {
    // Check cached insights (< 6 hours old) unless force=true
    const force = req.query.force === 'true';
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', req.userId)
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!force && cached && cached.length >= 3) {
      return res.json({ insights: cached });
    }

    // Generate fresh insights
    const financialData = await getUserFinancialData(req.userId);
    const insights = await generateInsights(financialData);

    // Save to DB
    const insightRecords = insights.map(ins => ({
      user_id: req.userId,
      type: ins.type,
      title: ins.title,
      content: ins.content,
      icon: ins.icon,
      priority: ins.priority,
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    }));

    // Delete old insights
    await supabase.from('ai_insights').delete().eq('user_id', req.userId).lt('created_at', sixHoursAgo);

    const { data: saved, error } = await supabase.from('ai_insights').insert(insightRecords).select();
    if (error) console.error('Insight save error:', error);

    res.json({ insights: saved || insightRecords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/health-score
router.get('/health-score', authenticate, async (req, res) => {
  try {
    const financialData = await getUserFinancialData(req.userId);
    const { healthScore, totalIncome, totalExpenses, savings, savingsRate } = financialData;

    let rating = 'Poor';
    let color = '#EF4444';
    let explanation = 'Focus on reducing expenses and building savings.';

    if (healthScore >= 80) {
      rating = 'Excellent';
      color = '#22C55E';
      explanation = 'Outstanding financial health! You\'re saving well and managing expenses effectively.';
    } else if (healthScore >= 60) {
      rating = 'Good';
      color = '#06B6D4';
      explanation = 'Good financial habits. Consider increasing your savings rate or setting new goals.';
    } else if (healthScore >= 40) {
      rating = 'Fair';
      color = '#F59E0B';
      explanation = 'Room for improvement. Try to increase income or reduce non-essential expenses.';
    }

    res.json({
      score: healthScore,
      rating,
      color,
      explanation,
      breakdown: {
        savingsRate: savingsRate.toFixed(1),
        totalIncome,
        totalExpenses,
        savings,
        emergencyFundMonths: totalExpenses > 0 ? (savings / totalExpenses).toFixed(1) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/forecast
router.get('/forecast', authenticate, async (req, res) => {
  try {
    const financialData = await getUserFinancialData(req.userId);
    const forecast = await generateForecast(financialData);
    res.json({ forecast });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
