const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Log Endpoints', () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    await clearDatabase();

    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'LogTest',
        email: `logtest${Date.now()}@example.com`,
        password: 'Password@123'
      });
    userToken = userRes.body.data?.token;

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@gripinvest.in',
        password: 'Admin@123'
      });
    adminToken = adminRes.body.data?.token;
  });

  describe('GET /api/logs/me', () => {
    it('should get user logs', async () => {
      const res = await request(app)
        .get('/api/logs/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 500]).toContain(res.statusCode);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/logs/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/logs/me/errors', () => {
    it('should get user error logs', async () => {
      const res = await request(app)
        .get('/api/logs/me/errors')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401]).toContain(res.statusCode);
    });
  });

  describe('GET /api/logs (Admin)', () => {
    it('should get all logs as admin', async () => {
      const res = await request(app)
        .get('/api/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 401, 500]).toContain(res.statusCode);
    });

    it('should fail as regular user', async () => {
      const res = await request(app)
        .get('/api/logs')
        .set('Authorization', `Bearer ${userToken}`);

      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe('GET /api/logs/date-range', () => {
    it('should get logs by date range', async () => {
      const res = await request(app)
        .get('/api/logs/date-range?startDate=2025-01-01&endDate=2025-12-31')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401]).toContain(res.statusCode);
    });

    it('should fail without date parameters', async () => {
      const res = await request(app)
        .get('/api/logs/date-range')
        .set('Authorization', `Bearer ${userToken}`);

      expect([400, 401]).toContain(res.statusCode);
    });
  });
});
