const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');
const { generateToken } = require('../src/utils/jwtUtils');

describe('Alert Controller', () => {
  let authToken;
  let userId;
  let productId;
  let investmentId;

  beforeAll(async () => {
    userId = 'test-alert-user-' + Date.now();
    productId = 'test-alert-product-' + Date.now();
    investmentId = 'test-alert-investment-' + Date.now();
    
    // Create test user
    await db.query(
      'INSERT INTO users (id, email, password, name, risk_appetite, balance) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, `alert${Date.now()}@test.com`, '$2b$10$test.hash.password', 'Alert User', 'medium', 50000]
    );

    // Create test product
    await db.query(
      'INSERT INTO investment_products (id, name, investment_type, annual_yield, risk_level, min_investment, max_investment, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [productId, 'Alert Product', 'bonds', 8.5, 'medium', 1000, 100000, 1]
    );

    // Create test investment maturing soon
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + 3);
    
    await db.query(
      'INSERT INTO investments (id, user_id, product_id, amount, expected_return, status, maturity_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [investmentId, userId, productId, 5000, 5425, 'active', maturityDate]
    );

    authToken = generateToken(userId);
  });

  afterAll(async () => {
    await db.query('DELETE FROM investments WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM investment_products WHERE id = ?', [productId]);
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
  });

  describe('GET /api/alerts', () => {
    it('should get alerts for authenticated user', async () => {
      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('alerts');
      expect(res.body.data).toHaveProperty('count');
      expect(Array.isArray(res.body.data.alerts)).toBe(true);
    });

    it('should include maturity alerts', async () => {
      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const maturityAlerts = res.body.data.alerts.filter(alert => alert.type === 'maturity');
      expect(maturityAlerts.length).toBeGreaterThan(0);
      expect(maturityAlerts[0]).toHaveProperty('message');
      expect(maturityAlerts[0]).toHaveProperty('amount');
      expect(maturityAlerts[0]).toHaveProperty('days');
      expect(maturityAlerts[0]).toHaveProperty('investmentId');
    });

    it('should handle user without risk appetite', async () => {
      // Create user without risk appetite
      const userWithoutRisk = 'test-no-risk-user-' + Date.now();
      await db.query(
        'INSERT INTO users (id, email, password, name, balance) VALUES (?, ?, ?, ?, ?)',
        [userWithoutRisk, `norisk${Date.now()}@test.com`, '$2b$10$test.hash', 'No Risk User', 10000]
      );

      const noRiskToken = generateToken(userWithoutRisk);

      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${noRiskToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.alerts).toBeDefined();

      await db.query('DELETE FROM users WHERE id = ?', [userWithoutRisk]);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/alerts');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/alerts/count', () => {
    it('should get alert count for authenticated user', async () => {
      const res = await request(app)
        .get('/api/alerts/count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('count');
      expect(typeof res.body.data.count).toBe('number');
    });

    it('should handle user without risk appetite for count', async () => {
      const userWithoutRisk = 'test-no-risk-count-user-' + Date.now();
      await db.query(
        'INSERT INTO users (id, email, password, name, balance) VALUES (?, ?, ?, ?, ?)',
        [userWithoutRisk, `noriskcount${Date.now()}@test.com`, '$2b$10$test.hash', 'No Risk Count User', 10000]
      );

      const noRiskToken = generateToken(userWithoutRisk);

      const res = await request(app)
        .get('/api/alerts/count')
        .set('Authorization', `Bearer ${noRiskToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBeDefined();

      await db.query('DELETE FROM users WHERE id = ?', [userWithoutRisk]);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/alerts/count');
      expect(res.status).toBe(401);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors in getAlerts', async () => {
      // Mock database error
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      
      db.query = originalQuery;
    });

    it('should handle database errors in getAlertCount', async () => {
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/alerts/count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      
      db.query = originalQuery;
    });
  });
});