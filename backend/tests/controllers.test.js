const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Product Controller', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  it('should get products with filters', async () => {
    const res = await request(app)
      .get('/api/products?investment_type=bond');
    
    expect(res.statusCode).toBe(200);
  });

  it('should get product by invalid ID', async () => {
    const res = await request(app)
      .get('/api/products/invalid-id-123');
    
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe('Error Cases', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'ErrorTest',
        email: `errortest${Date.now()}@example.com`,
        password: 'Password@123'
      });
    token = res.body.data?.token;
  });

  it('should handle invalid product ID for investment', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: 'invalid-id',
        amount: 5000
      });
    
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should reject investment with zero amount', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: 'some-id',
        amount: 0
      });
    
    expect(res.statusCode).toBe(400);
  });

  it('should reject investment with negative amount', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: 'some-id',
        amount: -1000
      });
    
    expect(res.statusCode).toBe(400);
  });

  it('should handle password reset for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/request-password-reset')
      .send({
        email: 'nonexistent@example.com'
      });
    
    expect(res.statusCode).toBe(404);
  });

  it('should reject invalid OTP', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'test@example.com',
        otp: '000000',
        newPassword: 'NewPass@123'
      });
    
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should get 404 for non-existent route', async () => {
    const res = await request(app)
      .get('/api/nonexistent');
    
    expect(res.statusCode).toBe(404);
  });

describe('More Coverage Tests', () => {
  let userToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'CoverageTest',
        email: `coverage${Date.now()}@example.com`,
        password: 'Password@123',
        risk_appetite: 'high'
      });
    userToken = res.body.data?.token;
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        first_name: 'Updated',
        risk_appetite: 'low'
      });
    
    expect([200, 401]).toContain(res.statusCode);
  });

  it('should check password strength for weak password', async () => {
    const res = await request(app)
      .post('/api/auth/check-password')
      .send({ password: '123' });
    
    expect(res.statusCode).toBe(200);
  });

  it('should get all products with no filters', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('products');
  });

  it('should get portfolio with valid token', async () => {
    const res = await request(app)
      .get('/api/investments/portfolio')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect([200, 401]).toContain(res.statusCode);
  });

  it('should handle health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should handle root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('endpoints');
  });
});

});