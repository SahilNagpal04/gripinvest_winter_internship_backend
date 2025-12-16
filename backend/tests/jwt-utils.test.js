const { generateToken, verifyToken, refreshToken } = require('../src/utils/jwtUtils');
const jwt = require('jsonwebtoken');

describe('JWT Utils', () => {
  const testUserId = 'test-user-123';
  const testSecret = 'test-secret-key';
  
  beforeAll(() => {
    process.env.JWT_SECRET = testSecret;
    process.env.JWT_EXPIRE = '1h';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUserId);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate token with correct payload', () => {
      const token = generateToken(testUserId);
      const decoded = jwt.verify(token, testSecret);
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1');
      const token2 = generateToken('user2');
      expect(token1).not.toBe(token2);
    });

    it('should handle missing JWT_SECRET', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => generateToken(testUserId)).toThrow();
      
      process.env.JWT_SECRET = originalSecret;
    });

    it('should handle missing JWT_EXPIRE', () => {
      const originalExpire = process.env.JWT_EXPIRE;
      delete process.env.JWT_EXPIRE;
      
      const token = generateToken(testUserId);
      expect(typeof token).toBe('string');
      
      process.env.JWT_EXPIRE = originalExpire;
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken(testUserId);
      const result = verifyToken(token);
      expect(result.valid).toBe(true);
      expect(result.decoded.userId).toBe(testUserId);
    });

    it('should reject invalid token', () => {
      const result = verifyToken('invalid.token.here');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { userId: testUserId },
        testSecret,
        { expiresIn: '-1h' }
      );
      
      const result = verifyToken(expiredToken);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject token with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(
        { userId: testUserId },
        'wrong-secret',
        { expiresIn: '1h' }
      );
      
      const result = verifyToken(tokenWithWrongSecret);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed token', () => {
      const result = verifyToken('malformed-token');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty token', () => {
      const result = verifyToken('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle null token', () => {
      const result = verifyToken(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing JWT_SECRET during verification', () => {
      const token = generateToken(testUserId);
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      const result = verifyToken(token);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('refreshToken', () => {
    it('should refresh valid token', () => {
      const originalToken = generateToken(testUserId);
      const result = refreshToken(originalToken);
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token).not.toBe(originalToken);
    });

    it('should extract correct userId from refreshed token', () => {
      const originalToken = generateToken(testUserId);
      const result = refreshToken(originalToken);
      expect(result.success).toBe(true);
      
      const decoded = jwt.verify(result.token, testSecret);
      expect(decoded.userId).toBe(testUserId);
    });

    it('should reject invalid token for refresh', () => {
      const result = refreshToken('invalid.token.here');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject expired token for refresh', () => {
      const expiredToken = jwt.sign(
        { userId: testUserId },
        testSecret,
        { expiresIn: '-1h' }
      );
      
      const result = refreshToken(expiredToken);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle token without userId', () => {
      const tokenWithoutUserId = jwt.sign(
        { someOtherField: 'value' },
        testSecret,
        { expiresIn: '1h' }
      );
      
      const result = refreshToken(tokenWithoutUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle null token for refresh', () => {
      const result = refreshToken(null);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty token for refresh', () => {
      const result = refreshToken('');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle very long userId', () => {
      const longUserId = 'a'.repeat(1000);
      const token = generateToken(longUserId);
      const result = verifyToken(token);
      expect(result.valid).toBe(true);
      expect(result.decoded.userId).toBe(longUserId);
    });

    it('should handle special characters in userId', () => {
      const specialUserId = 'user@domain.com-123_test';
      const token = generateToken(specialUserId);
      const result = verifyToken(token);
      expect(result.valid).toBe(true);
      expect(result.decoded.userId).toBe(specialUserId);
    });

    it('should handle numeric userId', () => {
      const numericUserId = 12345;
      const token = generateToken(numericUserId);
      const result = verifyToken(token);
      expect(result.valid).toBe(true);
      expect(result.decoded.userId).toBe(numericUserId);
    });
  });
});