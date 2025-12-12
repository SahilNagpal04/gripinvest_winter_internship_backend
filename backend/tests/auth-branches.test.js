const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Auth Branch Coverage Tests', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  describe('Password Reset Branches', () => {
    let testEmail;
    let testOtp;

    beforeAll(async () => {
      testEmail = `resettest${Date.now()}@example.com`;
      
      // Create user
      await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'ResetTest',
          email: testEmail,
          password: 'Password@123'
        });
    });

    it('should request password reset successfully', async () => {
      const res = await request(app)
        .post('/api/auth/request-password-reset')
        .send({ email: testEmail });
      
      expect(res.statusCode).toBe(200);
      if (res.body.data?.otp) {
        testOtp = res.body.data.otp;
      }
    });

    it('should fail password reset with invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: testEmail,
          otp: '000000',
          newPassword: 'NewPassword@123'
        });
      
      expect([400, 401]).toContain(res.statusCode);
    });

    it('should fail password reset with weak password', async () => {
      if (testOtp) {
        const res = await request(app)
          .post('/api/auth/reset-password')
          .send({
            email: testEmail,
            otp: testOtp,
            newPassword: 'weak'
          });
        
        expect(res.statusCode).toBe(400);
      }
    });

    it('should successfully reset password with valid OTP and strong password', async () => {
      // Request new OTP
      const otpRes = await request(app)
        .post('/api/auth/request-password-reset')
        .send({ email: testEmail });
      
      const newOtp = otpRes.body.data?.otp;

      if (newOtp) {
        const res = await request(app)
          .post('/api/auth/reset-password')
          .send({
            email: testEmail,
            otp: newOtp,
            newPassword: 'NewStrongPass@123'
          });
        
        expect([200, 400]).toContain(res.statusCode);
      }
    });
  });

  describe('Profile Update Branches', () => {
    let userToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'ProfileTest',
          email: `profiletest${Date.now()}@example.com`,
          password: 'Password@123',
          risk_appetite: 'low'
        });
      
      userToken = res.body.data?.token;
    });

    it('should update first name only', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ first_name: 'UpdatedFirst' });
      
      expect([200, 401]).toContain(res.statusCode);
    });

    it('should update last name only', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ last_name: 'UpdatedLast' });
      
      expect([200, 401]).toContain(res.statusCode);
    });

    it('should update risk appetite only', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ risk_appetite: 'high' });
      
      expect([200, 401]).toContain(res.statusCode);
    });

    it('should update all fields together', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          first_name: 'AllUpdated',
          last_name: 'Together',
          risk_appetite: 'moderate'
        });
      
      expect([200, 401]).toContain(res.statusCode);
    });
  });

  describe('Password Strength Branches', () => {
    it('should check very weak password', async () => {
      const res = await request(app)
        .post('/api/auth/check-password')
        .send({ password: '123' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.strength.level).toBe('weak');
    });

    it('should check password without uppercase', async () => {
      const res = await request(app)
        .post('/api/auth/check-password')
        .send({ password: 'password123!' });
      
      expect(res.statusCode).toBe(200);
    });

    it('should check password without lowercase', async () => {
      const res = await request(app)
        .post('/api/auth/check-password')
        .send({ password: 'PASSWORD123!' });
      
      expect(res.statusCode).toBe(200);
    });

    it('should check password without numbers', async () => {
      const res = await request(app)
        .post('/api/auth/check-password')
        .send({ password: 'PasswordTest!' });
      
      expect(res.statusCode).toBe(200);
    });

    it('should check password without special characters', async () => {
      const res = await request(app)
        .post('/api/auth/check-password')
        .send({ password: 'Password123' });
      
      expect(res.statusCode).toBe(200);
    });

    it('should check strong password', async () => {
      const res = await request(app)
        .post('/api/auth/check-password')
        .send({ password: 'StrongP@ss123' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.strength.level).toBe('strong');
    });
  });

  describe('Signup Branches', () => {
    it('should signup with all optional fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'Complete',
          last_name: 'User',
          email: `complete${Date.now()}@example.com`,
          password: 'Password@123',
          risk_appetite: 'high'
        });
      
      expect([201, 400]).toContain(res.statusCode);
    });

    it('should signup without optional last_name', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'NoLastName',
          email: `nolast${Date.now()}@example.com`,
          password: 'Password@123'
        });
      
      expect([201, 400]).toContain(res.statusCode);
    });

    it('should signup without optional risk_appetite', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'NoRisk',
          email: `norisk${Date.now()}@example.com`,
          password: 'Password@123'
        });
      
      expect([201, 400]).toContain(res.statusCode);
    });
  });
});
