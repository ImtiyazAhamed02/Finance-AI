import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

function useCountUp(target, duration = 1500) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef();
  const startRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

export default function StatCard({ title, value, icon: Icon, iconBg, trend, trendLabel, subtitle, delay = 0 }) {
  const count = useCountUp(Number(value) || 0);

  const trendPositive = Number(trend) > 0;
  const trendNeutral = Number(trend) === 0 || trend === undefined;
  const TrendIcon = trendNeutral ? Minus : trendPositive ? TrendingUp : TrendingDown;
  const trendColor = trendNeutral ? 'var(--text-muted)' : trendPositive ? 'var(--success)' : 'var(--danger)';

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', width: 100, height: 100, borderRadius: '50%',
        background: iconBg || 'rgba(99,102,241,0.3)',
        filter: 'blur(40px)', opacity: 0.3, top: -20, right: -20, pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: iconBg || 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border)',
        }}>
          {Icon && <Icon size={20} color={iconBg ? 'white' : 'var(--primary)'} />}
        </div>

        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 20,
            background: trendNeutral ? 'rgba(148,163,184,0.1)' : trendPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${trendNeutral ? 'rgba(148,163,184,0.2)' : trendPositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <TrendIcon size={12} color={trendColor} />
            <span style={{ fontSize: 12, fontWeight: 600, color: trendColor }}>
              {Math.abs(Number(trend))}%
            </span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px' }}>
          {formatCurrency(count)}
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>

      {(trendLabel || subtitle) && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          {trendLabel || subtitle}
        </div>
      )}
    </motion.div>
  );
}
