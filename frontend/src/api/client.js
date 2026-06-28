import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach Supabase JWT token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Dashboard ───────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

// ─── Income ───────────────────────────────────────────────
export const incomeApi = {
  getAll: (params) => api.get('/income', { params }),
  getSummary: (params) => api.get('/income/summary', { params }),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
};

// ─── Expenses ─────────────────────────────────────────────
export const expenseApi = {
  getAll: (params) => api.get('/expenses', { params }),
  getSummary: (params) => api.get('/expenses/summary', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// ─── Goals ────────────────────────────────────────────────
export const goalApi = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  contribute: (id, amount) => api.patch(`/goals/${id}/contribute`, { amount }),
  delete: (id) => api.delete(`/goals/${id}`),
};

// ─── AI ───────────────────────────────────────────────────
export const aiApi = {
  getInsights: (force = false) => api.get('/ai/insights', { params: { force } }),
  getHealthScore: () => api.get('/ai/health-score'),
  getForecast: () => api.get('/ai/forecast'),
  getChatHistory: () => api.get('/ai/chat/history'),
  saveAIMessage: (data) => api.post('/ai/chat/save', data),
};

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getInitialBalances: () => api.get('/auth/initial-balances'),
  updateInitialBalances: (data) => api.put('/auth/initial-balances', data),
};

// ─── Debts ────────────────────────────────────────────────
export const debtApi = {
  getAll: () => api.get('/debts'),
  getCollections: (id) => api.get(`/debts/${id}/collections`),
  create: (data) => api.post('/debts', data),
  update: (id, data) => api.put(`/debts/${id}`, data),
  collect: (id, data) => api.post(`/debts/${id}/collect`, data),
  delete: (id) => api.delete(`/debts/${id}`),
};

export default api;
