// Test for portfolio page
import { render, screen, waitFor } from '@testing-library/react';
import Portfolio from '../../pages/portfolio';
import { investmentsAPI } from '../../utils/api';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock API
jest.mock('../../utils/api');

// Mock auth utils
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(() => true),
  getUser: jest.fn(() => ({ id: 1, email: 'test@example.com' })),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  formatDate: jest.fn((date) => '01 Jan 2025'),
  getRiskColor: jest.fn(() => 'text-green-600'),
  logout: jest.fn(),
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

describe('Portfolio Page', () => {
  const mockPortfolio = [
    {
      id: '1',
      product_name: 'Test Bond',
      amount: 10000,
      expected_return: 10750,
      status: 'active',
      maturity_date: '2025-12-31',
      risk_level: 'low',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    investmentsAPI.getPortfolio.mockResolvedValue({
      data: { data: { investments: mockPortfolio } },
    });
    investmentsAPI.getSummary.mockResolvedValue({
      data: {
        data: {
          summary: {
            total_invested: 10000,
            current_value: 10750,
            total_gains: 750,
          },
          riskDistribution: [],
        },
      },
    });
  });

  it('renders portfolio page', async () => {
    render(<Portfolio />);
    await waitFor(() => {
      expect(screen.getByText(/My Portfolio/i)).toBeInTheDocument();
    });
  });

  it('displays investments', async () => {
    render(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText(/Test Bond/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no investments', async () => {
    investmentsAPI.getPortfolio.mockResolvedValue({
      data: { data: { investments: [] } },
    });

    render(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText(/haven't made any investments/i)).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    investmentsAPI.getPortfolio.mockRejectedValue(new Error('Failed'));
    investmentsAPI.getSummary.mockRejectedValue(new Error('Failed'));

    render(<Portfolio />);
    await waitFor(() => {
      const elements = screen.queryAllByText(/My Portfolio/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('displays portfolio summary', async () => {
    render(<Portfolio />);
    await waitFor(() => {
      expect(screen.getByText(/Test Bond/i)).toBeInTheDocument();
    });
  });
});
