const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Investment Endpoints', () => {
  let token;
  let userId;
  let productId;

  beforeAll(async () => {
    await clearDatabase();

    // Create and login user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'Test',
        email: 'testinvest@example.com',
        password: 'Password@123'
      });
    token = signupRes.body.data.token;
    userId = signupRes.body.data.user.id;

    // Get a product
    const productsRes = await request(app).get('/api/products');
    productId = productsRes.body.data.products[0].id;
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

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.investment).toHaveProperty('id');
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

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Insufficient balance');
    });

    it('should fail with invalid amount', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: productId,
          amount: -1000
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/investments/portfolio', () => {
    it('should get user portfolio', async () => {
      const res = await request(app)
        .get('/api/investments/portfolio')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('investments');
      expect(res.body.data).toHaveProperty('insights');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/investments/portfolio');

      expect(res.statusCode).toBe(401);
    });
  });
});
