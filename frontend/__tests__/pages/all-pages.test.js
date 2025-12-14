// Comprehensive rendering tests for all pages
import { render, screen, waitFor } from '@testing-library/react';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { id: '1' },
    pathname: '/',
  }),
}));

// Mock API
jest.mock('../../utils/api', () => ({
  authAPI: {
    signup: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    login: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    getProfile: jest.fn(() => Promise.resolve({ data: { data: { user: { email: 'test@test.com', first_name: 'Test', last_name: 'User', balance: 10000, risk_appetite: 'moderate' } } } })),
    updateProfile: jest.fn(),
    checkPassword: jest.fn(() => Promise.resolve({ data: { data: { strength: 'strong' } } })),
    requestPasswordReset: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    resetPassword: jest.fn(() => Promise.resolve({ data: { data: {} } })),
  },
  productsAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: { data: { products: [{ id: 1, name: 'Test Product', investment_type: 'bond', risk_level: 'low', annual_yield: 7.5, tenure_months: 12, min_investment: 5000 }] } } })),
    getById: jest.fn(() => Promise.resolve({ data: { data: { product: { id: 1, name: 'Test Product', description: 'Test', investment_type: 'bond', risk_level: 'low', annual_yield: 7.5, tenure_months: 12, min_investment: 5000 } } } })),
    getTop: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
    getRecommended: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
  },
  investmentsAPI: {
    getPortfolio: jest.fn(() => Promise.resolve({ data: { data: { investments: [{ id: 1, product_name: 'Test', amount: 10000, expected_return: 10750, status: 'active', maturity_date: '2025-12-31', risk_level: 'low' }] } } })),
    getSummary: jest.fn(() => Promise.resolve({ data: { data: { summary: { total_invested: 10000, current_value: 10750, total_gains: 750, total_investments: 1 }, insights: ['Good'], riskDistribution: [] } } })),
  },
  logsAPI: {
    getMy: jest.fn(() => Promise.resolve({ data: { data: { logs: [{ id: 1, endpoint: '/api/test', http_method: 'GET', status_code: 200, created_at: '2025-01-01' }] } } })),
    getMyErrors: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
  },
}));

// Mock auth utils
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(() => true),
  getUser: jest.fn(() => ({ id: 1, email: 'test@example.com' })),
  saveAuth: jest.fn(),
  getToken: jest.fn(() => 'token'),
  isAdmin: jest.fn(() => false),
  logout: jest.fn(),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  formatDate: jest.fn((date) => '01 Jan 2025'),
  getRiskColor: jest.fn(() => 'text-green-600'),
  getInvestmentTypeLabel: jest.fn((type) => type),
  getStatusColor: jest.fn(() => 'bg-green-100'),
}));

// Mock Recharts
jest.mock('recharts', () => ({
  PieChart: () => <div>PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Legend: () => <div>Legend</div>,
  Tooltip: () => <div>Tooltip</div>,
}));

describe('All Pages Rendering', () => {
  it('dashboard renders', async () => {
    const Dashboard = require('../../pages/dashboard').default;
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });

  it('products renders', async () => {
    const Products = require('../../pages/products').default;
    render(<Products />);
    await waitFor(() => {
      expect(screen.getByText(/Investment Products/i)).toBeInTheDocument();
    });
  });

  it('portfolio renders', async () => {
    const Portfolio = require('../../pages/portfolio').default;
    render(<Portfolio />);
    await waitFor(() => {
      expect(screen.getByText(/My Portfolio/i)).toBeInTheDocument();
    });
  });

  it('logs renders', async () => {
    const Logs = require('../../pages/logs').default;
    render(<Logs />);
    await waitFor(() => {
      expect(screen.getByText(/Transaction Logs/i)).toBeInTheDocument();
    });
  });

  it('profile renders', async () => {
    const Profile = require('../../pages/profile').default;
    render(<Profile />);
    await waitFor(() => {
      const elements = screen.queryAllByText(/Profile/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
