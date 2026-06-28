const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { authenticate } = require('../middleware/auth');

// GET /api/expenses
router.get('/', authenticate, async (req, res) => {
  try {
    const { month, year, category, search, limit = 50, offset = 0, sortBy = 'date', sortOrder = 'desc' } = req.query;

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }
    if (category && category !== 'All') query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ expenses: data, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, amount, category, description, date, payment_method } = req.body;
    
    if (!title || !amount) return res.status(400).json({ error: 'Title and amount are required' });

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: req.userId,
        title,
        amount: Number(amount),
        category: category || 'Other',
        description,
        date: date || new Date().toISOString().split('T')[0],
        payment_method: payment_method || 'UPI',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ expense: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, amount, category, description, date, payment_method } = req.body;

    const { data, error } = await supabase
      .from('expenses')
      .update({ title, amount: Number(amount), category, description, date, payment_method })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Expense not found' });
    res.json({ expense: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const year = req.query.year || now.getFullYear();

    const { data, error } = await supabase
      .from('expenses')
      .select('amount, date, category')
      .eq('user_id', req.userId)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);

    if (error) throw error;

    const monthly = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }));
    const byCategory = {};
    let totalYear = 0;

    data.forEach(item => {
      const month = new Date(item.date).getMonth();
      monthly[month].total += Number(item.amount);
      byCategory[item.category] = (byCategory[item.category] || 0) + Number(item.amount);
      totalYear += Number(item.amount);
    });

    const categoryArray = Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalYear > 0 ? ((amount / totalYear) * 100).toFixed(1) : '0',
    })).sort((a, b) => b.amount - a.amount);

    res.json({ monthly, byCategory: categoryArray, totalYear });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
