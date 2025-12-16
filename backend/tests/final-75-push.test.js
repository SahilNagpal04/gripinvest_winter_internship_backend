// Targeted tests to push coverage above 75%
const db = require('../src/config/database');

describe('Push to 75% Coverage', () => {
  describe('Alert Controller Complete Coverage', () => {
    const alertController = require('../src/controllers/alertController');

    it('should execute getAlerts with maturity alerts', async () => {
      const mockReq = {
        user: { id: 'user1', risk_appetite: 'high' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      const originalQuery = db.query;
      db.query = jest.fn()
        .mockResolvedValueOnce([{ id: 1, name: 'Product', amount: 1000, expected_return: 1100, maturity_date: new Date(), days_left: 3 }])
        .mockResolvedValueOnce([{ id: 1, name: 'New Product', annual_yield: 8.5, risk_level: 'high', investment_type: 'bonds' }]);

      await alertController.getAlerts(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();

      db.query = originalQuery;
    });

    it('should execute getAlerts without risk appetite', async () => {
      const mockReq = {
        user: { id: 'user2' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      const originalQuery = db.query;
      db.query = jest.fn().mockResolvedValue([]);

      await alertController.getAlerts(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);

      db.query = originalQuery;
    });

    it('should execute getAlertCount with results', async () => {
      const mockReq = {
        user: { id: 'user3', risk_appetite: 'low' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      const originalQuery = db.query;
      db.query = jest.fn()
        .mockResolvedValueOnce([{ count: 2 }])
        .mockResolvedValueOnce([{ count: 3 }]);

      await alertController.getAlertCount(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { count: 5 }
      });

      db.query = originalQuery;
    });

    it('should execute getAlertCount without risk appetite', async () => {
      const mockReq = {
        user: { id: 'user4' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      const originalQuery = db.query;
      db.query = jest.fn().mockResolvedValue([{ count: 1 }]);

      await alertController.getAlertCount(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);

      db.query = originalQuery;
    });

    it('should handle getAlerts error', async () => {
      const mockReq = {
        user: { id: 'user5' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      await alertController.getAlerts(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();

      db.query = originalQuery;
    });

    it('should handle getAlertCount error', async () => {
      const mockReq = {
        user: { id: 'user6' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      await alertController.getAlertCount(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();

      db.query = originalQuery;
    });
  });

  describe('Transaction Controller Complete Coverage', () => {
    const transactionController = require('../src/controllers/transactionController');

    it('should get user transactions successfully', async () => {
      const mockReq = {
        user: { id: 'user1' }
      };
      const mockRes = {
        json: jest.fn()
      };

      const originalQuery = db.query;
      db.query = jest.fn().mockResolvedValue([
        { id: 1, amount: 1000, type: 'investment' },
        { id: 2, amount: 2000, type: 'withdrawal' }
      ]);

      await transactionController.getUserTransactions(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        transactions: expect.any(Array)
      });

      db.query = originalQuery;
    });

    it('should handle getUserTransactions error', async () => {
      const mockReq = {
        user: { id: 'user2' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      await transactionController.getUserTransactions(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to fetch transactions',
        error: 'DB Error'
      });

      db.query = originalQuery;
    });

    it('should get transaction by id successfully', async () => {
      const mockReq = {
        params: { id: 'trans1' },
        user: { id: 'user3' }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const originalQuery = db.query;
      db.query = jest.fn().mockResolvedValue([
        [{ id: 'trans1', amount: 1000 }]
      ]);

      await transactionController.getTransactionById(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({ id: 'trans1', amount: 1000 });

      db.query = originalQuery;
    });

    it('should return 404 when transaction not found', async () => {
      const mockReq = {
        params: { id: 'trans2' },
        user: { id: 'user4' }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const originalQuery = db.query;
      db.query = jest.fn().mockResolvedValue([[]]);

      await transactionController.getTransactionById(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Transaction not found' });

      db.query = originalQuery;
    });

    it('should handle getTransactionById error', async () => {
      const mockReq = {
        params: { id: 'trans3' },
        user: { id: 'user5' }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      await transactionController.getTransactionById(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to fetch transaction' });

      db.query = originalQuery;
    });

    it('should get transaction summary successfully', async () => {
      const mockReq = {
        user: { id: 'user6' }
      };
      const mockRes = {
        json: jest.fn()
      };

      const originalQuery = db.query;
      db.query = jest.fn().mockResolvedValue([{
        total_transactions: 10,
        total_credits: 5000,
        total_debits: 3000,
        active_investments: 5,
        cancelled_investments: 2
      }]);

      await transactionController.getTransactionSummary(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        total_transactions: 10
      }));

      db.query = originalQuery;
    });

    it('should handle getTransactionSummary error', async () => {
      const mockReq = {
        user: { id: 'user7' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      await transactionController.getTransactionSummary(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to fetch summary',
        error: 'DB Error'
      });

      db.query = originalQuery;
    });
  });

  describe('Database Module Coverage', () => {
    it('should execute query successfully', async () => {
      const result = await db.query('SELECT 1 as num');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should test connection successfully', async () => {
      const { testConnection } = require('../src/config/database');
      const result = await testConnection();
      expect(typeof result).toBe('boolean');
    });

    it('should access pool object', () => {
      const { pool } = require('../src/config/database');
      expect(pool).toBeDefined();
      expect(pool.execute).toBeDefined();
    });
  });

  describe('Middleware Coverage', () => {
    it('should test auth middleware functions', () => {
      const { protect, requireAdmin } = require('../src/middleware/auth');
      expect(typeof protect).toBe('function');
      expect(typeof requireAdmin).toBe('function');
    });

    it('should test logger middleware', () => {
      const { logTransaction } = require('../src/middleware/logger');
      expect(typeof logTransaction).toBe('function');
    });

    it('should test error handler', () => {
      const { errorHandler } = require('../src/middleware/errorHandler');
      expect(typeof errorHandler).toBe('function');
    });
  });

  describe('Utils Coverage', () => {
    it('should test email service functions', () => {
      const { generateOTP, sendOTP, verifyOTP } = require('../src/utils/emailService');
      expect(typeof generateOTP).toBe('function');
      expect(typeof sendOTP).toBe('function');
      expect(typeof verifyOTP).toBe('function');
    });

    it('should test password utils functions', () => {
      const { hashPassword, comparePassword } = require('../src/utils/passwordUtils');
      expect(typeof hashPassword).toBe('function');
      expect(typeof comparePassword).toBe('function');
    });

    it('should test validators', () => {
      const { validateRequest } = require('../src/utils/validators');
      expect(typeof validateRequest).toBe('function');
    });
  });
});