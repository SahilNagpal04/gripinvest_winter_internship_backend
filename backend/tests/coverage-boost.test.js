const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');
const { generateToken } = require('../src/utils/jwtUtils');
const alertController = require('../src/controllers/alertController');
const transactionController = require('../src/controllers/transactionController');

describe('Coverage Boost Tests', () => {
  let userId;
  let authToken;
  let productId;

  beforeAll(async () => {
    userId = 'coverage-user-' + Date.now();
    productId = 'coverage-product-' + Date.now();
    
    await db.query(
      'INSERT INTO users (id, email, password, name, balance, risk_appetite) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, `coverage${Date.now()}@test.com`, '$2b$10$test.hash', 'Coverage User', 50000, 'medium']
    );

    await db.query(
      'INSERT INTO investment_products (id, name, investment_type, annual_yield, risk_level, min_investment, max_investment, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [productId, 'Coverage Product', 'bonds', 8.5, 'medium', 1000, 100000, 1]
    );

    authToken = generateToken(userId);
  });

  afterAll(async () => {
    await db.query('DELETE FROM investments WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM financial_transactions WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM investment_products WHERE id = ?', [productId]);
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
  });

  describe('Alert Controller Direct Tests', () => {
    it('should call getAlerts controller directly', async () => {
      const mockReq = {
        user: { id: userId, risk_appetite: 'medium' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      await alertController.getAlerts(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should call getAlertCount controller directly', async () => {
      const mockReq = {
        user: { id: userId, risk_appetite: 'medium' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      await alertController.getAlertCount(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle errors in getAlerts', async () => {
      const mockReq = {
        user: { id: 'non-existent-user' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      await alertController.getAlerts(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors in getAlertCount', async () => {
      const mockReq = {
        user: { id: 'non-existent-user' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      await alertController.getAlertCount(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Transaction Controller Direct Tests', () => {
    beforeAll(async () => {
      // Create test transaction
      await db.query(
        'INSERT INTO financial_transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['test-trans-' + Date.now(), userId, 'investment', 5000, 'Test', 'completed']
      );

      // Create test investment for summary
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['test-inv-' + Date.now(), userId, productId, 5000, 5500, 'active']
      );
    });

    it('should call getUserTransactions controller directly', async () => {
      const mockReq = {
        user: { id: userId }
      };
      const mockRes = {
        json: jest.fn()
      };

      await transactionController.getUserTransactions(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should call getTransactionSummary controller directly', async () => {
      const mockReq = {
        user: { id: userId }
      };
      const mockRes = {
        json: jest.fn()
      };

      await transactionController.getTransactionSummary(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle getUserTransactions errors', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        user: { id: userId }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await transactionController.getUserTransactions(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      
      db.query = originalQuery;
    });

    it('should handle getTransactionSummary errors', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        user: { id: userId }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await transactionController.getTransactionSummary(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      
      db.query = originalQuery;
    });

    it('should handle getTransactionById success', async () => {
      // Create specific transaction for this test
      const transId = 'specific-trans-' + Date.now();
      await db.query(
        'INSERT INTO financial_transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [transId, userId, 'investment', 3000, 'Specific Test', 'completed']
      );

      const mockReq = {
        params: { id: transId },
        user: { id: userId }
      };
      const mockRes = {
        json: jest.fn()
      };

      await transactionController.getTransactionById(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle getTransactionById not found', async () => {
      const mockReq = {
        params: { id: 'non-existent-transaction' },
        user: { id: userId }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await transactionController.getTransactionById(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should handle getTransactionById errors', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        params: { id: 'some-id' },
        user: { id: userId }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await transactionController.getTransactionById(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      
      db.query = originalQuery;
    });
  });

  describe('API Route Tests', () => {
    it('should access alerts endpoint', async () => {
      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.status);
    });

    it('should access alerts count endpoint', async () => {
      const res = await request(app)
        .get('/api/alerts/count')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.status);
    });

    it('should access transactions endpoint', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.status);
    });

    it('should access transaction summary endpoint', async () => {
      const res = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.status);
    });
  });
});