// Test for profile page
import { render, screen, waitFor } from '@testing-library/react';
import Profile from '../../pages/profile';
import { authAPI, productsAPI } from '../../utils/api';

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
  saveAuth: jest.fn(),
  formatCurrency: jest.fn((amount) => `₹${amount}`),
}));

describe('Profile Page', () => {
  const mockUser = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    risk_appetite: 'moderate',
    balance: 100000,
    created_at: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authAPI.getProfile.mockResolvedValue({
      data: { data: { user: mockUser } },
    });
    productsAPI.getRecommended.mockResolvedValue({
      data: { data: { products: [] } },
    });
  });

  it('displays user information', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    });
  });
});
