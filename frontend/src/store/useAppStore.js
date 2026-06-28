import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Theme
  theme: localStorage.getItem('theme') || 'dark',
  toggleTheme: () => set(s => {
    const newTheme = s.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),

  // Sidebar
  sidebarOpen: window.innerWidth > 768,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  // Dashboard data
  dashboardData: null,
  setDashboardData: (data) => set({ dashboardData: data }),

  // Active month/year filter
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  setSelectedMonth: (m) => set({ selectedMonth: m }),
  setSelectedYear: (y) => set({ selectedYear: y }),

  // Chat session
  chatSessionId: crypto.randomUUID(),
  newChatSession: () => set({ chatSessionId: crypto.randomUUID() }),

  // Notifications
  notifications: [],
  addNotification: (notif) => set(s => ({
    notifications: [{ id: Date.now(), ...notif }, ...s.notifications].slice(0, 5),
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
