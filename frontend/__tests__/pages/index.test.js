// Test for landing page
import { render, screen } from '@testing-library/react';
import Home from '../../pages/index';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('Home Page', () => {
  it('renders welcome heading', () => {
    render(<Home />);
    const heading = screen.getByText(/Welcome to Grip Invest/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders get started button', () => {
    render(<Home />);
    const button = screen.getByText(/Get Started/i);
    expect(button).toBeInTheDocument();
  });

  it('renders login button', () => {
    render(<Home />);
    const buttons = screen.getAllByText(/Login/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders features section', () => {
    render(<Home />);
    const feature1 = screen.getByText(/Diverse Products/i);
    const feature2 = screen.getByText(/AI Recommendations/i);
    const feature3 = screen.getByText(/Track Returns/i);
    expect(feature1).toBeInTheDocument();
    expect(feature2).toBeInTheDocument();
    expect(feature3).toBeInTheDocument();
  });
});
