const mysql = require('mysql2/promise');

async function testResend() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gripinvest_db'
  });

  const userId = 'YOUR_USER_ID'; // Replace with actual userId
  
  console.log('\n=== Before Resend ===');
  let [users] = await connection.execute(
    'SELECT two_factor_code, two_factor_expires FROM users WHERE id = ?',
    [userId]
  );
  console.log('OTP:', users[0]?.two_factor_code);
  console.log('Expires:', users[0]?.two_factor_expires);

  // Simulate resend - generate new OTP
  const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  await connection.execute(
    'UPDATE users SET two_factor_code = ?, two_factor_expires = ? WHERE id = ?',
    [newOTP, newExpiry, userId]
  );

  console.log('\n=== After Resend ===');
  [users] = await connection.execute(
    'SELECT two_factor_code, two_factor_expires FROM users WHERE id = ?',
    [userId]
  );
  console.log('New OTP:', users[0]?.two_factor_code);
  console.log('New Expires:', users[0]?.two_factor_expires);
  console.log('\nOld OTP should NOT work, only new OTP:', newOTP);

  await connection.end();
}

testResend().catch(console.error);
