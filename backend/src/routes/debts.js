const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { authenticate } = require('../middleware/auth');

// GET /api/debts
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', req.userId)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json({ debts: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/debts/:id/collections
router.get('/:id/collections', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('debt_collections')
      .select('*')
      .eq('debt_id', req.params.id)
      .eq('user_id', req.userId)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json({ collections: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/debts
router.post('/', authenticate, async (req, res) => {
  try {
    const { person_name, amount_lent, account_type, date, description } = req.body;
    
    if (!person_name || !amount_lent) {
      return res.status(400).json({ error: 'Person name and amount are required' });
    }

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: req.userId,
        person_name,
        amount_lent,
        account_type: account_type || 'Digital',
        date: date || new Date().toISOString().split('T')[0],
        description,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/debts/:id/collect
router.post('/:id/collect', authenticate, async (req, res) => {
  try {
    const { amount, account_type, date } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Verify debt belongs to user
    const { data: debt, error: fetchError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    if (debt.amount_collected + Number(amount) > debt.amount_lent) {
      return res.status(400).json({ error: 'Collection amount exceeds remaining debt' });
    }

    const { data, error } = await supabase
      .from('debt_collections')
      .insert({
        debt_id: req.params.id,
        user_id: req.userId,
        amount,
        account_type: account_type || 'Digital',
        date: date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/debts/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { person_name, amount_lent, account_type, date, description } = req.body;
    
    const { data, error } = await supabase
      .from('debts')
      .update({ person_name, amount_lent, account_type, date, description })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/debts/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
