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
      <div 
        className="stat-card-glow"
        style={{
          background: iconBg || 'rgba(99,102,241,0.3)',
        }} 
      />

      <div className="stat-card-header">
        <div 
          className="stat-card-icon-wrapper"
          style={{
            background: iconBg || 'var(--bg-surface)',
          }}
        >
          {Icon && <Icon className="stat-card-icon" size={20} color={iconBg ? 'white' : 'var(--primary)'} />}
        </div>

        {trend !== undefined && (
          <div 
            className="stat-card-trend"
            style={{
              color: trendColor,
              background: trendNeutral ? 'rgba(148,163,184,0.1)' : trendPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              borderColor: trendNeutral ? 'rgba(148,163,184,0.2)' : trendPositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
            }}
          >
            <TrendIcon size={12} color={trendColor} />
            <span>{Math.abs(Number(trend))}%</span>
          </div>
        )}
      </div>

      <div className="stat-card-value-container">
        <div className="stat-card-value">
          {formatCurrency(count)}
        </div>
      </div>

      <div className="stat-card-title">{title}</div>

      {(trendLabel || subtitle) && (
        <div className="stat-card-subtitle">
          {trendLabel || subtitle}
        </div>
      )}
    </motion.div>
  );
}
