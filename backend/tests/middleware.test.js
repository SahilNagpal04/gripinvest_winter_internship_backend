const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');
const jwt = require('jsonwebtoken');

describe('Middleware Tests', () => {
  let userId;
  let authToken;

  beforeAll(async () => {
    userId = 'test-middleware-user';
    await db.query(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, 'middleware@test.com', '$2b$10$test.hash.password', 'Middleware User', 'user']
    );

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'middleware@test.com', password: 'Test@123' });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
  });

  describe('Auth Middleware', () => {
    it('should allow access with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Access denied. No token provided.');
    });

    it('should reject request with invalid token format', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Access denied. No token provided.');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token.');
    });

    it('should reject request with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token.');
    });

    it('should handle user not found in database', async () => {
      const tokenForNonExistentUser = jwt.sign(
        { userId: 'non-existent-user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tokenForNonExistentUser}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('User not found.');
    });

    it('should handle database errors during user lookup', async () => {
      const originalQuery = db.query;
      let callCount = 0;
      
      db.query = jest.fn().mockImplementation((query, params) => {
        callCount++;
        if (callCount === 2) { // Second call is user lookup
          throw new Error('Database connection error');
        }
        return originalQuery.call(db, query, params);
      });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      
      db.query = originalQuery;
    });
  });

  describe('Admin Middleware', () => {
    let adminToken;
    let adminUserId;

    beforeAll(async () => {
      adminUserId = 'test-admin-user';
      await db.query(
        'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [adminUserId, 'admin@test.com', '$2b$10$test.hash.password', 'Admin User', 'admin']
      );

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Test@123' });
      
      adminToken = loginRes.body.token;
    });

    afterAll(async () => {
      await db.query('DELETE FROM users WHERE id = ?', [adminUserId]);
    });

    it('should allow admin access to admin routes', async () => {
      const res = await request(app)
        .get('/api/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should deny non-admin access to admin routes', async () => {
      const res = await request(app)
        .get('/api/logs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied. Admin privileges required.');
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle validation errors', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}); // Empty body to trigger validation error

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should handle 404 errors', async () => {
      const res = await request(app)
        .get('/api/nonexistent-endpoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should handle internal server errors', async () => {
      // Create a route that throws an error for testing
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      
      db.query = originalQuery;
    });
  });

  describe('Logger Middleware', () => {
    it('should log successful requests', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      // Logger middleware runs in background, so we just verify the request succeeds
    });

    it('should log failed requests', async () => {
      const res = await request(app)
        .get('/api/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      // Logger middleware runs in background
    });

    it('should handle anonymous requests', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401); // Will fail auth but logger should still work
    });
  });
});