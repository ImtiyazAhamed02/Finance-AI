import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const perks = ['Free forever', 'AI-powered insights', 'Secure & encrypted'];

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = form;
    if (!username || !email || !password) return toast.error('Please fill all fields');
    if (username.length < 3) return toast.error('Username must be at least 3 characters');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const { error } = await signUp({ email, password, username, fullName: username });
      if (error) throw error;
      toast.success('Account created! Check your email to confirm, or sign in directly.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#EF4444', '#F59E0B', '#22C55E'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div style={{
      minHeight: '100vh', background: '#050816',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div className="orb" style={{ width: 600, height: 600, background: '#6366F1', top: -200, right: -200, opacity: 0.1 }} />
      <div className="orb" style={{ width: 500, height: 500, background: '#06B6D4', bottom: -150, left: -150, opacity: 0.08 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            }}>
              <Sparkles size={24} color="white" />
            </div>
          </Link>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8' }}>Start your AI-powered financial journey</p>

          {/* Perks */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {perks.map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={12} color="#22C55E" />
                <span style={{ fontSize: 12, color: '#475569' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 24, padding: '32px 28px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.08)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Username */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: 7 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input id="reg-username" type="text" value={form.username} onChange={update('username')} placeholder="yourname" className="input-field" style={{ paddingLeft: 42 }} autoComplete="username" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: 7 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input id="reg-email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="input-field" style={{ paddingLeft: 42 }} autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input id="reg-password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min 6 characters" className="input-field" style={{ paddingLeft: 42, paddingRight: 44 }} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwdStrength ? strengthColors[pwdStrength] : 'rgba(99,102,241,0.1)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColors[pwdStrength] }}>{strengthLabels[pwdStrength]}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: 7 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input id="reg-confirm" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Repeat password" className="input-field" style={{ paddingLeft: 42, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? 'rgba(239,68,68,0.5)' : undefined }} autoComplete="new-password" />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>Passwords don't match</p>
              )}
            </div>

            <motion.button
              type="submit"
              id="reg-submit"
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 6 }}
            >
              {loading ? (
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : 'Create Account 🚀'}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
            <span style={{ fontSize: 14, color: '#475569' }}>Already have an account? </span>
            <Link to="/login" style={{ fontSize: 14, color: '#818CF8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
