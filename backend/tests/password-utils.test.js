const { hashPassword, comparePassword, checkPasswordStrength } = require('../src/utils/passwordUtils');

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Due to salt
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      expect(typeof hash).toBe('string');
    });

    it('should handle very long password', async () => {
      const longPassword = 'a'.repeat(1000);
      const hash = await hashPassword(longPassword);
      expect(typeof hash).toBe('string');
    });

    it('should handle special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(specialPassword);
      expect(typeof hash).toBe('string');
    });

    it('should handle unicode characters', async () => {
      const unicodePassword = 'пароль123!';
      const hash = await hashPassword(unicodePassword);
      expect(typeof hash).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);
      
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('', hash);
      
      expect(isMatch).toBe(false);
    });

    it('should return false for password against empty hash', async () => {
      const password = 'TestPassword123!';
      const isMatch = await comparePassword(password, '');
      
      expect(isMatch).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('testpassword123!', hash);
      
      expect(isMatch).toBe(false);
    });

    it('should handle invalid hash format', async () => {
      const password = 'TestPassword123!';
      const isMatch = await comparePassword(password, 'invalid-hash');
      
      expect(isMatch).toBe(false);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should return strong for complex password', () => {
      const result = checkPasswordStrength('StrongPassword123!@#');
      
      expect(result.strength).toBe('Strong');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.suggestions).toHaveLength(0);
    });

    it('should return medium for moderately complex password', () => {
      const result = checkPasswordStrength('Password123');
      
      expect(result.strength).toBe('Medium');
      expect(result.score).toBeGreaterThan(40);
      expect(result.score).toBeLessThan(80);
    });

    it('should return weak for simple password', () => {
      const result = checkPasswordStrength('password');
      
      expect(result.strength).toBe('Weak');
      expect(result.score).toBeLessThan(40);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should suggest uppercase letters', () => {
      const result = checkPasswordStrength('password123!');
      
      expect(result.suggestions).toContain('Add uppercase letters');
    });

    it('should suggest lowercase letters', () => {
      const result = checkPasswordStrength('PASSWORD123!');
      
      expect(result.suggestions).toContain('Add lowercase letters');
    });

    it('should suggest numbers', () => {
      const result = checkPasswordStrength('Password!');
      
      expect(result.suggestions).toContain('Add numbers');
    });

    it('should suggest special characters', () => {
      const result = checkPasswordStrength('Password123');
      
      expect(result.suggestions).toContain('Add special characters (!@#$%^&*)');
    });

    it('should suggest longer length', () => {
      const result = checkPasswordStrength('Pass1!');
      
      expect(result.suggestions).toContain('Use at least 8 characters');
    });

    it('should handle empty password', () => {
      const result = checkPasswordStrength('');
      
      expect(result.strength).toBe('Weak');
      expect(result.score).toBe(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle very long password', () => {
      const longPassword = 'A'.repeat(100) + '1!';
      const result = checkPasswordStrength(longPassword);
      
      expect(result.strength).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle password with only numbers', () => {
      const result = checkPasswordStrength('123456789');
      
      expect(result.strength).toBe('Weak');
      expect(result.suggestions).toContain('Add uppercase letters');
      expect(result.suggestions).toContain('Add lowercase letters');
      expect(result.suggestions).toContain('Add special characters (!@#$%^&*)');
    });

    it('should handle password with only special characters', () => {
      const result = checkPasswordStrength('!@#$%^&*');
      
      expect(result.strength).toBe('Weak');
      expect(result.suggestions).toContain('Add uppercase letters');
      expect(result.suggestions).toContain('Add lowercase letters');
      expect(result.suggestions).toContain('Add numbers');
    });

    it('should handle mixed case without numbers or special chars', () => {
      const result = checkPasswordStrength('PasswordTest');
      
      expect(result.strength).toBe('Medium');
      expect(result.suggestions).toContain('Add numbers');
      expect(result.suggestions).toContain('Add special characters (!@#$%^&*)');
    });

    it('should give perfect score for very strong password', () => {
      const result = checkPasswordStrength('VeryStrongPassword123!@#$%^&*()');
      
      expect(result.strength).toBe('Strong');
      expect(result.score).toBe(100);
      expect(result.suggestions).toHaveLength(0);
    });

    it('should handle unicode characters', () => {
      const result = checkPasswordStrength('Пароль123!');
      
      expect(result.strength).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle repeated characters', () => {
      const result = checkPasswordStrength('aaaaaaaaA1!');
      
      expect(result.strength).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle null password in hashPassword', async () => {
      try {
        await hashPassword(null);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle undefined password in hashPassword', async () => {
      try {
        await hashPassword(undefined);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle null values in comparePassword', async () => {
      const result = await comparePassword(null, null);
      expect(result).toBe(false);
    });

    it('should handle undefined values in comparePassword', async () => {
      const result = await comparePassword(undefined, undefined);
      expect(result).toBe(false);
    });

    it('should handle null password in checkPasswordStrength', () => {
      const result = checkPasswordStrength(null);
      expect(result.strength).toBe('Weak');
      expect(result.score).toBe(0);
    });

    it('should handle undefined password in checkPasswordStrength', () => {
      const result = checkPasswordStrength(undefined);
      expect(result.strength).toBe('Weak');
      expect(result.score).toBe(0);
    });
  });
});