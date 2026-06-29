import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, X, TrendingDown, ChevronUp, ChevronDown, HandCoins, CheckCircle } from 'lucide-react';
import { expenseApi, debtApi } from '../api/client';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, PAYMENT_METHODS, CATEGORY_COLORS } from '../lib/utils';
import toast from 'react-hot-toast';

function ExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || 'Food',
    description: expense?.description || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    payment_method: expense?.payment_method || 'UPI',
    account_type: expense?.account_type || 'Digital',
  });
  const [loading, setLoading] = useState(false);
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.amount) return toast.error('Title and amount required');
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-card" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4, borderRadius: 6 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Title *</label>
            <input className="input-field" placeholder="e.g. Grocery shopping" value={form.title} onChange={update('title')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Amount (₹) *</label>
              <input className="input-field" type="number" placeholder="0" min="0" value={form.amount} onChange={update('amount')} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
              <input className="input-field" type="date" value={form.date} onChange={update('date')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Category</label>
              <select className="select-field" value={form.category} onChange={update('category')}>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Account Type</label>
              <select className="select-field" value={form.account_type} onChange={update('account_type')}>
                <option value="Digital">Digital Money (Bank/Wallet)</option>
                <option value="Cash">Hot Cash (Physical)</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Note (optional)</label>
            <textarea className="input-field" placeholder="Additional notes..." rows={2} value={form.description} onChange={update('description')} style={{ resize: 'vertical', minHeight: 60 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? 'Saving...' : expense ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

function DebtModal({ debt, onClose, onSave }) {
  const [form, setForm] = useState({
    person_name: debt?.person_name || '',
    amount_lent: debt?.amount_lent || '',
    account_type: debt?.account_type || 'Digital',
    date: debt?.date || new Date().toISOString().split('T')[0],
    description: debt?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.person_name || !form.amount_lent) return toast.error('Name and amount required');
    setLoading(true);
    try { await onSave(form); onClose(); } finally { setLoading(false); }
  };

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
          {debt ? 'Edit Debt' : 'Lend Money'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Person Name *</label>
            <input className="input-field" placeholder="Who are you giving money to?" value={form.person_name} onChange={update('person_name')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Amount (₹) *</label>
              <input className="input-field" type="number" placeholder="0" value={form.amount_lent} onChange={update('amount_lent')} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Account Type</label>
              <select className="select-field" value={form.account_type} onChange={update('account_type')}>
                <option value="Digital">Digital Money</option>
                <option value="Cash">Hot Cash</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? 'Saving...' : debt ? 'Save Changes' : 'Record Debt'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

function CollectionModal({ debt, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: '',
    account_type: 'Digital',
  });
  const [loading, setLoading] = useState(false);
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const maxAmount = debt.amount_lent - debt.amount_collected;

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Valid amount required');
    if (Number(form.amount) > maxAmount) return toast.error('Cannot collect more than owed');
    setLoading(true);
    try { await onSave(form); onClose(); } finally { setLoading(false); }
  };

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Collect Debt</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Collecting from {debt.person_name} (Owes {formatCurrency(maxAmount)})</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Amount Collected (₹) *</label>
              <input className="input-field" type="number" placeholder="0" max={maxAmount} value={form.amount} onChange={update('amount')} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Account Received To</label>
              <select className="select-field" value={form.account_type} onChange={update('account_type')}>
                <option value="Digital">Digital Money</option>
                <option value="Cash">Hot Cash</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>{loading ? 'Saving...' : 'Record Collection'}</button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [modal, setModal] = useState(null); // null | { expense? } | { debt? } | { collection? }
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', { search, category, sortBy, sortOrder, page }],
    queryFn: () => expenseApi.getAll({
      search, category: category === 'All' ? undefined : category,
      sortBy, sortOrder, limit: PAGE_SIZE, offset: page * PAGE_SIZE,
    }).then(r => r.data),
    enabled: activeTab === 'expenses'
  });

  const { data: summaryData } = useQuery({
    queryKey: ['expenses-summary'],
    queryFn: () => expenseApi.getSummary().then(r => r.data),
    enabled: activeTab === 'expenses'
  });

  const { data: debtsData, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => debtApi.getAll().then(r => r.data),
    enabled: activeTab === 'debts'
  });

  const createMutation = useMutation({
    mutationFn: expenseApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Expense added! 💸'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => expenseApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Updated!'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const createDebtMutation = useMutation({
    mutationFn: debtApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['debts'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Debt recorded!'); },
  });

  const updateDebtMutation = useMutation({
    mutationFn: ({ id, data }) => debtApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['debts'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Debt updated!'); },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: debtApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['debts'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Debt deleted!'); },
  });

  const collectDebtMutation = useMutation({
    mutationFn: ({ id, data }) => debtApi.collect(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['debts'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); toast.success('Collection recorded!'); },
  });

  const expenses = data?.expenses || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalThisMonth = summaryData?.totalYear || 0;
  
  const debts = debtsData?.debts || [];

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const SortIcon = ({ field }) => sortBy === field
    ? (sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)
    : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 24 }}>Money Out</h2>
          <p className="section-subtitle">Manage expenses and money lent</p>
        </div>
        {activeTab === 'expenses' ? (
          <button className="btn-primary" onClick={() => setModal({ expense: null })}>
            <Plus size={16} /> Add Expense
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setModal({ debt: null })}>
            <Plus size={16} /> Lend Money
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <button className={activeTab === 'expenses' ? 'btn-primary' : 'btn-ghost'} onClick={() => setActiveTab('expenses')}>
          Day-to-Day Expenses
        </button>
        <button className={activeTab === 'debts' ? 'btn-primary' : 'btn-ghost'} onClick={() => setActiveTab('debts')}>
          Debts (Money Lent)
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <>
          {/* Summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {(summaryData?.byCategory || []).slice(0, 3).map((cat, i) => (
              <div key={i} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 10, height: 32, borderRadius: 4, background: CATEGORY_COLORS[cat.category] || 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(cat.amount)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat.category} ({cat.percentage}%)</div>
                </div>
              </div>
            ))}
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 10, height: 32, borderRadius: 4, background: 'linear-gradient(135deg, var(--primary), var(--accent))', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(totalThisMonth)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total this year</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className="input-field" placeholder="Search expenses..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ paddingLeft: 38, height: 40 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['All', ...EXPENSE_CATEGORIES.slice(0, 6)].map(cat => (
                <button key={cat} onClick={() => { setCategory(cat); setPage(0); }}
                  style={{
                    padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid',
                    background: category === cat ? 'var(--bg-surface)' : 'var(--bg-card)',
                    borderColor: category === cat ? 'var(--border-hover)' : 'var(--border)',
                    color: category === cat ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('title')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Title <SortIcon field="title" /></div>
                    </th>
                    <th>Category</th>
                    <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Amount <SortIcon field="amount" /></div>
                    </th>
                    <th>Account</th>
                    <th onClick={() => handleSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Date <SortIcon field="date" /></div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20, borderRadius: 6 }} /></td></tr>
                    ))
                  ) : expenses.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#475569' }}>
                      <TrendingDown size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                      No expenses found. Add your first expense!
                    </td></tr>
                  ) : (
                    expenses.map((exp, i) => (
                      <tr key={exp.id}>
                        <td data-label="Title" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{exp.title}</td>
                        <td data-label="Category">
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20,
                            fontSize: 12, fontWeight: 500,
                            background: `${CATEGORY_COLORS[exp.category] || '#6366F1'}18`,
                            color: CATEGORY_COLORS[exp.category] || '#818CF8',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: CATEGORY_COLORS[exp.category] || '#6366F1' }} />
                            {exp.category}
                          </span>
                        </td>
                        <td data-label="Amount" style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(exp.amount)}</td>
                        <td data-label="Account">
                          <span style={{ fontSize: 12, fontWeight: 500, color: exp.account_type === 'Cash' ? 'var(--warning)' : 'var(--info)' }}>
                            {exp.account_type || 'Digital'}
                          </span>
                        </td>
                        <td data-label="Date">{formatDate(exp.date)}</td>
                        <td data-label="Actions">
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setModal({ expense: exp })} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--primary)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => { if (confirm('Delete this expense?')) deleteMutation.mutate(exp.id); }}
                              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--danger)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}>
                                <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 14px', fontSize: 13 }}>← Prev</button>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>Page {page + 1} of {totalPages}</span>
                <button className="btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 14px', fontSize: 13 }}>Next →</button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Person Name</th>
                  <th>Amount Lent</th>
                  <th>Collected</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {debtsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20, borderRadius: 6 }} /></td></tr>
                  ))
                ) : debts.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#475569' }}>
                    <HandCoins size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                    No debts recorded. You haven't lent money to anyone.
                  </td></tr>
                ) : (
                  debts.map((debt, i) => {
                    const remaining = debt.amount_lent - debt.amount_collected;
                    return (
                      <tr key={debt.id}>
                        <td data-label="Person Name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{debt.person_name}</td>
                        <td data-label="Amount Lent" style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(debt.amount_lent)}</td>
                        <td data-label="Collected" style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(debt.amount_collected)}</td>
                        <td data-label="Remaining" style={{ fontWeight: 700, color: 'var(--warning)' }}>{formatCurrency(remaining)}</td>
                        <td data-label="Status">
                          {debt.status === 'Settled' ? (
                            <span className="badge badge-success" style={{ display: 'inline-flex', gap: 4 }}><CheckCircle size={12} /> Settled</span>
                          ) : (
                            <span className="badge badge-warning">Pending</span>
                          )}
                        </td>
                        <td data-label="Actions">
                          <div style={{ display: 'flex', gap: 6 }}>
                            {debt.status !== 'Settled' && (
                              <button onClick={() => setModal({ collection: debt })} className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }}>
                                Collect
                              </button>
                            )}
                            <button onClick={() => setModal({ debt })} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--primary)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => { if (confirm('Delete this debt record?')) deleteDebtMutation.mutate(debt.id); }}
                              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--danger)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modal?.expense !== undefined && (
          <ExpenseModal
            expense={modal.expense}
            onClose={() => setModal(null)}
            onSave={(data) => modal.expense
              ? updateMutation.mutateAsync({ id: modal.expense.id, data })
              : createMutation.mutateAsync(data)}
          />
        )}
        {modal?.debt !== undefined && (
          <DebtModal
            debt={modal.debt}
            onClose={() => setModal(null)}
            onSave={(data) => modal.debt
              ? updateDebtMutation.mutateAsync({ id: modal.debt.id, data })
              : createDebtMutation.mutateAsync(data)}
          />
        )}
        {modal?.collection !== undefined && (
          <CollectionModal
            debt={modal.collection}
            onClose={() => setModal(null)}
            onSave={(data) => collectDebtMutation.mutateAsync({ id: modal.collection.id, data })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
