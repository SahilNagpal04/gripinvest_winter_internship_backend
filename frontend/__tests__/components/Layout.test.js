// Test for Layout component
import { render, screen } from '@testing-library/react';
import Layout from '../../components/Layout';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('Layout Component', () => {
  it('renders brand name', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const brands = screen.getAllByText(/Grip Invest/i);
    expect(brands.length).toBeGreaterThan(0);
  });

  it('renders children content', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const content = screen.getByText(/Test Content/i);
    expect(content).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const footer = screen.getByText(/All rights reserved/i);
    expect(footer).toBeInTheDocument();
  });

  it('renders login button when not authenticated', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    const loginButtons = screen.getAllByText(/Login/i);
    expect(loginButtons.length).toBeGreaterThan(0);
  });
});
