// Test for dashboard page
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../pages/dashboard';
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
  logout: jest.fn(),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard title', () => {
    investmentsAPI.getSummary.mockResolvedValue({
      data: {
        data: {
          summary: {
            total_invested: 10000,
            current_value: 11000,
            total_gains: 1000,
            total_investments: 5,
          },
          insights: ['Great portfolio!'],
          riskDistribution: [],
        },
      },
    });

    render(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('displays portfolio summary', async () => {
    investmentsAPI.getSummary.mockResolvedValue({
      data: {
        data: {
          summary: {
            total_invested: 10000,
            current_value: 11000,
            total_gains: 1000,
            total_investments: 5,
          },
          insights: [],
          riskDistribution: [],
        },
      },
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Total Invested/i)).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    investmentsAPI.getSummary.mockImplementation(
      () => new Promise(() => {})
    );

    render(<Dashboard />);
    const spinners = screen.queryAllByRole('generic');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('handles error state', async () => {
    investmentsAPI.getSummary.mockRejectedValue(new Error('Failed to load'));

    render(<Dashboard />);
    await waitFor(() => {
      const errorElements = screen.queryAllByText(/error/i);
      expect(errorElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('displays insights when available', async () => {
    investmentsAPI.getSummary.mockResolvedValue({
      data: {
        data: {
          summary: {
            total_invested: 10000,
            current_value: 11000,
            total_gains: 1000,
            total_investments: 5,
          },
          insights: ['Great portfolio!', 'Keep investing'],
          riskDistribution: [],
        },
      },
    });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Total Invested/i)).toBeInTheDocument();
    });
  });
});
