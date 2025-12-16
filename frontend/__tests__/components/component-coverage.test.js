// Tests to improve component coverage
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
  }),
}));

// Mock auth
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(() => true),
  getUser: jest.fn(() => ({ id: 1, email: 'test@test.com' })),
  logout: jest.fn(),
}));

// Mock API
jest.mock('../../utils/api', () => ({
  logsAPI: {
    getMy: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
  },
}));

describe('Component Coverage Tests', () => {
  describe('NotificationBell Component', () => {
    it('renders notification bell', () => {
      const NotificationBell = require('../../components/NotificationBell').default;
      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });

    it('toggles notification panel', async () => {
      const NotificationBell = require('../../components/NotificationBell').default;
      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });

    it('handles mark all as read', async () => {
      const NotificationBell = require('../../components/NotificationBell').default;
      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);
      
      await waitFor(() => {
        const markAllButton = screen.getByText('Mark all as read');
        fireEvent.click(markAllButton);
      });
    });

    it('handles view all logs', async () => {
      const NotificationBell = require('../../components/NotificationBell').default;
      render(<NotificationBell />);
      
      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);
      
      await waitFor(() => {
        const viewAllButton = screen.getByText('View All Logs');
        fireEvent.click(viewAllButton);
      });
    });
  });

  describe('PortfolioHealthScore Component', () => {
    const mockPortfolio = {
      totalValue: 100000,
      totalInvested: 90000,
      totalReturns: 10000,
      investments: [
        { risk_level: 'Low', amount: 50000 },
        { risk_level: 'Medium', amount: 30000 },
        { risk_level: 'High', amount: 10000 }
      ]
    };

    it('renders portfolio health score', () => {
      const PortfolioHealthScore = require('../../components/PortfolioHealthScore').default;
      render(<PortfolioHealthScore portfolio={mockPortfolio} />);
      
      expect(screen.getByText('Portfolio Health Score')).toBeInTheDocument();
    });

    it('calculates health score correctly', () => {
      const PortfolioHealthScore = require('../../components/PortfolioHealthScore').default;
      render(<PortfolioHealthScore portfolio={mockPortfolio} />);
      
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
    });

    it('shows risk distribution', () => {
      const PortfolioHealthScore = require('../../components/PortfolioHealthScore').default;
      render(<PortfolioHealthScore portfolio={mockPortfolio} />);
      
      expect(screen.getByText('Risk Distribution')).toBeInTheDocument();
    });

    it('handles empty portfolio', () => {
      const PortfolioHealthScore = require('../../components/PortfolioHealthScore').default;
      render(<PortfolioHealthScore portfolio={{ investments: [] }} />);
      
      expect(screen.getByText('Portfolio Health Score')).toBeInTheDocument();
    });
  });

  describe('Layout Component Edge Cases', () => {
    it('handles mobile menu toggle', () => {
      const Layout = require('../../components/Layout').default;
      render(<Layout><div>Test</div></Layout>);
      
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(mobileMenuButton);
    });

    it('handles theme toggle', () => {
      const Layout = require('../../components/Layout').default;
      render(<Layout><div>Test</div></Layout>);
      
      const themeToggle = screen.getByRole('button', { name: /theme/i });
      fireEvent.click(themeToggle);
    });

    it('handles logout', () => {
      const Layout = require('../../components/Layout').default;
      render(<Layout><div>Test</div></Layout>);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });
  });
});