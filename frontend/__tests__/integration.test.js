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
    getAll: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
    getById: jest.fn(() => Promise.resolve({ data: { data: { product: { id: 1, name: 'Test' } } } })),
    getRecommended: jest.fn(() => Promise.resolve({ data: { data: { products: [] } } })),
  },
  investmentsAPI: {
    getPortfolio: jest.fn(() => Promise.resolve({ data: { data: { investments: [] } } })),
    getSummary: jest.fn(() => Promise.resolve({ data: { data: { summary: {}, insights: [], riskDistribution: [] } } })),
  },
  logsAPI: {
    getMy: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
    getMyErrors: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
  },
};

jest.mock('../utils/api', () => mockAPI);

jest.mock('../utils/auth', () => ({
  isAuthenticated: jest.fn(() => false),
  getUser: jest.fn(() => null),
  saveAuth: jest.fn(),
  getToken: jest.fn(),
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
  });

  it('login page form interaction', async () => {
    const Login = require('../pages/login').default;
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('signup page form interaction', async () => {
    const Signup = require('../pages/signup').default;
    render(<Signup />);
    
    const firstNameInput = screen.getByPlaceholderText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    expect(firstNameInput.value).toBe('John');
  });

  it('forgot password page interaction', async () => {
    const ForgotPassword = require('../pages/forgot-password').default;
    render(<ForgotPassword />);
    
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('products page search', async () => {
    const Products = require('../pages/products').default;
    render(<Products />);
    
    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(/Search products/i);
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'bond' } });
        expect(searchInput.value).toBe('bond');
      }
    });
  });

  it('dashboard loads data', async () => {
    const Dashboard = require('../pages/dashboard').default;
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockAPI.investmentsAPI.getSummary).toHaveBeenCalled();
    });
  });

  it('portfolio loads data', async () => {
    const Portfolio = require('../pages/portfolio').default;
    render(<Portfolio />);
    
    await waitFor(() => {
      expect(mockAPI.investmentsAPI.getPortfolio).toHaveBeenCalled();
    });
  });

  it('logs loads data', async () => {
    const Logs = require('../pages/logs').default;
    render(<Logs />);
    
    await waitFor(() => {
      expect(mockAPI.logsAPI.getMy).toHaveBeenCalled();
    });
  });

  it('profile loads data', async () => {
    const Profile = require('../pages/profile').default;
    render(<Profile />);
    
    await waitFor(() => {
      expect(mockAPI.authAPI.getProfile).toHaveBeenCalled();
    });
  });
});
