import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Brain, ChevronDown } from 'lucide-react';
import { useRef } from 'react';

const features = [
  { icon: Brain, title: 'AI-Powered Insights', desc: 'Get personalized financial advice from Grok AI based on your real spending patterns', color: '#6366F1' },
  { icon: TrendingUp, title: 'Smart Forecasting', desc: 'Predict your savings growth and goal completion dates with AI-powered projections', color: '#06B6D4' },
  { icon: Shield, title: 'Secure & Private', desc: 'Bank-grade encryption with Supabase. Your data is always secure and private', color: '#22C55E' },
  { icon: Zap, title: 'Real-time Tracking', desc: 'Live expense tracking, instant AI insights, and streaming chat responses', color: '#F59E0B' },
];

const stats = [
  { value: '₹2.4L', label: 'Avg savings tracked' },
  { value: '94%', label: 'Accuracy score' },
  { value: '<2s', label: 'AI response time' },
  { value: '10+', label: 'Financial metrics' },
];

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#F8FAFC', overflowX: 'hidden' }}>
      {/* Subtle Background Glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', width: 800, height: 800, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: -300, left: -200 }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', bottom: -100, right: -100 }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', opacity: 0.015, pointerEvents: 'none' }} />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="landing-nav"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Fin<span className="gradient-text">Genius</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/login">
            <button className="btn-ghost">Log in</button>
          </Link>
          <Link to="/register">
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
              Get Started <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero section */}
      <section ref={heroRef} className="landing-hero">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="hero-content"
        >
          <div className="landing-hero-content">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 30, padding: '8px 18px', backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1', animation: 'pulse-glow 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 13, color: '#818CF8', fontWeight: 600, letterSpacing: '0.5px' }}>Intelligent Finance</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(48px, 6vw, 76px)',
                fontWeight: 800,
                lineHeight: 1.05,
                marginBottom: 24,
                letterSpacing: '-2px',
                color: '#FFFFFF'
              }}
            >
              Master your money with <br/>
              <span className="gradient-text">Artificial Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ fontSize: 19, color: '#94A3B8', lineHeight: 1.6, marginBottom: 44, maxWidth: 600 }}
            >
              The most advanced personal finance platform built for modern India. Track, analyze, and grow your wealth automatically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{ display: 'flex', gap: 16, justifyContent: 'center' }}
            >
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '16px 32px', fontSize: 16 }}>
                  Start Free Trial <ArrowRight size={18} />
                </button>
              </Link>
            </motion.div>

            {/* Mini stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="landing-stats-container"
            >
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: '#F8FAFC' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{
            position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
            color: '#64748B', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>Explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* Features section */}
      <section className="landing-features-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: 20, letterSpacing: '-1px', color: '#FFFFFF' }}>
            Built for precision.<br />
            <span style={{ color: '#64748B' }}>Designed for elegance.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              style={{ padding: 36 }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, marginBottom: 24,
                background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
                border: `1px solid rgba(255,255,255,0.05)`,
                boxShadow: `0 8px 16px ${f.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12, color: '#F8FAFC', letterSpacing: '-0.3px' }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="landing-cta-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="landing-cta-card"
        >
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 20, letterSpacing: '-1px', color: '#FFFFFF' }}>
            Elevate your financial future.
          </h2>
          <p style={{ fontSize: 18, color: '#94A3B8', marginBottom: 40, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 40px' }}>
            Join the exclusive platform that combines AI intelligence with breathtaking design.
          </p>
          <Link to="/register">
            <button className="btn-primary" style={{ padding: '18px 40px', fontSize: 16 }}>
              Get Started Now
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>
          FinGenius AI © 2026. Designed for Excellence.
        </p>
      </footer>
    </div>
  );
}
