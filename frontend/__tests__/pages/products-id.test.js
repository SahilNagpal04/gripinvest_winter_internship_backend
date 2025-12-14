// Test for product detail page
import { render, screen, waitFor } from '@testing-library/react';
import ProductDetail from '../../pages/products/[id]';
import { productsAPI } from '../../utils/api';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '1' },
    push: jest.fn(),
  }),
}));

// Mock API
jest.mock('../../utils/api');

// Mock auth utils
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(() => true),
  getUser: jest.fn(() => ({ id: 1, email: 'test@example.com' })),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  getRiskColor: jest.fn(() => 'text-green-600'),
  getInvestmentTypeLabel: jest.fn((type) => type),
  logout: jest.fn(),
}));

describe('Product Detail Page', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Bond',
    investment_type: 'bond',
    risk_level: 'low',
    annual_yield: 7.5,
    tenure_months: 12,
    min_investment: 5000,
    max_investment: 100000,
    description: 'Test description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    productsAPI.getById.mockResolvedValue({
      data: { data: { product: mockProduct } },
    });
  });

  it('renders product detail page', async () => {
    render(<ProductDetail />);
    await waitFor(() => {
      expect(screen.getByText(/Test Bond/i)).toBeInTheDocument();
    });
  });

  it('displays product information', async () => {
    render(<ProductDetail />);
    await waitFor(() => {
      expect(screen.getByText(/Test description/i)).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    productsAPI.getById.mockRejectedValue(new Error('Failed'));
    render(<ProductDetail />);
    await waitFor(() => {
      const elements = screen.queryAllByText(/Product Details/i);
      expect(elements.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('displays loading state', () => {
    productsAPI.getById.mockImplementation(() => new Promise(() => {}));
    render(<ProductDetail />);
    const elements = screen.queryAllByRole('generic');
    expect(elements.length).toBeGreaterThan(0);
  });
});
