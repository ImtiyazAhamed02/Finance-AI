import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const toggleSidebar = useAppStore(s => s.toggleSidebar);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden', transition: 'background 0.3s ease' }}>
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
          padding: '24px',
          scrollbarWidth: 'thin',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
