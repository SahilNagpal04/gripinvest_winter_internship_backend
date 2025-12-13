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

describe('Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    render(<Signup />);
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(<Signup />);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });
});
