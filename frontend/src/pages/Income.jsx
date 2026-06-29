import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, TrendingUp } from 'lucide-react';
import { incomeApi } from '../api/client';
import { formatCurrency, formatDate, INCOME_CATEGORIES } from '../lib/utils';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INCOME_COLORS = { Salary: '#22C55E', Freelance: '#06B6D4', Business: '#6366F1', 'Rental Income': '#F59E0B', Investment: '#8B5CF6', Gift: '#EC4899', Other: '#94A3B8' };

function IncomeModal({ income, onClose, onSave }) {
  const [form, setForm] = useState({
    title: income?.title || '',
    amount: income?.amount || '',
    category: income?.category || 'Salary',
    description: income?.description || '',
    date: income?.date || new Date().toISOString().split('T')[0],
    recurring: income?.recurring || false,
    recurring_period: income?.recurring_period || 'monthly',
    account_type: income?.account_type || 'Digital',
  });
  const [loading, setLoading] = useState(false);
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.amount) return toast.error('Title and amount required');
    setLoading(true);
    try { await onSave(form); onClose(); } finally { setLoading(false); }
  };

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
            {income ? 'Edit Income' : 'Add Income'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Title *</label>
            <input className="input-field" placeholder="e.g. Monthly Salary" value={form.title} onChange={update('title')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Amount (₹) *</label>
              <input className="input-field" type="number" placeholder="0" min="0" value={form.amount} onChange={update('amount')} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Date</label>
              <input className="input-field" type="date" value={form.date} onChange={update('date')} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Category</label>
            <select className="select-field" value={form.category} onChange={update('category')}>
              {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Account Type</label>
            <select className="select-field" value={form.account_type} onChange={update('account_type')}>
              <option value="Digital">Digital Money (Bank/Wallet)</option>
              <option value="Cash">Hot Cash (Physical)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="recurring" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#6366F1' }} />
            <label htmlFor="recurring" style={{ fontSize: 13, color: '#94A3B8', cursor: 'pointer' }}>Recurring income</label>
            {form.recurring && (
              <select className="select-field" value={form.recurring_period} onChange={update('recurring_period')} style={{ width: 'auto', padding: '6px 12px' }}>
                {['weekly','monthly','yearly'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Note</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={update('description')} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? 'Saving...' : income ? 'Save Changes' : 'Add Income'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default function Income() {
  const [modal, setModal] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['income'],
    queryFn: () => incomeApi.getAll({ limit: 50 }).then(r => r.data),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['income-summary'],
    queryFn: () => incomeApi.getSummary().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: incomeApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['income'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Income added! 💰'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => incomeApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['income'] }); toast.success('Updated!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: incomeApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['income'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Deleted'); },
  });

  const incomes = data?.income || [];
  const monthlyData = summaryData?.monthly || [];
  const totalYear = summaryData?.totalYear || 0;
  const byCategory = summaryData?.byCategory || {};

  const chartData = monthlyData.map((m, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    income: m.total,
  }));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 24 }}>Income</h2>
          <p className="section-subtitle">Track all your revenue streams</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ income: null })}>
          <Plus size={16} /> Add Income
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total This Year</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--success)', fontFamily: "'Outfit'" }}>{formatCurrency(totalYear)}</div>
        </div>
        {Object.entries(byCategory).slice(0, 3).map(([cat, amt], i) => (
          <div key={cat} className="glass-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: INCOME_COLORS[cat] || 'var(--primary)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{cat}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit'" }}>{formatCurrency(amt)}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 4 }}>Monthly Income</h3>
        <p className="section-subtitle" style={{ marginBottom: 20 }}>Year-to-date breakdown</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={v => [formatCurrency(v), 'Income']}
            />
            <Bar dataKey="income" radius={[8, 8, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={`hsl(${142 + i * 5}, 70%, ${45 + i}%)`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Income table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>All Income Records</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Account</th><th>Amount</th><th>Date</th><th>Recurring</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 20, borderRadius: 6 }} /></td></tr>
                ))
              ) : incomes.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                  <TrendingUp size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                  No income records yet. Add your first one!
                </td></tr>
              ) : incomes.map((inc, i) => (
                <tr key={inc.id}>
                  <td data-label="Title" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inc.title}</td>
                  <td data-label="Category">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, fontSize: 12, background: `${INCOME_COLORS[inc.category] || '#6366F1'}18`, color: INCOME_COLORS[inc.category] || '#818CF8' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: INCOME_COLORS[inc.category] || '#6366F1' }} />
                      {inc.category}
                    </span>
                  </td>
                  <td data-label="Account">
                    <span style={{ fontSize: 12, fontWeight: 500, color: inc.account_type === 'Cash' ? 'var(--warning)' : 'var(--info)' }}>
                      {inc.account_type || 'Digital'}
                    </span>
                  </td>
                  <td data-label="Amount" style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(inc.amount)}</td>
                  <td data-label="Date">{formatDate(inc.date)}</td>
                  <td data-label="Recurring">{inc.recurring ? <span className="badge badge-success">{inc.recurring_period}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}</td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setModal({ income: inc })} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--primary)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}><Edit2 size={13} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(inc.id); }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--danger)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modal !== null && (
          <IncomeModal
            income={modal.income}
            onClose={() => setModal(null)}
            onSave={(data) => modal.income
              ? updateMutation.mutateAsync({ id: modal.income.id, data })
              : createMutation.mutateAsync(data)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
