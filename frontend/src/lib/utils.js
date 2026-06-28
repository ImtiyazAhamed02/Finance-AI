// Format currency in INR
export const formatCurrency = (amount, compact = false) => {
  const num = Number(amount) || 0;
  if (compact && num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (compact && num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (compact && num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// Format relative time
export const formatRelative = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

// Get month name
export const getMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
};

// Calculate percentage
export const calcPercent = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Get trend color
export const getTrendColor = (value, inverse = false) => {
  if (value > 0) return inverse ? '#EF4444' : '#22C55E';
  if (value < 0) return inverse ? '#22C55E' : '#EF4444';
  return '#94A3B8';
};

// Category colors
export const CATEGORY_COLORS = {
  Food: '#F59E0B',
  Rent: '#6366F1',
  Shopping: '#EC4899',
  Travel: '#06B6D4',
  Bills: '#8B5CF6',
  Entertainment: '#F97316',
  Health: '#22C55E',
  Education: '#3B82F6',
  Investment: '#10B981',
  Other: '#94A3B8',
  Salary: '#22C55E',
  Freelance: '#06B6D4',
  Business: '#6366F1',
  'Rental Income': '#F59E0B',
};

export const EXPENSE_CATEGORIES = [
  'Food', 'Rent', 'Shopping', 'Travel', 'Bills',
  'Entertainment', 'Health', 'Education', 'Other',
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Rental Income',
  'Investment', 'Gift', 'Initial Balance', 'Other',
];

export const PAYMENT_METHODS = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'Other'];

// Clamp value
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Generate chart colors
export const CHART_COLORS = [
  '#6366F1', '#06B6D4', '#F59E0B', '#22C55E', '#EC4899',
  '#8B5CF6', '#F97316', '#3B82F6', '#10B981', '#94A3B8',
];
