const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      first_name: 'Test',
      last_name: 'User',
      email: 'testnew@example.com',
      password: 'Password@123',
      risk_appetite: 'moderate'
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.status).toBe('success');
  expect(res.body.data).toHaveProperty('token');
  expect(res.body.data.user.email).toBe('testnew@example.com');
});

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'Test',
          email: 'test2@example.com',
          password: 'weak'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'Test',
          email: 'test@example.com',
          password: 'Password@123'
        });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'Test2',
          email: 'test@example.com',
          password: 'Password@123'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'Test',
          email: 'test@example.com',
          password: 'Password@123'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password@123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword@123'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password@123'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/check-password', () => {
    it('should check password strength', async () => {
      const res = await request(app)
        .post('/api/auth/check-password')
        .send({
          password: 'StrongP@ss123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.strength).toHaveProperty('score');
      expect(res.body.data.strength).toHaveProperty('level');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'Test',
          email: 'test@example.com',
          password: 'Password@123'
        });
      token = signupRes.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
    });
  });
});
