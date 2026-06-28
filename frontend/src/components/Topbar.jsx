import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';

const pageNames = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/income': 'Income',
  '/goals': 'Goals',
  '/chat': 'AI Chat',
  '/health': 'Health Score',
  '/settings': 'Settings',
};

export default function Topbar() {
  const location = useLocation();
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const theme = useAppStore(s => s.theme);
  const toggleTheme = useAppStore(s => s.toggleTheme);
  const { user } = useAuth();
  const pageName = pageNames[location.pathname] || 'FinGenius AI';
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  return (
    <header style={{
      height: 64,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px 0 32px',
      gap: 16,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Mobile Hamburger */}
      <button 
        className="mobile-only"
        onClick={toggleSidebar}
        style={{
          background: 'transparent', border: 'none', color: 'var(--text-primary)',
          cursor: 'pointer', padding: 4, display: 'none', /* will be overridden by .mobile-only via !important */
        }}
      >
        <Menu size={24} />
      </button>

      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
          {pageName}
        </h1>
      </div>


      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 9, cursor: 'pointer', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {username.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
