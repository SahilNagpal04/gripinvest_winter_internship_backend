// Test for login page
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../pages/login';
import { authAPI } from '../../utils/api';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock API
jest.mock('../../utils/api');

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<Login />);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('submits form successfully', async () => {
    authAPI.login.mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          user: { id: 1, email: 'test@example.com' },
        },
      },
    });

    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalled();
    });
  });
});
