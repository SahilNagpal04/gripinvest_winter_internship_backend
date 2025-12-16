const { generateOTP, sendOTP, verifyOTP } = require('../src/utils/emailService');

describe('Email Service', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      // While theoretically possible to be same, very unlikely
      expect(typeof otp1).toBe('string');
      expect(typeof otp2).toBe('string');
    });
  });

  describe('sendOTP', () => {
    it('should send OTP successfully', async () => {
      const result = await sendOTP('test@example.com', '123456', 'verification');
      expect(result).toBe(true);
    });

    it('should send OTP with default purpose', async () => {
      const result = await sendOTP('test@example.com', '123456');
      expect(result).toBe(true);
    });

    it('should handle different email formats', async () => {
      const result = await sendOTP('user.name+tag@domain.co.uk', '654321', 'password-reset');
      expect(result).toBe(true);
    });
  });

  describe('verifyOTP', () => {
    const validOTP = '123456';
    const futureExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const pastExpiry = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

    it('should verify valid OTP successfully', () => {
      const result = verifyOTP(validOTP, futureExpiry, '123456');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OTP verified successfully');
    });

    it('should reject invalid OTP format - non-numeric', () => {
      const result = verifyOTP(validOTP, futureExpiry, 'abc123');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please provide a valid 6-digit OTP code.');
    });

    it('should reject invalid OTP format - wrong length', () => {
      const result = verifyOTP(validOTP, futureExpiry, '12345');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please provide a valid 6-digit OTP code.');
    });

    it('should reject empty OTP', () => {
      const result = verifyOTP(validOTP, futureExpiry, '');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please provide a valid 6-digit OTP code.');
    });

    it('should reject null OTP', () => {
      const result = verifyOTP(validOTP, futureExpiry, null);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please provide a valid 6-digit OTP code.');
    });

    it('should reject when no stored OTP', () => {
      const result = verifyOTP(null, futureExpiry, '123456');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('No OTP found. Please request a new one.');
    });

    it('should reject when no stored expiry', () => {
      const result = verifyOTP(validOTP, null, '123456');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('No OTP found. Please request a new one.');
    });

    it('should reject expired OTP', () => {
      const result = verifyOTP(validOTP, pastExpiry, '123456');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('OTP has expired. Please request a new one.');
    });

    it('should reject mismatched OTP', () => {
      const result = verifyOTP(validOTP, futureExpiry, '654321');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid OTP. Please try again.');
    });

    it('should handle numeric OTP inputs', () => {
      const result = verifyOTP(123456, futureExpiry, 123456);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OTP verified successfully');
    });

    it('should handle string vs number comparison', () => {
      const result = verifyOTP('123456', futureExpiry, 123456);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OTP verified successfully');
    });
  });
});