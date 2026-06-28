import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Lock, Save, Sparkles, Bell, Shield, Palette, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color="#818CF8" />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [profileForm, setProfileForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPwd: '', newPwd: '', confirmPwd: '' });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: initialBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['initial-balances'],
    queryFn: () => authApi.getInitialBalances().then(r => r.data),
  });

  const [balancesForm, setBalancesForm] = useState({ cash: 0, digital: 0 });

  // Update form when data loads
  useEffect(() => {
    if (initialBalances) {
      setBalancesForm({
        cash: initialBalances.cash || 0,
        digital: initialBalances.digital || 0
      });
    }
  }, [initialBalances]);

  const updateBalancesMutation = useMutation({
    mutationFn: authApi.updateInitialBalances,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initial-balances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Balances updated successfully!');
    },
    onError: () => toast.error('Failed to update balances'),
  });

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initials = username.slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({ full_name: profileForm.full_name });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.newPwd || pwdForm.newPwd.length < 6) return toast.error('Password must be at least 6 characters');
    if (pwdForm.newPwd !== pwdForm.confirmPwd) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdForm.newPwd });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setPwdForm({ currentPwd: '', newPwd: '', confirmPwd: '' });
    } catch (err) { toast.error(err.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-title" style={{ fontSize: 24 }}>Settings</h2>
        <p className="section-subtitle">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <SettingsSection title="Profile" icon={User}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
            boxShadow: '0 0 24px rgba(99,102,241,0.4)',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{username}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Member since {new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
            <input className="input-field" placeholder="Your full name" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
            <input className="input-field" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
          </div>
          <button onClick={handleSaveProfile} className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </SettingsSection>

      {/* Initial Balances */}
      <SettingsSection title="Initial Balances" icon={Landmark}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Set the starting amount you already have. This is added to your total balance on the Dashboard.
          </p>
        </div>
        {balancesLoading ? (
          <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Hot Cash (₹)</label>
                <input className="input-field" type="number" value={balancesForm.cash} onChange={e => setBalancesForm(f => ({ ...f, cash: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Digital Money (₹)</label>
                <input className="input-field" type="number" value={balancesForm.digital} onChange={e => setBalancesForm(f => ({ ...f, digital: e.target.value }))} />
              </div>
            </div>
            <button onClick={() => updateBalancesMutation.mutate(balancesForm)} className="btn-primary" disabled={updateBalancesMutation.isPending} style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
              <Save size={14} /> {updateBalancesMutation.isPending ? 'Saving...' : 'Save Balances'}
            </button>
          </div>
        )}
      </SettingsSection>

      {/* Security */}
      <SettingsSection title="Security" icon={Lock}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>New Password</label>
            <input className="input-field" type="password" placeholder="Min 6 characters" value={pwdForm.newPwd} onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
            <input className="input-field" type="password" placeholder="Repeat password" value={pwdForm.confirmPwd} onChange={e => setPwdForm(f => ({ ...f, confirmPwd: e.target.value }))} />
          </div>
          <button onClick={handleChangePassword} className="btn-secondary" disabled={saving} style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
            <Lock size={14} /> Change Password
          </button>
        </div>
      </SettingsSection>

      {/* App info */}
      <SettingsSection title="About FinGenius AI" icon={Sparkles}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'AI Model', value: 'Grok API' },
            { label: 'Database', value: 'Supabase PostgreSQL' },
            { label: 'Frontend', value: 'React + Vite' },
          ].map(item => (
            <div key={item.label} style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '20px 24px', borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--danger)', marginBottom: 12 }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Signing out will end your current session. Your data is safely stored in the cloud.
        </p>
        <button onClick={signOut} className="btn-danger">
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
