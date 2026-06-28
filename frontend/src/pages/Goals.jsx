import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, X, Trophy, Sparkles } from 'lucide-react';
import { goalApi } from '../api/client';
import GoalCard from '../components/GoalCard';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

const GOAL_ICONS = ['🎯', '💻', '🏍️', '🏠', '✈️', '🚗', '💍', '📚', '🏥', '💰', '🛡️', '🎓'];
const GOAL_CATEGORIES = ['General', 'Technology', 'Vehicle', 'Real Estate', 'Travel', 'Education', 'Health', 'Emergency Fund', 'Investment', 'Wedding'];

function GoalModal({ goal, onClose, onSave }) {
  const [form, setForm] = useState({
    title: goal?.title || '',
    target_amount: goal?.target_amount || '',
    current_amount: goal?.current_amount || 0,
    category: goal?.category || 'General',
    description: goal?.description || '',
    target_date: goal?.target_date || '',
    priority: goal?.priority || 'medium',
    icon: goal?.icon || '🎯',
  });
  const [loading, setLoading] = useState(false);
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.target_amount) return toast.error('Title and target amount required');
    if (Number(form.target_amount) <= 0) return toast.error('Target must be greater than 0');
    setLoading(true);
    try { await onSave(form); onClose(); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Icon picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 8 }}>Goal Icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_ICONS.map(icon => (
              <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                style={{
                  width: 42, height: 42, borderRadius: 10, fontSize: 20, cursor: 'pointer', border: '2px solid',
                  borderColor: form.icon === icon ? '#6366F1' : 'rgba(99,102,241,0.15)',
                  background: form.icon === icon ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.5)',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Goal Title *</label>
            <input className="input-field" placeholder="e.g. Buy a new laptop" value={form.title} onChange={update('title')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Target Amount (₹) *</label>
              <input className="input-field" type="number" placeholder="0" min="1" value={form.target_amount} onChange={update('target_amount')} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Already Saved (₹)</label>
              <input className="input-field" type="number" placeholder="0" min="0" value={form.current_amount} onChange={update('current_amount')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Category</label>
              <select className="select-field" value={form.category} onChange={update('category')}>
                {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Priority</label>
              <select className="select-field" value={form.priority} onChange={update('priority')}>
                {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Target Date (optional)</label>
            <input className="input-field" type="date" value={form.target_date} onChange={update('target_date')} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Description (optional)</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={update('description')} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? 'Saving...' : goal ? 'Update Goal' : '🎯 Create Goal'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ContributeModal({ goal, onClose, onContribute }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const remaining = goal.target_amount - goal.current_amount;

  const handleContribute = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error('Enter a valid amount');
    if (num > remaining) return toast.error(`Maximum contribution: ${formatCurrency(remaining)}`);
    setLoading(true);
    try { await onContribute(goal.id, num); onClose(); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{goal.icon || '🎯'}</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Add Funds</h3>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>{goal.title}</p>
          <p style={{ fontSize: 13, color: '#6366F1', marginTop: 6 }}>
            {formatCurrency(remaining)} remaining to goal
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Amount to add (₹)</label>
          <input className="input-field" type="number" placeholder="Enter amount" min="1" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[500, 1000, 2000, 5000].filter(a => a <= remaining).map(a => (
            <button key={a} onClick={() => setAmount(a)} style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${amount == a ? '#6366F1' : 'rgba(99,102,241,0.2)'}`,
              background: amount == a ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
              color: amount == a ? '#818CF8' : '#94A3B8',
            }}>₹{a.toLocaleString('en-IN')}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={handleContribute} className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? 'Adding...' : '+ Add Funds'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Goals() {
  const [goalModal, setGoalModal] = useState(null);
  const [contributeModal, setContributeModal] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalApi.getAll().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: goalApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); toast.success('Goal created! 🎯'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => goalApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); toast.success('Goal updated!'); },
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, amount }) => goalApi.contribute(id, amount),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      if (res.data?.completed) toast.success('🎉 Goal completed! Congratulations!', { duration: 5000 });
      else toast.success('Funds added successfully!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: goalApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); toast.success('Goal deleted'); },
  });

  const goals = data?.goals || [];
  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 24 }}>Savings Goals</h2>
          <p className="section-subtitle">Set goals and track your progress</p>
        </div>
        <button className="btn-primary" onClick={() => setGoalModal({ goal: null })}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Overview */}
      {goals.length > 0 && (
        <motion.div className="glass-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Targeted</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit'" }}>{formatCurrency(totalTarget)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Saved</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)', fontFamily: "'Outfit'" }}>{formatCurrency(totalSaved)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Goals</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', fontFamily: "'Outfit'" }}>{activeGoals.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Completed</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)', fontFamily: "'Outfit'" }}>{completedGoals.length}</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Overall Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{overallProgress.toFixed(1)}%</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Goals */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 20 }} />)}
        </div>
      ) : activeGoals.length > 0 ? (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Active Goals ({activeGoals.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>
            {activeGoals.map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} index={i}
                onContribute={(g) => setContributeModal(g)}
                onEdit={(g) => setGoalModal({ goal: g })}
                onDelete={(id) => { if (confirm('Delete this goal?')) deleteMutation.mutate(id); }}
              />
            ))}
          </div>
        </>
      ) : (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 60, textAlign: 'center' }}>
          <Target size={48} color="var(--primary)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>No goals yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Create your first savings goal and start building wealth!</p>
          <button className="btn-primary" onClick={() => setGoalModal({ goal: null })}>
            <Plus size={16} /> Create First Goal
          </button>
        </motion.div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Trophy size={18} color="var(--success)" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--success)' }}>Completed Goals ({completedGoals.length})</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {completedGoals.map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} index={i}
                onEdit={(g) => setGoalModal({ goal: g })}
                onDelete={(id) => { if (confirm('Delete this completed goal?')) deleteMutation.mutate(id); }}
              />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {goalModal !== null && (
          <GoalModal goal={goalModal.goal} onClose={() => setGoalModal(null)}
            onSave={(data) => goalModal.goal
              ? updateMutation.mutateAsync({ id: goalModal.goal.id, data })
              : createMutation.mutateAsync(data)} />
        )}
        {contributeModal && (
          <ContributeModal goal={contributeModal} onClose={() => setContributeModal(null)}
            onContribute={(id, amount) => contributeMutation.mutateAsync({ id, amount })} />
        )}
      </AnimatePresence>
    </div>
  );
}
