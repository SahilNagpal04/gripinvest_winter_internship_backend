// Integration tests to boost coverage
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Setup mocks
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
  }),
}));

const mockAPI = {
  authAPI: {
    login: jest.fn(() => Promise.resolve({ data: { data: { token: 'token', user: { id: 1 } } } })),
    signup: jest.fn(() => Promise.resolve({ data: { data: { token: 'token', user: { id: 1 } } } })),
    getProfile: jest.fn(() => Promise.resolve({ data: { data: { user: { email: 'test@test.com', first_name: 'Test', balance: 10000 } } } })),
    updateProfile: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    checkPassword: jest.fn(() => Promise.resolve({ data: { data: { strength: 'strong', suggestions: [] } } })),
    requestPasswordReset: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    resetPassword: jest.fn(() => Promise.resolve({ data: { data: {} } })),
  },
  productsAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: { data: { products: [
      { id: 1, name: 'Test Bond', type: 'bond', yield: 10, risk_level: 'Low', min_investment: 1000 }
    ] } } })),
    getById: jest.fn(() => Promise.resolve({ data: { data: { product: { id: 1, name: 'Test Bond', type: 'bond' } } } })),
    getRecommended: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
  },
  investmentsAPI: {
    getPortfolio: jest.fn(() => Promise.resolve({ data: { data: { investments: [
      { id: 1, product_name: 'Test Investment', amount: 10000, status: 'active' }
    ] } } })),
    getSummary: jest.fn(() => Promise.resolve({ data: { data: { 
      summary: { totalValue: 10000, totalInvested: 9000, totalReturns: 1000 },
      insights: ['Good portfolio'],
      riskDistribution: []
    } } })),
  },
  logsAPI: {
    getMy: jest.fn(() => Promise.resolve({ data: { data: { logs: [
      { id: 1, method: 'GET', endpoint: '/api/test', timestamp: new Date() }
    ] } } })),
    getMyErrors: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
  },
};

jest.mock('../utils/api', () => mockAPI);

jest.mock('../utils/auth', () => ({
  isAuthenticated: jest.fn(() => true),
  getUser: jest.fn(() => ({ id: 1, email: 'test@test.com', first_name: 'Test' })),
  saveAuth: jest.fn(),
  getToken: jest.fn(() => 'mock-token'),
  logout: jest.fn(),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  formatDate: jest.fn((date) => '01 Jan 2025'),
  getRiskColor: jest.fn(() => 'text-green-600'),
  getInvestmentTypeLabel: jest.fn((type) => type),
  getStatusColor: jest.fn(() => 'bg-green-100'),
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth state
    require('../utils/auth').isAuthenticated.mockReturnValue(true);
  });

  it('login page renders correctly', async () => {
    const Login = require('../pages/login').default;
    render(<Login />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
  });

  it('signup page renders correctly', async () => {
    const Signup = require('../pages/signup').default;
    render(<Signup />);
    
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
  });

  it('forgot password page renders correctly', async () => {
    const ForgotPassword = require('../pages/forgot-password').default;
    render(<ForgotPassword />);
    
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
  });

  it('products page renders', async () => {
    const Products = require('../pages/products').default;
    render(<Products />);
    
    expect(screen.getByText('Investment Products')).toBeInTheDocument();
  });

  it('dashboard renders correctly', async () => {
    const Dashboard = require('../pages/dashboard').default;
    render(<Dashboard />);
    
    expect(screen.getByText('Investment Dashboard')).toBeInTheDocument();
  });

  it('portfolio renders correctly', async () => {
    const Portfolio = require('../pages/portfolio').default;
    render(<Portfolio />);
    
    expect(screen.getByText('My Portfolio')).toBeInTheDocument();
  });

  it('logs renders correctly', async () => {
    const Logs = require('../pages/logs').default;
    render(<Logs />);
    
    expect(screen.getByText('Activity Logs')).toBeInTheDocument();
  });

  it('profile renders correctly', async () => {
    const Profile = require('../pages/profile').default;
    render(<Profile />);
    
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
  });
});
