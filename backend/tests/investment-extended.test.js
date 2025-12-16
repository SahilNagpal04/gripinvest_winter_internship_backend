const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Investment Controller Extended Tests', () => {
  let authToken;
  let userId;
  let productId;
  let investmentId;

  beforeAll(async () => {
    userId = 'test-investment-ext-user';
    await db.query(
      'INSERT INTO users (id, email, password, name, balance, risk_appetite) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'investext@test.com', '$2b$10$test.hash.password', 'Investment Ext User', 50000, 'medium']
    );

    productId = 'test-investment-ext-product';
    await db.query(
      'INSERT INTO investment_products (id, name, investment_type, annual_yield, risk_level, min_investment, max_investment, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [productId, 'Extended Test Product', 'bonds', 8.5, 'medium', 1000, 100000, 1]
    );

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'investext@test.com', password: 'Test@123' });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await db.query('DELETE FROM investments WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM investment_products WHERE id = ?', [productId]);
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
  });

  describe('Portfolio Summary with AI Insights', () => {
    beforeAll(async () => {
      // Create test investments for portfolio
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['test-portfolio-inv-1', userId, productId, 10000, 10850, 'active']
      );
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['test-portfolio-inv-2', userId, productId, 5000, 5425, 'matured']
      );
    });

    it('should get portfolio summary with AI insights', async () => {
      const res = await request(app)
        .get('/api/investments/portfolio/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('aiInsights');
      expect(res.body.data.summary).toHaveProperty('totalInvested');
      expect(res.body.data.summary).toHaveProperty('currentValue');
      expect(res.body.data.summary).toHaveProperty('totalReturns');
      expect(res.body.data.aiInsights).toHaveProperty('riskAnalysis');
      expect(res.body.data.aiInsights).toHaveProperty('recommendations');
    });

    it('should handle empty portfolio', async () => {
      // Create user with no investments
      const emptyUserId = 'test-empty-portfolio-user';
      await db.query(
        'INSERT INTO users (id, email, password, name, balance) VALUES (?, ?, ?, ?, ?)',
        [emptyUserId, 'empty@test.com', '$2b$10$test.hash', 'Empty User', 10000]
      );

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'empty@test.com', password: 'Test@123' });

      const res = await request(app)
        .get('/api/investments/portfolio/summary')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalInvested).toBe(0);

      await db.query('DELETE FROM users WHERE id = ?', [emptyUserId]);
    });
  });

  describe('Investment Creation Edge Cases', () => {
    it('should handle insufficient balance', async () => {
      // Create user with low balance
      const lowBalanceUserId = 'test-low-balance-user';
      await db.query(
        'INSERT INTO users (id, email, password, name, balance) VALUES (?, ?, ?, ?, ?)',
        [lowBalanceUserId, 'lowbalance@test.com', '$2b$10$test.hash', 'Low Balance User', 500]
      );

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'lowbalance@test.com', password: 'Test@123' });

      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({
          productId: productId,
          amount: 10000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient balance');

      await db.query('DELETE FROM users WHERE id = ?', [lowBalanceUserId]);
    });

    it('should handle investment below minimum', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          amount: 500 // Below minimum of 1000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('minimum investment');
    });

    it('should handle investment above maximum', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          amount: 150000 // Above maximum of 100000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('maximum investment');
    });

    it('should handle inactive product', async () => {
      // Create inactive product
      const inactiveProductId = 'test-inactive-product';
      await db.query(
        'INSERT INTO investment_products (id, name, investment_type, annual_yield, risk_level, min_investment, max_investment, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [inactiveProductId, 'Inactive Product', 'bonds', 8.5, 'medium', 1000, 100000, 0]
      );

      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: inactiveProductId,
          amount: 5000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not available');

      await db.query('DELETE FROM investment_products WHERE id = ?', [inactiveProductId]);
    });
  });

  describe('Investment Cancellation', () => {
    let cancellableInvestmentId;

    beforeAll(async () => {
      cancellableInvestmentId = 'test-cancellable-investment';
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        [cancellableInvestmentId, userId, productId, 5000, 5425, 'active']
      );
    });

    it('should cancel active investment', async () => {
      const res = await request(app)
        .delete(`/api/investments/${cancellableInvestmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cancelled successfully');
    });

    it('should not cancel already cancelled investment', async () => {
      const res = await request(app)
        .delete(`/api/investments/${cancellableInvestmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cannot be cancelled');
    });

    it('should not cancel matured investment', async () => {
      const maturedInvestmentId = 'test-matured-investment';
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        [maturedInvestmentId, userId, productId, 5000, 5425, 'matured']
      );

      const res = await request(app)
        .delete(`/api/investments/${maturedInvestmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cannot be cancelled');

      await db.query('DELETE FROM investments WHERE id = ?', [maturedInvestmentId]);
    });

    it('should handle non-existent investment cancellation', async () => {
      const res = await request(app)
        .delete('/api/investments/non-existent-investment')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Investment not found');
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database errors in portfolio summary', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/investments/portfolio/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      
      db.query = originalQuery;
    });

    it('should handle database errors in investment creation', async () => {
      const originalQuery = db.query;
      let callCount = 0;
      
      db.query = jest.fn().mockImplementation((query, params) => {
        callCount++;
        if (callCount === 3) { // Third call fails
          throw new Error('Database error');
        }
        return originalQuery.call(db, query, params);
      });

      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          amount: 5000
        });

      expect(res.status).toBe(500);
      
      db.query = originalQuery;
    });
  });

  describe('Investment Retrieval', () => {
    let retrievalInvestmentId;

    beforeAll(async () => {
      retrievalInvestmentId = 'test-retrieval-investment';
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        [retrievalInvestmentId, userId, productId, 5000, 5425, 'active']
      );
    });

    it('should get investment by id', async () => {
      const res = await request(app)
        .get(`/api/investments/${retrievalInvestmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(retrievalInvestmentId);
    });

    it('should handle non-existent investment retrieval', async () => {
      const res = await request(app)
        .get('/api/investments/non-existent-investment')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Investment not found');
    });

    it('should not allow access to other user\'s investment', async () => {
      // Create another user and investment
      const otherUserId = 'test-other-user';
      await db.query(
        'INSERT INTO users (id, email, password, name, balance) VALUES (?, ?, ?, ?, ?)',
        [otherUserId, 'other@test.com', '$2b$10$test.hash', 'Other User', 10000]
      );

      const otherInvestmentId = 'test-other-investment';
      await db.query(
        'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status) VALUES (?, ?, ?, ?, ?, ?)',
        [otherInvestmentId, otherUserId, productId, 5000, 5425, 'active']
      );

      const res = await request(app)
        .get(`/api/investments/${otherInvestmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Investment not found');

      await db.query('DELETE FROM investments WHERE id = ?', [otherInvestmentId]);
      await db.query('DELETE FROM users WHERE id = ?', [otherUserId]);
    });
  });
});