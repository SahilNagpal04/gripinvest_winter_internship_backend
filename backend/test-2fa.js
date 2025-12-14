// Quick test script for 2FA functionality
require('dotenv').config();
const { generateOTP, sendOTP, verifyOTP } = require('./src/utils/emailService');

console.log('🧪 Testing 2FA Email Service...\n');

// Test 1: Generate OTP
console.log('Test 1: Generate OTP');
const otp = generateOTP();
console.log(`✅ Generated OTP: ${otp}\n`);

// Test 2: Send OTP
console.log('Test 2: Send OTP');
sendOTP('test@example.com', otp, 'Testing')
  .then(() => {
    console.log('✅ OTP sent successfully\n');

    // Test 3: Verify OTP
    console.log('Test 3: Verify OTP');
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    
    // Test valid OTP
    const result1 = verifyOTP(otp, expiryTime, otp);
    console.log('Valid OTP:', result1);
    
    // Test invalid OTP
    const result2 = verifyOTP(otp, expiryTime, '000000');
    console.log('Invalid OTP:', result2);
    
    // Test expired OTP
    const expiredTime = new Date(Date.now() - 1000);
    const result3 = verifyOTP(otp, expiredTime, otp);
    console.log('Expired OTP:', result3);
    
    console.log('\n✅ All tests completed!');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
