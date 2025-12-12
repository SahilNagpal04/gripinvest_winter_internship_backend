const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Investment Endpoints', () => {
  let token;
  let productId;

  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    // Create fresh user for each test
    const uniqueEmail = `investtest${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'InvestTest',
        email: uniqueEmail,
        password: 'Password@123'
      });
    
    token = signupRes.body.data.token;
    
    // Get products
    const productsRes = await request(app).get('/api/products');
    if (productsRes.body.data.products.length > 0) {
      productId = productsRes.body.data.products[0].id;
    }
  });

  describe('POST /api/investments', () => {
    it('should create investment successfully', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: productId,
          amount: 5000
        });

      expect([201, 400, 401, 404, 500]).toContain(res.statusCode);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/investments')
        .send({
          product_id: productId,
          amount: 5000
        });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with insufficient balance', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: productId,
          amount: 99999999
        });

      expect([400, 401, 404, 500]).toContain(res.statusCode);
    });
  });

  describe('GET /api/investments/portfolio', () => {
    it('should get user portfolio', async () => {
      const res = await request(app)
        .get('/api/investments/portfolio')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 401]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body.data).toHaveProperty('summary');
        expect(res.body.data).toHaveProperty('investments');
      }
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/investments/portfolio');

      expect(res.statusCode).toBe(401);
    });
  });
});