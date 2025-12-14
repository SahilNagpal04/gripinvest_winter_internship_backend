const mysql = require('mysql2/promise');

async function quickTest() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gripinvest_db'
  });

  // Get the latest user with OTP
  const [users] = await connection.execute(
    `SELECT id, email, two_factor_code, two_factor_expires FROM users WHERE email = 'sahil@gmail.com'`
  );
  
  if (users.length > 0) {
    const user = users[0];
    console.log('\n=== Current User State ===');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Stored OTP:', user.two_factor_code);
    console.log('Expires:', user.two_factor_expires);
    console.log('Is Expired:', new Date() > new Date(user.two_factor_expires));
    
    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log('\n=== Generating New OTP ===');
    console.log('New OTP:', newOTP);
    console.log('New Expiry:', newExpiry);
    
    // Update
    await connection.execute(
      'UPDATE users SET two_factor_code = ?, two_factor_expires = ? WHERE id = ?',
      [newOTP, newExpiry, user.id]
    );
    
    // Verify update
    const [updated] = await connection.execute(
      'SELECT two_factor_code, two_factor_expires FROM users WHERE id = ?',
      [user.id]
    );
    
    console.log('\n=== After Update ===');
    console.log('Stored OTP:', updated[0].two_factor_code);
    console.log('Stored Expiry:', updated[0].two_factor_expires);
    console.log('\n✅ USE THIS OTP:', newOTP);
  }

  await connection.end();
}

quickTest().catch(console.error);
