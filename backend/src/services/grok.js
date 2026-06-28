const axios = require('axios');

const GROK_API_KEY = process.env.GROK_API_KEY || '';

// Detect which AI provider to use based on key prefix
// xai- = xAI Grok API
// gsk_ = Groq API (supports llama/mixtral models)
const isGroq = GROK_API_KEY.startsWith('gsk_');
const isXAI = GROK_API_KEY.startsWith('xai-');

const BASE_URL = isGroq
  ? 'https://api.groq.com/openai/v1'
  : 'https://api.x.ai/v1';

const MODEL = isGroq
  ? 'llama-3.1-8b-instant'
  : 'grok-3-mini';

console.log(`🤖 AI Provider: ${isGroq ? 'Groq (llama-3.1-8b)' : isXAI ? 'xAI (Grok)' : 'Unknown - check GROK_API_KEY'}`);
console.log(`🔗 API URL: ${BASE_URL}`);

const aiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${GROK_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

/**
 * Build financial context string from user data
 */
function buildFinancialContext(financialData) {
  if (!financialData) return '';
  const {
    totalIncome = 0, totalExpenses = 0, savings = 0,
    savingsRate = 0, hotCash = 0, digitalBalance = 0, totalBalance = 0,
    topExpenseCategories = [], goals = [], debts = [],
    healthScore = 0, recentExpenses = [], recentIncome = []
  } = financialData;

  const categoryBreakdown = topExpenseCategories
    .map(c => `${c.category}: ₹${Number(c.amount).toLocaleString('en-IN')} (${c.percentage}%)`)
    .join(', ');

  const goalsStr = goals.slice(0, 3)
    .map(g => `${g.title}: ₹${g.current_amount}/${g.target_amount} (${Math.round((g.current_amount / g.target_amount) * 100)}% complete)`)
    .join('; ');

  const expensesStr = recentExpenses.slice(0, 15)
    .map(e => `${e.date} | ${e.title} (${e.category}): ₹${Number(e.amount).toLocaleString('en-IN')}`)
    .join('\n  ');

  const incomeStr = recentIncome.slice(0, 5)
    .map(i => `${i.date} | ${i.title} (${i.category}): ₹${Number(i.amount).toLocaleString('en-IN')}`)
    .join('\n  ');

  const debtsStr = debts.slice(0, 5)
    .map(d => `${d.person_name} owes ₹${Number(d.amount_lent - d.amount_collected).toLocaleString('en-IN')} (Total Lent: ₹${d.amount_lent}, Collected: ₹${d.amount_collected}, Status: ${d.status})`)
    .join('\n  ');

  const totalOutstandingDebt = debts.reduce((sum, d) => sum + (Number(d.amount_lent) - Number(d.amount_collected)), 0);

  return `
CURRENT USER FINANCIAL PROFILE (Indian Rupees - INR):
- Lifetime Total Balance: ₹${Number(totalBalance).toLocaleString('en-IN')} (Hot Cash: ₹${Number(hotCash).toLocaleString('en-IN')}, Digital: ₹${Number(digitalBalance).toLocaleString('en-IN')})
- Total Outstanding Debt (Owed to user): ₹${Number(totalOutstandingDebt).toLocaleString('en-IN')}
- This Month Income: ₹${Number(totalIncome).toLocaleString('en-IN')}
- This Month Expenses: ₹${Number(totalExpenses).toLocaleString('en-IN')}
- This Month Net Savings: ₹${Number(savings).toLocaleString('en-IN')}
- This Month Savings Rate: ${Number(savingsRate).toFixed(1)}%
- Financial Health Score: ${healthScore}/100
- Top Spending Categories: ${categoryBreakdown || 'No data yet'}
- Active Goals: ${goalsStr || 'No goals set'}

DEBTS (Money lent to others):
  ${debtsStr || 'No outstanding debts'}

RECENT EXPENSES (Last 15):
  ${expensesStr || 'No recent expenses'}

RECENT INCOME (Last 5):
  ${incomeStr || 'No recent income'}
`.trim();
}

/**
 * Stream AI chat response
 */
async function streamGrokChat(messages, financialData, res) {
  const systemPrompt = `You are FinGenius AI, a highly intelligent and expert personal finance advisor for Indian users. 
You act like a smart, proactive financial assistant (similar to ChatGPT) that knows the user's detailed financial data.
When the user asks about their spending, income, or specific transactions, you MUST use the detailed RECENT EXPENSES, RECENT INCOME, and DEBTS data provided in the context.
IMPORTANT: Do NOT perform manual arithmetic to calculate totals (e.g., adding up individual debts or expenses). Always use the pre-calculated totals provided in the "CURRENT USER FINANCIAL PROFILE" section. If you must do math, double-check your arithmetic strictly.
Speak in a friendly, professional, and conversational tone. Give actionable, specific advice.
Always consider Indian financial context (INR, Indian tax laws, SIP investments, PPF, FD, NPS, ELSS, etc.).
Keep responses concise (2-3 paragraphs max) unless detailed analysis is requested.
Use ₹ symbol for amounts. Format large numbers in Indian style (e.g., ₹1.5L, ₹2.3Cr).

${buildFinancialContext(financialData)}

Remember: You have access to the user's real financial data above. Analyze the specific transactions when answering questions like "how much did I spend on X" or "what are my recent transactions", but rely on the provided totals for any aggregated numbers.`;

  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      },
      responseType: 'stream',
      timeout: 60000,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              res.write(`data: ${JSON.stringify({ content, fullContent })}\n\n`);
            }
          } catch (e) { /* skip parse errors */ }
        }
      }
    });

    response.data.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.data.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
        res.end();
      }
    });

    return fullContent;
  } catch (err) {
    if (err.response?.data && typeof err.response.data.on === 'function') {
      // It's a stream error, we need to read it
      err.response.data.on('data', chunk => {
        console.error('AI chat stream error data:', chunk.toString());
      });
    } else {
      console.error('AI chat error:', err.response?.data || err.message);
    }
    throw new Error(`AI API error: Rate limit reached or API unavailable. Please try again in a moment.`);
  }
}

/**
 * Generate AI insights (non-streaming)
 */
async function generateInsights(financialData) {
  const systemPrompt = `You are FinGenius AI, an expert personal finance advisor for Indian users.
Analyze the financial data and generate exactly 4-5 actionable insights in JSON format.
Each insight should be specific, data-driven, and actionable. Use ₹ symbol.

Return ONLY a valid JSON array with this structure (no other text):
[
  {
    "type": "warning|tip|achievement|goal|spending",
    "title": "Short title (max 60 chars)",
    "content": "Detailed insight (max 200 chars)",
    "icon": "single emoji",
    "priority": "high|medium|low"
  }
]`;

  const userPrompt = `${buildFinancialContext(financialData)}

Generate 4-5 personalized financial insights. Focus on:
1. Unusual or high spending patterns
2. Savings opportunities
3. Goal progress assessment
4. Budget recommendations
5. Investment suggestions for India (SIP, PPF, FD, ELSS)

Return ONLY the JSON array.`;

  try {
    const response = await aiClient.post('/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(content);
  } catch (err) {
    console.error('AI insights error:', err.response?.data || err.message);
    return [
      { type: 'tip', title: 'Start tracking your expenses', content: 'Add your income and expenses to get personalized AI insights about your financial health.', icon: '💡', priority: 'high' },
      { type: 'tip', title: 'Set a savings goal', content: 'Creating a savings goal helps you stay motivated and track your progress toward financial freedom.', icon: '🎯', priority: 'medium' },
      { type: 'tip', title: 'Build an emergency fund', content: 'Aim to save 3-6 months of expenses as an emergency buffer before investing.', icon: '🛡️', priority: 'medium' },
    ];
  }
}

/**
 * Generate savings forecast
 */
async function generateForecast(financialData) {
  const { totalIncome = 0, totalExpenses = 0, goals = [] } = financialData;
  const monthlySavings = totalIncome - totalExpenses;

  const prompt = `${buildFinancialContext(financialData)}

Calculate a 12-month savings forecast. Return ONLY this JSON (no other text):
{
  "monthlySavings": ${monthlySavings},
  "projectedSavings": [12 cumulative monthly savings values as numbers],
  "recommendation": "One actionable recommendation (max 150 chars)"
}`;

  try {
    const response = await aiClient.post('/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a financial forecasting assistant. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(content);
  } catch (err) {
    // Fallback linear projection
    const projected = Array.from({ length: 12 }, (_, i) => Math.max(0, monthlySavings * (i + 1)));
    return {
      monthlySavings,
      projectedSavings: projected,
      recommendation: monthlySavings > 0
        ? `You're saving ₹${Number(monthlySavings).toLocaleString('en-IN')}/month. Consider investing in SIP for long-term growth.`
        : 'Your expenses exceed income. Review and reduce non-essential spending immediately.',
    };
  }
}

module.exports = { streamGrokChat, generateInsights, generateForecast, MODEL, BASE_URL };
