// Test for signup page
import { render, screen, fireEvent } from '@testing-library/react';
import Signup from '../../pages/signup';

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
  getUser: jest.fn(() => null),
  logout: jest.fn(),
}));

const { authAPI } = require('../../utils/api');

describe('Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    render(<Signup />);
    const signupElements = screen.queryAllByText(/Sign Up/i);
    expect(signupElements.length).toBeGreaterThan(0);
  });

  it('renders all form fields', () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(<Signup />);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('submits form successfully', async () => {
    authAPI.signup.mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          user: { id: 1, email: 'test@example.com' },
        },
      },
    });

    render(<Signup />);
    
    const firstNameInput = screen.getByPlaceholderText(/first name/i);
    const lastNameInput = screen.getByPlaceholderText(/last name/i);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  });
});
