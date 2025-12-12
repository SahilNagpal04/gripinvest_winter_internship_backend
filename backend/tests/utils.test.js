const dotenv = require('dotenv');
dotenv.config();

const { hashPassword, comparePassword, checkPasswordStrength } = require('../src/utils/passwordUtils');
const { generateToken, verifyToken } = require('../src/utils/jwtUtils');

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash password', async () => {
      const hash = await hashPassword('Test@123');
      expect(hash).toBeTruthy();
      expect(hash).not.toBe('Test@123');
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const hash = await hashPassword('Test@123');
      const result = await comparePassword('Test@123', hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await hashPassword('Test@123');
      const result = await comparePassword('Wrong@123', hash);
      expect(result).toBe(false);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should return strong for good password', () => {
      const result = checkPasswordStrength('Strong@Pass123');
      expect(result.level).toBe('strong');
      expect(result.isStrong).toBe(true);
    });

    it('should return weak for bad password', () => {
      const result = checkPasswordStrength('weak');
      expect(result.level).toBe('weak');
      expect(result.isStrong).toBe(false);
    });

    it('should return strong for medium password', () => {
      const result = checkPasswordStrength('Medium123');
      expect(result.level).toBe('strong');
    });

    it('should give feedback for missing elements', () => {
      const result = checkPasswordStrength('password');
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });
});

describe('JWT Utils', () => {
  describe('generateToken', () => {
    it('should generate valid token', () => {
      const token = generateToken({ userId: '123', email: 'test@example.com' });
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken({ userId: '123', email: 'test@example.com' });
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid_token')).toThrow();
    });
  });
});