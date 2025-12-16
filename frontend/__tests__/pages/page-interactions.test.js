// Tests for page interactions and edge cases
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/router
const mockPush = jest.fn();
const mockQuery = {};
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: mockQuery,
    pathname: '/',
  }),
}));

// Mock API with various responses
const mockAPI = {
  authAPI: {
    getProfile: jest.fn(() => Promise.resolve({ 
      data: { data: { user: { email: 'test@test.com', first_name: 'Test', balance: 10000 } } } 
    })),
    updateProfile: jest.fn(() => Promise.resolve({ data: { data: {} } })),
  },
  productsAPI: {
    getAll: jest.fn(() => Promise.resolve({ 
      data: { data: { products: [
        { id: 1, name: 'Test Bond', type: 'bond', yield: 10, risk_level: 'Low' }
      ] } } 
    })),
    getById: jest.fn(() => Promise.resolve({ 
      data: { data: { product: { id: 1, name: 'Test Bond', type: 'bond' } } } 
    })),
  },
  investmentsAPI: {
    getPortfolio: jest.fn(() => Promise.resolve({ 
      data: { data: { investments: [
        { id: 1, product_name: 'Test Investment', amount: 10000, status: 'active' }
      ] } } 
    })),
    getSummary: jest.fn(() => Promise.resolve({ 
      data: { data: { 
        summary: { totalValue: 10000, totalInvested: 9000, totalReturns: 1000 },
        insights: ['Good portfolio'],
        riskDistribution: []
      } } 
    })),
  },
  logsAPI: {
    getMy: jest.fn(() => Promise.resolve({ 
      data: { data: { logs: [
        { id: 1, method: 'GET', endpoint: '/api/test', timestamp: new Date() }
      ] } } 
    })),
  },
};

jest.mock('../../utils/api', () => mockAPI);

// Mock auth
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(() => true),
  getUser: jest.fn(() => ({ id: 1, email: 'test@test.com' })),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  formatDate: jest.fn((date) => '01 Jan 2025'),
  getRiskColor: jest.fn(() => 'text-green-600'),
}));

describe('Page Interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Page', () => {
    it('renders dashboard with data', async () => {
      const Dashboard = require('../../pages/dashboard').default;
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Investment Dashboard')).toBeInTheDocument();
      });
    });

    it('handles view portfolio click', async () => {
      const Dashboard = require('../../pages/dashboard').default;
      render(<Dashboard />);
      
      await waitFor(() => {
        const viewButton = screen.getByText('View Portfolio');
        fireEvent.click(viewButton);
        expect(mockPush).toHaveBeenCalledWith('/portfolio');
      });
    });
  });

  describe('Products Page', () => {
    it('handles search functionality', async () => {
      const Products = require('../../pages/products').default;
      render(<Products />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search products...');
        fireEvent.change(searchInput, { target: { value: 'bond' } });
        expect(searchInput.value).toBe('bond');
      });
    });

    it('handles filter changes', async () => {
      const Products = require('../../pages/products').default;
      render(<Products />);
      
      await waitFor(() => {
        const typeFilter = screen.getByDisplayValue('all');
        fireEvent.change(typeFilter, { target: { value: 'bond' } });
      });
    });

    it('handles sort changes', async () => {
      const Products = require('../../pages/products').default;
      render(<Products />);
      
      await waitFor(() => {
        const sortSelect = screen.getByDisplayValue('name');
        fireEvent.change(sortSelect, { target: { value: 'yield' } });
      });
    });
  });

  describe('Portfolio Page', () => {
    it('renders portfolio data', async () => {
      const Portfolio = require('../../pages/portfolio').default;
      render(<Portfolio />);
      
      await waitFor(() => {
        expect(screen.getByText('My Portfolio')).toBeInTheDocument();
      });
    });

    it('handles investment details click', async () => {
      const Portfolio = require('../../pages/portfolio').default;
      render(<Portfolio />);
      
      await waitFor(() => {
        const detailsButton = screen.getByText('View Details');
        fireEvent.click(detailsButton);
      });
    });
  });

  describe('Profile Page', () => {
    it('handles profile form submission', async () => {
      const Profile = require('../../pages/profile').default;
      render(<Profile />);
      
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Test');
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });
    });

    it('handles 2FA toggle', async () => {
      const Profile = require('../../pages/profile').default;
      render(<Profile />);
      
      await waitFor(() => {
        const twoFAToggle = screen.getByRole('checkbox');
        fireEvent.click(twoFAToggle);
      });
    });
  });

  describe('Logs Page', () => {
    it('handles date filter', async () => {
      const Logs = require('../../pages/logs').default;
      render(<Logs />);
      
      await waitFor(() => {
        const dateInput = screen.getByDisplayValue('7');
        fireEvent.change(dateInput, { target: { value: '30' } });
      });
    });

    it('handles error logs toggle', async () => {
      const Logs = require('../../pages/logs').default;
      render(<Logs />);
      
      await waitFor(() => {
        const errorToggle = screen.getByText('Show Errors Only');
        fireEvent.click(errorToggle);
      });
    });
  });

  describe('Product Details Page', () => {
    it('handles investment amount input', async () => {
      const ProductDetails = require('../../pages/products/[id]').default;
      render(<ProductDetails />);
      
      await waitFor(() => {
        const amountInput = screen.getByPlaceholderText('Enter amount');
        fireEvent.change(amountInput, { target: { value: '10000' } });
        expect(amountInput.value).toBe('10000');
      });
    });

    it('handles invest button click', async () => {
      const ProductDetails = require('../../pages/products/[id]').default;
      render(<ProductDetails />);
      
      await waitFor(() => {
        const investButton = screen.getByText('Invest Now');
        fireEvent.click(investButton);
      });
    });
  });

  describe('Index Page', () => {
    it('handles hero section buttons', () => {
      const Index = require('../../pages/index').default;
      render(<Index />);
      
      const getStartedButton = screen.getByText('Get Started');
      fireEvent.click(getStartedButton);
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });

    it('handles learn more button', () => {
      const Index = require('../../pages/index').default;
      render(<Index />);
      
      const learnMoreButton = screen.getByText('Learn More');
      fireEvent.click(learnMoreButton);
      expect(mockPush).toHaveBeenCalledWith('/how-it-works');
    });

    it('handles product card clicks', async () => {
      const Index = require('../../pages/index').default;
      render(<Index />);
      
      await waitFor(() => {
        const exploreButton = screen.getByText('Explore Products');
        fireEvent.click(exploreButton);
        expect(mockPush).toHaveBeenCalledWith('/products');
      });
    });
  });
});