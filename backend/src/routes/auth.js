const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { authenticate } = require('../middleware/auth');

// GET /api/auth/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error) throw error;
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, monthly_income_target, monthly_expense_target, currency } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, monthly_income_target, monthly_expense_target, currency })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/initial-balances
router.get('/initial-balances', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('income')
      .select('amount, account_type')
      .eq('user_id', req.userId)
      .eq('category', 'Initial Balance');

    if (error) throw error;

    let cash = 0;
    let digital = 0;
    (data || []).forEach(item => {
      if (item.account_type === 'Cash') cash += Number(item.amount);
      if (item.account_type === 'Digital') digital += Number(item.amount);
    });

    res.json({ cash, digital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/initial-balances
router.put('/initial-balances', authenticate, async (req, res) => {
  try {
    const { cash, digital } = req.body;
    
    // Delete existing initial balances
    const { error: delError } = await supabase
      .from('income')
      .delete()
      .eq('user_id', req.userId)
      .eq('category', 'Initial Balance');
      
    if (delError) throw delError;

    // Insert new ones
    const inserts = [];
    if (cash > 0) {
      inserts.push({
        user_id: req.userId,
        title: 'Initial Cash Balance',
        amount: cash,
        category: 'Initial Balance',
        account_type: 'Cash',
        date: '2000-01-01'
      });
    }
    if (digital > 0) {
      inserts.push({
        user_id: req.userId,
        title: 'Initial Digital Balance',
        amount: digital,
        category: 'Initial Balance',
        account_type: 'Digital',
        date: '2000-01-01'
      });
    }

    if (inserts.length > 0) {
      const { error: insError } = await supabase.from('income').insert(inserts);
      if (insError) throw insError;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
