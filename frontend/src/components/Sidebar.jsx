import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, TrendingDown, Target,
  MessageSquare, Heart, Settings, LogOut, ChevronLeft,
  ChevronRight, Sparkles, Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/health', icon: Heart, label: 'Health Score' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <aside
      className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100dvh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1050,
        transition: 'width 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, border-color 0.3s ease',
        width: sidebarOpen ? 260 : 72,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', transition: 'border-color 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            <Wallet size={20} color="white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Fin<span style={{ color: 'var(--primary)' }}>Genius</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 1, marginTop: -2 }}>AI ADVISOR</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={toggleSidebar}
        className="desktop-only"
        style={{
          position: 'absolute',
          top: 30,
          right: sidebarOpen ? 16 : -12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          zIndex: 10,
          boxShadow: 'var(--shadow-sm)',
          transition: 'right 0.3s ease',
        }}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>



      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 8px 10px' }}
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (window.innerWidth <= 768) {
                  useAppStore.getState().setSidebarOpen(false);
                }
              }}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={!sidebarOpen ? label : undefined}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', paddingLeft: sidebarOpen ? 16 : 0 }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </div>


      </nav>

      {/* User section */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', transition: 'border-color 0.3s ease' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px', borderRadius: 12,
          background: 'var(--bg-card)',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white',
          }}>
            {initials}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {username}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
