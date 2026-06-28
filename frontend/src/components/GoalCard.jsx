import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/utils';
import { CheckCircle, Target } from 'lucide-react';

const priorityColors = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

export default function GoalCard({ goal, onContribute, onEdit, onDelete, index = 0 }) {
  const {
    title, target_amount, current_amount, category,
    description, target_date, priority, icon, is_completed,
  } = goal;

  const progress = Math.min((current_amount / target_amount) * 100, 100);
  const remaining = target_amount - current_amount;
  const isCompleted = is_completed || progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{
        background: isCompleted
          ? 'linear-gradient(135deg, rgba(34,197,94,0.08), var(--bg-card))'
          : 'var(--bg-card)',
        border: isCompleted
          ? '1px solid rgba(34,197,94,0.3)'
          : '1px solid var(--border)',
        borderRadius: 20,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
    >
      {isCompleted && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #22C55E, #10B981)',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: isCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.12)',
            border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            {icon || '🎯'}
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>{title}</h3>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{category}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isCompleted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={16} color="#22C55E" />
              <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>Completed!</span>
            </div>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
              padding: '3px 8px', borderRadius: 8,
              color: priorityColors[priority] || '#94A3B8',
              background: `${priorityColors[priority]}15` || 'rgba(148,163,184,0.1)',
            }}>
              {priority}
            </span>
          )}
        </div>
      </div>

      {description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{description}</p>
      )}

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {formatCurrency(current_amount)} saved
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isCompleted ? 'var(--success)' : 'var(--primary)' }}>
            {progress.toFixed(0)}%
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.1 }}
            style={{
              background: isCompleted
                ? 'linear-gradient(90deg, #22C55E, #10B981)'
                : 'linear-gradient(90deg, #6366F1, #06B6D4)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {isCompleted ? 'Goal reached!' : `${formatCurrency(remaining)} remaining`}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Target: {formatCurrency(target_amount)}
          </span>
        </div>
      </div>

      {target_date && !isCompleted && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          📅 Target date: {formatDate(target_date)}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {!isCompleted && (
          <button
            onClick={() => onContribute?.(goal)}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '9px 16px', fontSize: 13 }}
          >
            <Target size={14} /> Add Funds
          </button>
        )}
        <button onClick={() => onEdit?.(goal)} className="btn-ghost" style={{ padding: '9px 14px', fontSize: 13, flex: isCompleted ? 1 : 'none' }}>
          Edit
        </button>
        <button onClick={() => onDelete?.(goal.id)} className="btn-danger" style={{ padding: '9px 14px', fontSize: 13 }}>
          ✕
        </button>
      </div>
    </motion.div>
  );
}
