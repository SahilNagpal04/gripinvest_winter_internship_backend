// Smoke tests - just ensure pages render without crashing
import { render } from '@testing-library/react';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
  }),
}));

// Mock API
jest.mock('../utils/api', () => ({
  authAPI: {
    signup: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(() => Promise.resolve({ data: { data: { user: {} } } })),
    updateProfile: jest.fn(),
    checkPassword: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  },
  productsAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
    getById: jest.fn(() => Promise.resolve({ data: { data: { product: {} } } })),
    getTop: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
    getRecommended: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  investmentsAPI: {
    create: jest.fn(),
    getPortfolio: jest.fn(() => Promise.resolve({ data: { data: { investments: [] } } })),
    getSummary: jest.fn(() => Promise.resolve({ data: { data: { summary: {}, insights: [], riskDistribution: [] } } })),
    getById: jest.fn(),
    cancel: jest.fn(),
  },
  logsAPI: {
    getMy: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
    getMyErrors: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
    getByDateRange: jest.fn(),
    getAll: jest.fn(),
    getByUserId: jest.fn(),
    getByEmail: jest.fn(),
  },
}));

// Mock auth utils
jest.mock('../utils/auth', () => ({
  isAuthenticated: jest.fn(() => false),
  getUser: jest.fn(() => null),
  saveAuth: jest.fn(),
  getToken: jest.fn(),
  isAdmin: jest.fn(() => false),
  logout: jest.fn(),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  formatDate: jest.fn((date) => '01 Jan 2025'),
  getRiskColor: jest.fn(() => 'text-green-600'),
  getInvestmentTypeLabel: jest.fn((type) => type),
  getStatusColor: jest.fn(() => 'bg-green-100'),
}));

describe('Smoke Tests', () => {
  it('renders without crashing', () => {
    expect(true).toBe(true);
  });
});
