// Test for logs page
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Logs from '../../pages/logs';
import { logsAPI } from '../../utils/api';

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
  formatDate: jest.fn((date) => '01 Jan 2025'),
}));

describe('Logs Page', () => {
  const mockLogs = [
    {
      id: 1,
      endpoint: '/api/products',
      http_method: 'GET',
      status_code: 200,
      error_message: null,
      created_at: '2025-01-01T10:00:00Z',
    },
  ];

  const mockErrorLogs = [
    {
      id: 2,
      endpoint: '/api/investments',
      http_method: 'POST',
      status_code: 400,
      error_message: 'Insufficient balance',
      created_at: '2025-01-01T11:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    logsAPI.getMy.mockResolvedValue({
      data: { data: { logs: mockLogs } },
    });
    logsAPI.getMyErrors.mockResolvedValue({
      data: { data: { logs: mockErrorLogs } },
    });
  });

  it('renders logs page', () => {
    render(<Logs />);
    expect(screen.getByText(/Transaction Logs/i)).toBeInTheDocument();
  });

  it('displays logs', async () => {
    render(<Logs />);

    await waitFor(() => {
      expect(screen.getByText(/\/api\/products/i)).toBeInTheDocument();
    });
  });

  it('switches between tabs', async () => {
    render(<Logs />);

    await waitFor(() => {
      const errorsTab = screen.getByText(/Errors Only/i);
      fireEvent.click(errorsTab);
      expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
    });
  });

  it('displays stats cards', async () => {
    render(<Logs />);

    await waitFor(() => {
      expect(screen.getByText(/Total Requests/i)).toBeInTheDocument();
      expect(screen.getByText(/Successful/i)).toBeInTheDocument();
      expect(screen.getByText(/Errors/i)).toBeInTheDocument();
    });
  });
});
