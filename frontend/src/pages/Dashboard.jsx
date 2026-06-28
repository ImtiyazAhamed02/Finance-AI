import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, Activity, RefreshCw, Sparkles, Wallet, Smartphone, Landmark, FileText } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Area, AreaChart, Legend,
} from 'recharts';
import { dashboardApi, aiApi } from '../api/client';
import StatCard from '../components/StatCard';
import AIInsightCard from '../components/AIInsightCard';
import { formatCurrency, CHART_COLORS, CATEGORY_COLORS } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-md)' }}>
      {label && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: p.color || 'var(--text-primary)', fontWeight: 600, margin: '3px 0' }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{payload[0].name}</p>
      <p style={{ fontSize: 13, color: payload[0].payload.fill || 'var(--primary)' }}>{formatCurrency(payload[0].value)} ({payload[0].payload.percentage}%)</p>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  const { data: dashData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then(r => r.data),
  });

  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiApi.getInsights(true).then(r => r.data), // Always fetch fresh on load or refresh
  });

  const summary = dashData?.summary || {};
  const charts = dashData?.charts || {};

  const pieData = (charts.expensesByCategory || []).map((c, i) => ({
    name: c.name, value: c.value, percentage: c.percentage,
    fill: CATEGORY_COLORS[c.name] || CHART_COLORS[i % CHART_COLORS.length],
  }));

  const monthlyData = charts.monthlyData || [];
  const insights = insightsData?.insights || [];

  const healthScore = summary.healthScore || 0;
  const healthColor = healthScore >= 80 ? '#22C55E' : healthScore >= 60 ? '#06B6D4' : healthScore >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {username} 👋
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Here's your financial overview for {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => { refetch(); refetchInsights(); }} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 20 }} />
          ))
        ) : (
          <>
            <StatCard title="Total Balance" value={summary.totalBalance || 0} icon={Landmark}
              iconBg="rgba(139,92,246,0.3)" subtitle="Hot Cash + Digital" delay={0} />
            <StatCard title="Hot Cash" value={summary.hotCash || 0} icon={Wallet}
              iconBg="rgba(234,179,8,0.3)" subtitle="Cash in hand" delay={0.04} />
            <StatCard title="Digital Money" value={summary.digitalBalance || 0} icon={Smartphone}
              iconBg="rgba(56,189,248,0.3)" subtitle="Bank & Wallets" delay={0.08} />
            <StatCard title="Debts to Collect" value={summary.outstandingDebt || 0} icon={FileText}
              iconBg="rgba(244,63,94,0.3)" subtitle="Money lent out" delay={0.12} />
              
            <StatCard title="Total Income" value={summary.totalIncome || 0} icon={TrendingUp}
              iconBg="rgba(34,197,94,0.3)" trend={summary.incomeTrend}
              trendLabel={`vs last month`} delay={0.16} />
            <StatCard title="Total Expenses" value={summary.totalExpenses || 0} icon={TrendingDown}
              iconBg="rgba(239,68,68,0.3)" trend={summary.expenseTrend}
              trendLabel={`vs last month`} delay={0.20} />
            <StatCard title="Net Savings" value={Math.max(0, summary.savings || 0)} icon={PiggyBank}
              iconBg="rgba(99,102,241,0.3)" subtitle={`${summary.savingsRate || 0}% savings rate`} delay={0.24} />
            <div className="stat-card">
              <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: healthColor, filter: 'blur(40px)', opacity: 0.25, top: -20, right: -20 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${healthColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${healthColor}30` }}>
                  <Activity size={20} color={healthColor} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: healthColor, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>
                {healthScore}<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Financial Health</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                {healthScore >= 80 ? '🏆 Excellent' : healthScore >= 60 ? '✅ Good' : healthScore >= 40 ? '⚠️ Fair' : '🔴 Needs Attention'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Monthly Trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 className="section-title">Monthly Trend</h3>
            <p className="section-subtitle">Income vs Expense (last 6 months)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#22C55E" fill="url(#incomeGrad)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 className="section-title">Expense Breakdown</h3>
            <p className="section-subtitle">By category this month</p>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
              No expense data yet
            </div>
          )}
        </div>
      </div>

      {/* Savings bar chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 className="section-title">Savings Overview</h3>
          <p className="section-subtitle">Monthly savings trend</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="savings" name="Savings" radius={[6, 6, 0, 0]}>
              {monthlyData.map((entry, i) => (
                <Cell key={i} fill={entry.savings >= 0 ? '#6366F1' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="var(--primary)" />
          </div>
          <div>
            <h3 className="section-title" style={{ marginBottom: 0 }}>AI Insights</h3>
            <p className="section-subtitle">Personalized recommendations from AI Advisor</p>
          </div>
        </div>

        {insightsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
          </div>
        ) : insights.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {insights.slice(0, 4).map((ins, i) => (
              <AIInsightCard key={ins.id || i} insight={ins} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={32} color="var(--primary)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>Add your income and expenses to get personalized AI insights</p>
          </div>
        )}
      </div>
    </div>
  );
}
