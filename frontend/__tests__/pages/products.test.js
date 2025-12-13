// Test for products page
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Products from '../../pages/products';
import { productsAPI } from '../../utils/api';

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
  isAuthenticated: jest.fn(() => false),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  getRiskColor: jest.fn(() => 'text-green-600'),
  getInvestmentTypeLabel: jest.fn((type) => type),
}));

describe('Products Page', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Test Bond',
      investment_type: 'bond',
      risk_level: 'low',
      annual_yield: 7.5,
      tenure_months: 12,
      min_investment: 5000,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    productsAPI.getAll.mockResolvedValue({
      data: { data: { products: mockProducts } },
    });
    productsAPI.getRecommended.mockResolvedValue({
      data: { data: { products: [] } },
    });
  });

  it('renders products page', () => {
    render(<Products />);
    expect(screen.getByText(/Investment Products/i)).toBeInTheDocument();
  });

  it('displays products list', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(/Test Bond/i)).toBeInTheDocument();
    });
  });

  it('handles filter changes', async () => {
    render(<Products />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Search products/i);
      fireEvent.change(searchInput, { target: { value: 'Bond' } });
      expect(searchInput.value).toBe('Bond');
    });
  });

  it('shows empty state when no products', async () => {
    productsAPI.getAll.mockResolvedValue({
      data: { data: { products: [] } },
    });

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(/No products found/i)).toBeInTheDocument();
    });
  });
});
