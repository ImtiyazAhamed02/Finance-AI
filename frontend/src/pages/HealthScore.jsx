import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { aiApi } from '../api/client';
import HealthGauge from '../components/HealthGauge';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, TrendingDown, Shield, Target, PiggyBank, Sparkles, RefreshCw } from 'lucide-react';

const factorData = [
  { key: 'savingsRate', label: 'Savings Rate', icon: PiggyBank, color: '#22C55E', max: 40, desc: 'Higher savings rate = better score (max 40 pts)' },
  { key: 'expenseRatio', label: 'Expense Control', icon: TrendingDown, color: '#06B6D4', max: 30, desc: 'Lower expense-to-income ratio = better score (max 30 pts)' },
  { key: 'goals', label: 'Goal Setting', icon: Target, color: '#6366F1', max: 20, desc: 'Having active goals earns up to 20 pts' },
  { key: 'emergencyFund', label: 'Emergency Fund', icon: Shield, color: '#F59E0B', max: 10, desc: '3+ months of expenses saved = 10 pts' },
];

function ScoreFactor({ label, icon: Icon, color, value, max, desc }) {
  const progress = Math.min((value / max) * 100, 100);
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} style={{
      background: 'var(--bg-card)', borderRadius: 14, padding: '16px 20px',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{desc}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'Outfit'" }}>
          {Math.round(value)}<span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>/{max}</span>
        </div>
      </div>
      <div className="progress-bar" style={{ height: 6 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </motion.div>
  );
}

export default function HealthScore() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['health-score'],
    queryFn: () => aiApi.getHealthScore().then(r => r.data),
  });

  const score = data?.score || 0;
  const breakdown = data?.breakdown || {};
  const rating = data?.rating || 'N/A';
  const explanation = data?.explanation || '';

  // Estimate factor scores
  const savingsRateScore = Math.min(Number(breakdown.savingsRate || 0) * 2, 40);
  const expenseRatioScore = breakdown.totalIncome > 0
    ? Math.max(0, 30 - ((breakdown.totalExpenses / breakdown.totalIncome) * 30))
    : 0;
  const goalsScore = breakdown.totalIncome > 0 ? 20 : 5;
  const emergencyScore = score - savingsRateScore - expenseRatioScore - goalsScore;

  const factors = [
    { ...factorData[0], value: savingsRateScore },
    { ...factorData[1], value: expenseRatioScore },
    { ...factorData[2], value: goalsScore },
    { ...factorData[3], value: Math.max(0, emergencyScore) },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 24 }}>Financial Health Score</h2>
          <p className="section-subtitle">AI-powered analysis of your financial wellbeing</p>
        </div>
        <button onClick={() => refetch()} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Recalculate
        </button>
      </div>

      {/* Main gauge card */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '40px 32px', marginBottom: 24, textAlign: 'center' }}>
        {isLoading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 16, maxWidth: 280, margin: '0 auto' }} />
        ) : (
          <>
            <HealthGauge score={score} size={280} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ maxWidth: 500, margin: '20px auto 0' }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '6px 16px',
              }}>
                <Sparkles size={14} color="var(--primary)" />
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>AI Analysis</span>
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{explanation}</p>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Monthly Income', value: formatCurrency(breakdown.totalIncome || 0), color: '#22C55E', icon: TrendingUp },
          { label: 'Monthly Expenses', value: formatCurrency(breakdown.totalExpenses || 0), color: '#EF4444', icon: TrendingDown },
          { label: 'Net Savings', value: formatCurrency(breakdown.savings || 0), color: '#818CF8', icon: PiggyBank },
          { label: 'Emergency Fund', value: `${breakdown.emergencyFundMonths || 0} months`, color: '#F59E0B', icon: Shield },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="glass-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ padding: '18px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <item.icon size={16} color={item.color} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: item.color, fontFamily: "'Outfit'" }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Score factors */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ padding: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 4 }}>Score Breakdown</h3>
        <p className="section-subtitle" style={{ marginBottom: 20 }}>How your {score} points are calculated</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {factors.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <ScoreFactor {...f} />
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Score</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', fontFamily: "'Outfit'" }}>{score}/100</span>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: 20, padding: '20px 24px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>Tips to Improve Your Score</span>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            score < 80 && '💡 Aim to save at least 20% of your monthly income',
            score < 60 && '📊 Keep expenses below 70% of your income',
            !breakdown.goals && '🎯 Set at least one savings goal to earn bonus points',
            (breakdown.emergencyFundMonths || 0) < 3 && '🛡️ Build an emergency fund of 3-6 months of expenses',
            '📈 Consider investing in SIP or PPF for long-term growth',
          ].filter(Boolean).slice(0, 4).map((tip, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ flexShrink: 0 }}>→</span> {tip}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
