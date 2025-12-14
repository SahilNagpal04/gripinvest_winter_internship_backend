// API utility functions - handles all backend communication
import axios from 'axios';

// Base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically if user is logged in
api.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    // Add token to Authorization header
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // User signup
  signup: (data) => api.post('/auth/signup', data),
  // Verify signup OTP
  verifySignup: (data) => api.post('/auth/verify-signup', data),
  // User login
  login: (data) => api.post('/auth/login', data),
  // Verify login 2FA OTP
  verifyLogin: (data) => api.post('/auth/verify-login', data),
  // Resend OTP
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  // Update user profile
  updateProfile: (data) => api.put('/auth/profile', data),
  // Check password strength
  checkPassword: (password) => api.post('/auth/check-password', { password }),
  // Request password reset OTP
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  // Reset password with OTP
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Products API calls
export const productsAPI = {
  // Get all products with optional filters
  getAll: (params) => api.get('/products', { params }),
  // Get single product by ID
  getById: (id) => api.get(`/products/${id}`),
  // Get top performing products
  getTop: () => api.get('/products/top'),
  // Get recommended products for logged-in user
  getRecommended: () => api.get('/products/recommended/me'),
  // Create new product (admin only)
  create: (data) => api.post('/products', data),
  // Update product (admin only)
  update: (id, data) => api.put(`/products/${id}`, data),
  // Delete product (admin only)
  delete: (id) => api.delete(`/products/${id}`),
};

// Investments API calls
export const investmentsAPI = {
  // Create new investment
  create: (data) => api.post('/investments', data),
  // Get user's portfolio
  getPortfolio: () => api.get('/investments/portfolio'),
  // Get portfolio summary with AI insights
  getSummary: () => api.get('/investments/portfolio/summary'),
  // Get single investment by ID
  getById: (id) => api.get(`/investments/${id}`),
  // Cancel investment
  cancel: (id) => api.delete(`/investments/${id}`),
};

// Logs API calls
export const logsAPI = {
  // Get current user's logs
  getMy: () => api.get('/logs/me'),
  // Get current user's error logs
  getMyErrors: () => api.get('/logs/me/errors'),
  // Get logs by date range
  getByDateRange: (startDate, endDate) => 
    api.get('/logs/date-range', { params: { startDate, endDate } }),
  // Get all logs (admin only)
  getAll: () => api.get('/logs'),
  // Get logs by user ID (admin only)
  getByUserId: (userId) => api.get(`/logs/user/${userId}`),
  // Get logs by email (admin only)
  getByEmail: (email) => api.get(`/logs/email/${email}`),
};

// Transactions API calls
export const transactionsAPI = {
  getTransactions: (params) => api.get('/transactions', { params }).then(res => res.data),
  getById: (id) => api.get(`/transactions/${id}`).then(res => res.data),
  getSummary: () => api.get('/transactions/summary').then(res => res.data),
};

export default api;
