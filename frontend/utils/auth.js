// Authentication utility functions
import { jwtDecode } from 'jwt-decode';

// Save token and user data to localStorage
export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Get token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get user data from localStorage
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Check if user is logged in
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Decode token to check expiration
    const decoded = jwtDecode(token);
    // Check if token is expired
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUser();
  return user?.is_admin === true || user?.is_admin === 1;
};

// Logout user - clear all auth data
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Format currency to Indian Rupees
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date to readable format
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get risk color for UI
export const getRiskColor = (risk) => {
  switch (risk) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'moderate':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Get investment type label
export const getInvestmentTypeLabel = (type) => {
  const labels = {
    bond: 'Bond',
    fd: 'Fixed Deposit',
    mf: 'Mutual Fund',
    etf: 'ETF',
    other: 'Other',
  };
  return labels[type] || type;
};
