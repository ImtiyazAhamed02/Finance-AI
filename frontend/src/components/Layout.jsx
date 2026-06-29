import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const toggleSidebar = useAppStore(s => s.toggleSidebar);

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh', width: '100%', background: 'var(--bg-primary)', overflow: 'hidden', transition: 'background 0.3s ease' }}>
      {/* Background orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: 'var(--primary)', top: -200, left: -200 }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'var(--accent)', bottom: -100, right: -100 }} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-only"
          onClick={toggleSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1040, backdropFilter: 'blur(4px)' }}
        />
      )}

      <Sidebar />

      <div className={`layout-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Topbar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '24px 24px 12px 24px',
          scrollbarWidth: 'thin',
        }}>
          <div key={location.pathname}>
              <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
}
