import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const typeConfig = {
  warning: { border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.08)', badge: '#F59E0B', badgeBg: 'rgba(245,158,11,0.12)' },
  tip: { border: 'rgba(99,102,241,0.3)', glow: 'rgba(99,102,241,0.06)', badge: '#818CF8', badgeBg: 'rgba(99,102,241,0.12)' },
  achievement: { border: 'rgba(34,197,94,0.3)', glow: 'rgba(34,197,94,0.06)', badge: '#22C55E', badgeBg: 'rgba(34,197,94,0.12)' },
  goal: { border: 'rgba(6,182,212,0.3)', glow: 'rgba(6,182,212,0.06)', badge: '#06B6D4', badgeBg: 'rgba(6,182,212,0.12)' },
  spending: { border: 'rgba(239,68,68,0.25)', glow: 'rgba(239,68,68,0.06)', badge: '#EF4444', badgeBg: 'rgba(239,68,68,0.12)' },
};

export default function AIInsightCard({ insight, index = 0 }) {
  const { type = 'tip', title, content, icon = '💡', priority } = insight;
  const config = typeConfig[type] || typeConfig.tip;

  return (
    <motion.div
      className="insight-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      style={{ borderColor: config.border }}
    >
      {/* Glow background */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        background: `radial-gradient(circle at top left, ${config.glow}, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: config.badgeBg,
          border: `1px solid ${config.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h4>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
              padding: '2px 8px', borderRadius: 20,
              background: config.badgeBg, color: config.badge,
            }}>
              {type}
            </span>
            {priority === 'high' && (
              <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 600 }}>• HIGH</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{content}</p>
        </div>
      </div>

      {/* AI badge */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 10,
        border: '1px solid var(--border)'
      }}>
        <Sparkles size={10} color="var(--primary)" />
        <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>AI</span>
      </div>
    </motion.div>
  );
}
