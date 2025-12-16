// Tests for pages with 0% coverage
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: {},
    pathname: '/',
  }),
}));

// Mock API
jest.mock('../../utils/api', () => ({
  investmentsAPI: {
    getPortfolio: jest.fn(() => Promise.resolve({ data: { data: { investments: [] } } })),
  },
}));

// Mock auth
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(() => true),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  getRiskColor: jest.fn(() => 'text-green-600'),
}));

describe('Zero Coverage Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('About Page', () => {
    it('renders about page content', () => {
      const About = require('../../pages/about').default;
      render(<About />);
      
      expect(screen.getByText('About Grip Invest')).toBeInTheDocument();
      expect(screen.getByText('Our Mission')).toBeInTheDocument();
      expect(screen.getByText('Our Vision')).toBeInTheDocument();
    });

    it('handles signup button click', () => {
      const About = require('../../pages/about').default;
      render(<About />);
      
      const signupButton = screen.getByText('Get Started Today');
      fireEvent.click(signupButton);
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
  });

  describe('How It Works Page', () => {
    it('renders how it works content', () => {
      const HowItWorks = require('../../pages/how-it-works').default;
      render(<HowItWorks />);
      
      expect(screen.getByText('How Grip Invest Works')).toBeInTheDocument();
      expect(screen.getByText('Sign Up & Complete KYC')).toBeInTheDocument();
      expect(screen.getByText('Browse Investment Options')).toBeInTheDocument();
    });

    it('handles get started button click', () => {
      const HowItWorks = require('../../pages/how-it-works').default;
      render(<HowItWorks />);
      
      const startButton = screen.getByText('Get Started Now');
      fireEvent.click(startButton);
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
  });

  describe('History Page', () => {
    it('renders history page', () => {
      const History = require('../../pages/history').default;
      render(<History />);
      
      expect(screen.getByText('Investment History')).toBeInTheDocument();
    });

    it('handles filter buttons', () => {
      const History = require('../../pages/history').default;
      render(<History />);
      
      const activeFilter = screen.getByText(/Active/);
      fireEvent.click(activeFilter);
      expect(activeFilter).toBeInTheDocument();
    });
  });

  describe('Quiz Page', () => {
    it('renders quiz page', () => {
      const Quiz = require('../../pages/quiz').default;
      render(<Quiz />);
      
      expect(screen.getByText('Investment Risk Assessment')).toBeInTheDocument();
    });
  });

  describe('Transactions Page', () => {
    it('renders transactions page', () => {
      const Transactions = require('../../pages/transactions').default;
      render(<Transactions />);
      
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
    });
  });

  describe('Calculator Pages', () => {
    it('renders bond calculator', () => {
      const BondCalculator = require('../../pages/calculators/bond').default;
      render(<BondCalculator />);
      
      expect(screen.getByText('Bond Investment Calculator')).toBeInTheDocument();
    });

    it('renders etf calculator', () => {
      const ETFCalculator = require('../../pages/calculators/etf').default;
      render(<ETFCalculator />);
      
      expect(screen.getByText('ETF Investment Calculator')).toBeInTheDocument();
    });
  });
});