import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function HealthGauge({ score = 0, size = 200 }) {
  const canvasRef = useRef(null);

  const getColor = (s) => {
    if (s >= 80) return '#22C55E';
    if (s >= 60) return '#06B6D4';
    if (s >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getRating = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Poor';
  };

  const color = getColor(score);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = size * 0.85;
    const cx = w / 2;
    const cy = h / 2 + 15;
    const radius = (w / 2) - 20;
    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const totalAngle = endAngle - startAngle;

    ctx.clearRect(0, 0, w, h);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(99,102,241,0.1)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = startAngle + (totalAngle * i / 10);
      const innerR = radius - 18;
      const outerR = radius - 8;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.15)';
      ctx.lineWidth = i % 2 === 0 ? 2 : 1;
      ctx.stroke();
    }

    // Score arc with gradient
    if (score > 0) {
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      if (score >= 80) {
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(1, '#22C55E');
      } else if (score >= 60) {
        gradient.addColorStop(0, '#0EA5E9');
        gradient.addColorStop(1, '#06B6D4');
      } else if (score >= 40) {
        gradient.addColorStop(0, '#D97706');
        gradient.addColorStop(1, '#F59E0B');
      } else {
        gradient.addColorStop(0, '#DC2626');
        gradient.addColorStop(1, '#EF4444');
      }

      const scoreAngle = startAngle + (totalAngle * score / 100);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Needle tip glow
      const glowX = cx + radius * Math.cos(scoreAngle);
      const glowY = cy + radius * Math.sin(scoreAngle);
      const grd = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 12);
      grd.addColorStop(0, color + 'aa');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(glowX, glowY, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(glowX, glowY, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [score]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size * 0.85 }}>
        <canvas ref={canvasRef} width={size} height={size * 0.85} style={{ display: 'block' }} />
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={{
              fontSize: size / 5, fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              color, lineHeight: 1,
              textShadow: `0 0 20px ${color}66`,
            }}
          >
            {score}
          </motion.div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>out of 100</div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          padding: '6px 20px', borderRadius: 20,
          background: `${color}15`, border: `1px solid ${color}40`,
          color, fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
        }}
      >
        {getRating(score)}
      </motion.div>
    </div>
  );
}
