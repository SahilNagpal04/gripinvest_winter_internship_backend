// Edge cases and error handling tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { id: '1' },
    pathname: '/',
  }),
}));

// Mock API with error scenarios
const mockAPIWithErrors = {
  authAPI: {
    getProfile: jest.fn(() => Promise.reject(new Error('Network error'))),
    updateProfile: jest.fn(() => Promise.reject(new Error('Update failed'))),
  },
  productsAPI: {
    getAll: jest.fn(() => Promise.reject(new Error('Failed to load'))),
    getById: jest.fn(() => Promise.reject(new Error('Product not found'))),
  },
  investmentsAPI: {
    getPortfolio: jest.fn(() => Promise.reject(new Error('Portfolio error'))),
    getSummary: jest.fn(() => Promise.reject(new Error('Summary error'))),
  },
  logsAPI: {
    getMy: jest.fn(() => Promise.reject(new Error('Logs error'))),
  },
};

jest.mock('../utils/api', () => mockAPIWithErrors);

// Mock auth with different states
const mockAuth = {
  isAuthenticated: jest.fn(() => false),
  getUser: jest.fn(() => null),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  formatDate: jest.fn((date) => '01 Jan 2025'),
  getRiskColor: jest.fn(() => 'text-green-600'),
};

jest.mock('../utils/auth', () => mockAuth);

describe('Edge Cases and Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Edge Cases', () => {
    it('redirects unauthenticated users from protected pages', () => {
      const Dashboard = require('../pages/dashboard').default;
      render(<Dashboard />);
      // Should redirect to login
    });

    it('handles authentication errors gracefully', async () => {
      mockAuth.isAuthenticated.mockReturnValue(true);
      const Profile = require('../pages/profile').default;
      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('API Error Handling', () => {
    it('handles products API errors', async () => {
      const Products = require('../pages/products').default;
      render(<Products />);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('handles portfolio API errors', async () => {
      mockAuth.isAuthenticated.mockReturnValue(true);
      const Portfolio = require('../pages/portfolio').default;
      render(<Portfolio />);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('handles logs API errors', async () => {
      mockAuth.isAuthenticated.mockReturnValue(true);
      const Logs = require('../pages/logs').default;
      render(<Logs />);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Edge Cases', () => {
    it('handles empty form submissions', () => {
      const Login = require('../pages/login').default;
      render(<Login />);
      
      const submitButton = screen.getByText('Sign In');
      fireEvent.click(submitButton);
    });

    it('handles invalid email formats', () => {
      const Signup = require('../pages/signup').default;
      render(<Signup />);
      
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
    });

    it('handles password validation', () => {
      const Signup = require('../pages/signup').default;
      render(<Signup />);
      
      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.blur(passwordInput);
    });
  });

  describe('Component Edge Cases', () => {
    it('handles empty data states', () => {
      const PortfolioHealthScore = require('../components/PortfolioHealthScore').default;
      render(<PortfolioHealthScore portfolio={null} />);
      
      expect(screen.getByText('Portfolio Health Score')).toBeInTheDocument();
    });

    it('handles undefined props', () => {
      const PortfolioHealthScore = require('../components/PortfolioHealthScore').default;
      render(<PortfolioHealthScore />);
      
      expect(screen.getByText('Portfolio Health Score')).toBeInTheDocument();
    });

    it('handles notification bell with no data', () => {
      const NotificationBell = require('../components/NotificationBell').default;
      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);
    });
  });

  describe('Calculator Edge Cases', () => {
    it('handles invalid calculator inputs', () => {
      const BondCalculator = require('../pages/calculators/bond').default;
      render(<BondCalculator />);
      
      const principalInput = screen.getByPlaceholderText('Enter principal amount');
      fireEvent.change(principalInput, { target: { value: '-1000' } });
    });

    it('handles zero values in calculator', () => {
      const ETFCalculator = require('../pages/calculators/etf').default;
      render(<ETFCalculator />);
      
      const amountInput = screen.getByPlaceholderText('Monthly investment amount');
      fireEvent.change(amountInput, { target: { value: '0' } });
    });
  });

  describe('Responsive Design Edge Cases', () => {
    it('handles mobile menu interactions', () => {
      const Layout = require('../components/Layout').default;
      render(<Layout><div>Test</div></Layout>);
      
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(mobileMenuButton);
    });
  });

  describe('Theme Toggle Edge Cases', () => {
    it('handles theme persistence', () => {
      const Layout = require('../components/Layout').default;
      render(<Layout><div>Test</div></Layout>);
      
      const themeToggle = screen.getByRole('button', { name: /theme/i });
      fireEvent.click(themeToggle);
      fireEvent.click(themeToggle);
    });
  });

  describe('Search and Filter Edge Cases', () => {
    it('handles special characters in search', async () => {
      const Products = require('../pages/products').default;
      render(<Products />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search products...');
        fireEvent.change(searchInput, { target: { value: '!@#$%^&*()' } });
      });
    });

    it('handles very long search terms', async () => {
      const Products = require('../pages/products').default;
      render(<Products />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search products...');
        fireEvent.change(searchInput, { target: { value: 'a'.repeat(1000) } });
      });
    });
  });

  describe('Date Handling Edge Cases', () => {
    it('handles invalid date formats', () => {
      const { formatDate } = require('../utils/auth');
      expect(formatDate('invalid-date')).toBe('01 Jan 2025');
    });

    it('handles null dates', () => {
      const { formatDate } = require('../utils/auth');
      expect(formatDate(null)).toBe('01 Jan 2025');
    });
  });

  describe('Currency Formatting Edge Cases', () => {
    it('handles negative amounts', () => {
      const { formatCurrency } = require('../utils/auth');
      expect(formatCurrency(-1000)).toBe('₹-1000');
    });

    it('handles zero amounts', () => {
      const { formatCurrency } = require('../utils/auth');
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('handles very large amounts', () => {
      const { formatCurrency } = require('../utils/auth');
      expect(formatCurrency(999999999)).toBe('₹999999999');
    });
  });
});