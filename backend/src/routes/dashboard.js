const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { authenticate } = require('../middleware/auth');

// GET /api/dashboard/summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStart = `${prevYear}-${String(prevMonth).padStart(2,'0')}-01`;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const prevEnd = `${prevYear}-${String(prevMonth).padStart(2,'0')}-${String(prevLastDay).padStart(2,'0')}`;

    const [
      incomeRes, expenseRes, goalsRes, debtsRes,
      prevIncomeRes, prevExpenseRes,
      monthlyIncomeRes, monthlyExpenseRes,
    ] = await Promise.all([
      supabase.from('income').select('amount, category, account_type').eq('user_id', req.userId).gte('date', startDate).lte('date', endDate),
      supabase.from('expenses').select('amount, category, date, account_type').eq('user_id', req.userId).gte('date', startDate).lte('date', endDate),
      supabase.from('goals').select('*').eq('user_id', req.userId),
      supabase.from('debts').select('amount_lent, amount_collected, account_type').eq('user_id', req.userId),
      supabase.from('income').select('amount').eq('user_id', req.userId).gte('date', prevStart).lte('date', prevEnd),
      supabase.from('expenses').select('amount').eq('user_id', req.userId).gte('date', prevStart).lte('date', prevEnd),
      supabase.from('income').select('amount, date').eq('user_id', req.userId).gte('date', `${year}-01-01`).lte('date', endDate),
      supabase.from('expenses').select('amount, date, category').eq('user_id', req.userId).gte('date', `${year}-01-01`).lte('date', endDate),
    ]);

    const totalIncome = (incomeRes.data || []).reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = (expenseRes.data || []).reduce((s, e) => s + Number(e.amount), 0);
    const totalLent = (debtsRes.data || []).reduce((s, d) => s + Number(d.amount_lent), 0);
    const totalCollected = (debtsRes.data || []).reduce((s, d) => s + Number(d.amount_collected), 0);
    
    // Balances
    const savings = totalIncome - totalExpenses - totalLent + totalCollected;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    const outstandingDebt = totalLent - totalCollected;

    let hotCash = 0;
    let digitalBalance = 0;

    // Calculate Cash vs Digital (This aggregates over the current month range. For total lifetime balance, we would query without date filter, but we stick to the existing dashboard range for now to match income/expense)
    // Actually, hot cash and digital balance should be lifetime. Let's query lifetime amounts separately.
    const [allIncomeRes, allExpenseRes] = await Promise.all([
      supabase.from('income').select('amount, account_type').eq('user_id', req.userId),
      supabase.from('expenses').select('amount, account_type').eq('user_id', req.userId)
    ]);

    (allIncomeRes.data || []).forEach(i => {
      if (i.account_type === 'Cash') hotCash += Number(i.amount);
      else digitalBalance += Number(i.amount);
    });
    (allExpenseRes.data || []).forEach(e => {
      if (e.account_type === 'Cash') hotCash -= Number(e.amount);
      else digitalBalance -= Number(e.amount);
    });
    (debtsRes.data || []).forEach(d => {
      // Assuming debts are lifetime as well
      if (d.account_type === 'Cash') {
        hotCash = hotCash - Number(d.amount_lent) + Number(d.amount_collected);
      } else {
        digitalBalance = digitalBalance - Number(d.amount_lent) + Number(d.amount_collected);
      }
    });

    const prevIncome = (prevIncomeRes.data || []).reduce((s, i) => s + Number(i.amount), 0);
    const prevExpenses = (prevExpenseRes.data || []).reduce((s, e) => s + Number(e.amount), 0);

    // Trend calculations
    const incomeTrend = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : 0;
    const expenseTrend = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses * 100).toFixed(1) : 0;

    // Category breakdown
    const categoryMap = {};
    (expenseRes.data || []).forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
    });
    const expensesByCategory = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value, percentage: totalExpenses > 0 ? ((value/totalExpenses)*100).toFixed(1) : '0' }))
      .sort((a, b) => b.value - a.value);

    // Monthly chart data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const mStr = String(m).padStart(2, '0');
      const mIncome = (monthlyIncomeRes.data || [])
        .filter(item => item.date.startsWith(`${y}-${mStr}`))
        .reduce((s, i) => s + Number(i.amount), 0);
      const mExpense = (monthlyExpenseRes.data || [])
        .filter(item => item.date.startsWith(`${y}-${mStr}`))
        .reduce((s, e) => s + Number(e.amount), 0);
      monthlyData.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income: mIncome,
        expense: mExpense,
        savings: mIncome - mExpense,
      });
    }

    // Health score
    const savingsRateScore = Math.min(savingsRate * 2, 40);
    const expenseRatioScore = totalIncome > 0 ? Math.max(0, 30 - ((totalExpenses / totalIncome) * 30)) : 0;
    const goalsScore = (goalsRes.data || []).length > 0 ? 20 : 5;
    const emergencyFundScore = savings >= totalExpenses * 3 ? 10 : Math.min(10, (savings / Math.max(totalExpenses * 3, 1)) * 10);
    const healthScore = Math.round(Math.min(100, savingsRateScore + expenseRatioScore + goalsScore + emergencyFundScore));

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        savings, // Note: This acts as monthly savings
        savingsRate: savingsRate.toFixed(1),
        healthScore,
        incomeTrend: Number(incomeTrend),
        expenseTrend: Number(expenseTrend),
        hotCash,
        digitalBalance,
        totalBalance: hotCash + digitalBalance,
        outstandingDebt,
      },
      charts: {
        expensesByCategory,
        monthlyData,
      },
      goals: goalsRes.data || [],
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
