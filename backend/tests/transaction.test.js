const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');
const { generateToken } = require('../src/utils/jwtUtils');

describe('Transaction Controller', () => {
  let authToken;
  let userId;
  let transactionId;

  beforeAll(async () => {
    userId = 'test-transaction-user-' + Date.now();
    transactionId = 'test-transaction-id-' + Date.now();
    
    // Create test user
    await db.query(
      'INSERT INTO users (id, email, password, name, balance) VALUES (?, ?, ?, ?, ?)',
      [userId, `transaction${Date.now()}@test.com`, '$2b$10$test.hash.password', 'Transaction User', 50000]
    );

    // Create test transaction
    await db.query(
      'INSERT INTO financial_transactions (id, user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [transactionId, userId, 'investment', 5000, 'Test investment', 'completed']
    );

    authToken = generateToken(userId);
  });

  afterAll(async () => {
    await db.query('DELETE FROM financial_transactions WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
  });

  describe('GET /api/transactions', () => {
    it('should get user transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
    });

    it('should handle database errors', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to fetch transactions');
      
      db.query = originalQuery;
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get transaction by id', async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(transactionId);
    });

    it('should return 404 for non-existent transaction', async () => {
      const res = await request(app)
        .get('/api/transactions/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Transaction not found');
    });

    it('should require authentication', async () => {
      const res = await request(app).get(`/api/transactions/${transactionId}`);
      expect(res.status).toBe(401);
    });

    it('should handle database errors', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to fetch transaction');
      
      db.query = originalQuery;
    });
  });

  describe('GET /api/transactions/summary', () => {
    beforeAll(async () => {
      // Create test investment for summary
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['test-summary-investment', userId, 'test-product', 5000, 5500, 'active']
      );
    });

    afterAll(async () => {
      await db.query('DELETE FROM investments WHERE id = ?', ['test-summary-investment']);
    });

    it('should get transaction summary', async () => {
      const res = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_transactions');
      expect(res.body).toHaveProperty('total_credits');
      expect(res.body).toHaveProperty('total_debits');
      expect(res.body).toHaveProperty('active_investments');
      expect(res.body).toHaveProperty('cancelled_investments');
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/transactions/summary');
      expect(res.status).toBe(401);
    });

    it('should handle database errors', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to fetch summary');
      
      db.query = originalQuery;
    });
  });
});