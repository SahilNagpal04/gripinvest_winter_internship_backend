// Test for API utility
import axios from 'axios';
import { authAPI, productsAPI, investmentsAPI, logsAPI } from '../../utils/api';

// Mock axios
jest.mock('axios');

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('authAPI', () => {
    it('calls signup endpoint', async () => {
      const mockData = { token: 'test-token' };
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockData }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await authAPI.signup({ email: 'test@example.com' });
      expect(result).toBeDefined();
    });

    it('calls login endpoint', async () => {
      const mockData = { token: 'test-token' };
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockData }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await authAPI.login({ email: 'test@example.com' });
      expect(result).toBeDefined();
    });
  });

  describe('productsAPI', () => {
    it('calls getAll endpoint', async () => {
      const mockData = { products: [] };
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockData }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await productsAPI.getAll();
      expect(result).toBeDefined();
    });
  });

  describe('investmentsAPI', () => {
    it('calls create endpoint', async () => {
      const mockData = { investment: {} };
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockData }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await investmentsAPI.create({ product_id: '1', amount: 5000 });
      expect(result).toBeDefined();
    });
  });

  describe('logsAPI', () => {
    it('calls getMy endpoint', async () => {
      const mockData = { logs: [] };
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockData }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await logsAPI.getMy();
      expect(result).toBeDefined();
    });
  });
});
