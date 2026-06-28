const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { authenticate } = require('../middleware/auth');

// GET /api/goals
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ goals: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, target_amount, current_amount, category, description, target_date, priority, icon } = req.body;
    
    if (!title || !target_amount) return res.status(400).json({ error: 'Title and target amount are required' });

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: req.userId,
        title,
        target_amount: Number(target_amount),
        current_amount: Number(current_amount || 0),
        category: category || 'General',
        description,
        target_date: target_date || null,
        priority: priority || 'medium',
        icon: icon || '🎯',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, target_amount, current_amount, category, description, target_date, priority, icon, is_completed } = req.body;

    const updateData = {
      title,
      target_amount: Number(target_amount),
      current_amount: Number(current_amount),
      category,
      description,
      target_date: target_date || null,
      priority,
      icon,
    };

    if (is_completed !== undefined) updateData.is_completed = is_completed;
    
    // Auto-complete if reached target
    if (Number(current_amount) >= Number(target_amount)) {
      updateData.is_completed = true;
    }

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Goal not found' });
    res.json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/goals/:id/contribute - Add funds to a goal
router.patch('/:id/contribute', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Valid amount required' });

    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !goal) return res.status(404).json({ error: 'Goal not found' });

    const newAmount = Math.min(Number(goal.current_amount) + Number(amount), Number(goal.target_amount));
    const isCompleted = newAmount >= Number(goal.target_amount);

    const { data, error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount, is_completed: isCompleted })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ goal: data, completed: isCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
