// Test for Layout component
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '../../components/Layout';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth utils
jest.mock('../../utils/auth', () => ({
  getUser: jest.fn(),
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
}));

const { getUser, isAuthenticated, logout } = require('../../utils/auth');

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders brand name', () => {
    isAuthenticated.mockReturnValue(false);
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const brands = screen.getAllByText(/Grip Invest/i);
    expect(brands.length).toBeGreaterThan(0);
  });

  it('renders children content', () => {
    isAuthenticated.mockReturnValue(false);
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const content = screen.getByText(/Test Content/i);
    expect(content).toBeInTheDocument();
  });

  it('renders footer', () => {
    isAuthenticated.mockReturnValue(false);
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const footer = screen.getByText(/All rights reserved/i);
    expect(footer).toBeInTheDocument();
  });

  it('renders login button when not authenticated', () => {
    isAuthenticated.mockReturnValue(false);
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const loginButtons = screen.getAllByText(/Login/i);
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it('renders user menu when authenticated', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('handles logout click', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);
    expect(logout).toHaveBeenCalled();
  });

  it('toggles mobile menu', () => {
    isAuthenticated.mockReturnValue(false);
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const menuButton = screen.getByRole('button', { hidden: true });
    fireEvent.click(menuButton);
  });

  it('navigates to home on brand click', () => {
    isAuthenticated.mockReturnValue(false);
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const brandButtons = screen.getAllByText(/Grip Invest/i);
    fireEvent.click(brandButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('navigates to dashboard when authenticated', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const dashboardButton = screen.getByText(/Dashboard/i);
    fireEvent.click(dashboardButton);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to products', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const productsButton = screen.getByText(/Products/i);
    fireEvent.click(productsButton);
    expect(mockPush).toHaveBeenCalledWith('/products');
  });

  it('navigates to portfolio', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const portfolioButton = screen.getByText(/Portfolio/i);
    fireEvent.click(portfolioButton);
    expect(mockPush).toHaveBeenCalledWith('/portfolio');
  });

  it('navigates to logs', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const logsButton = screen.getByText(/Logs/i);
    fireEvent.click(logsButton);
    expect(mockPush).toHaveBeenCalledWith('/logs');
  });

  it('navigates to profile', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const profileButton = screen.getByText(/Profile/i);
    fireEvent.click(profileButton);
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('navigates to login when not authenticated', () => {
    isAuthenticated.mockReturnValue(false);
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const loginButtons = screen.getAllByText(/Login/i);
    fireEvent.click(loginButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('navigates to signup when not authenticated', () => {
    isAuthenticated.mockReturnValue(false);
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const signupButtons = screen.getAllByText(/Sign Up/i);
    fireEvent.click(signupButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });

  it('renders mobile menu button', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('navigates in mobile menu', () => {
    isAuthenticated.mockReturnValue(true);
    getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
