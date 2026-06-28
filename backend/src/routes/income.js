const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { authenticate } = require('../middleware/auth');

// GET /api/income - list all income
router.get('/', authenticate, async (req, res) => {
  try {
    const { month, year, category, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('income')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId)
      .order('date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ income: data, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/income
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, amount, category, description, date, recurring, recurring_period } = req.body;
    
    if (!title || !amount) return res.status(400).json({ error: 'Title and amount are required' });
    
    const { data, error } = await supabase
      .from('income')
      .insert({ user_id: req.userId, title, amount: Number(amount), category: category || 'Salary', description, date: date || new Date().toISOString().split('T')[0], recurring: Boolean(recurring), recurring_period })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ income: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/income/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, amount, category, description, date, recurring, recurring_period } = req.body;
    
    const { data, error } = await supabase
      .from('income')
      .update({ title, amount: Number(amount), category, description, date, recurring, recurring_period })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Income record not found' });
    res.json({ income: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/income/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Income record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/income/summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const year = req.query.year || now.getFullYear();

    const { data, error } = await supabase
      .from('income')
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

    res.json({ monthly, byCategory, totalYear });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
