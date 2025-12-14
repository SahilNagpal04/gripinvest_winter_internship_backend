// Test for forgot-password page
import { render, screen, fireEvent } from '@testing-library/react';
import ForgotPassword from '../../pages/forgot-password';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock API
jest.mock('../../utils/api');

// Mock auth utils
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(() => false),
  getUser: jest.fn(() => null),
  logout: jest.fn(),
}));

describe('Forgot Password Page', () => {
  it('renders forgot password form', () => {
    render(<ForgotPassword />);
    const forgotElements = screen.queryAllByText(/Forgot Password/i);
    expect(forgotElements.length).toBeGreaterThan(0);
  });

  it('renders email input', () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    expect(emailInput).toBeInTheDocument();
  });

  it('handles email input change', () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });
});
