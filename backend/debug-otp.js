const mysql = require('mysql2/promise');

async function debugOTP() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gripinvest_db'
  });

  console.log('\n=== Checking Database Columns ===');
  const [columns] = await connection.execute(
    `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'gripinvest_db' AND TABLE_NAME = 'users' 
     AND (COLUMN_NAME LIKE 'two_factor%' OR COLUMN_NAME = 'email_verified')`
  );
  console.log('Columns:', columns);

  console.log('\n=== Checking Recent User OTPs ===');
  const [users] = await connection.execute(
    `SELECT id, email, two_factor_code, two_factor_expires, email_verified 
     FROM users ORDER BY updated_at DESC LIMIT 5`
  );
  
  users.forEach(user => {
    console.log(`\nUser: ${user.email}`);
    console.log(`  OTP: ${user.two_factor_code}`);
    console.log(`  Expires: ${user.two_factor_expires}`);
    console.log(`  Verified: ${user.email_verified}`);
    console.log(`  Expired: ${user.two_factor_expires ? new Date() > new Date(user.two_factor_expires) : 'N/A'}`);
  });

  await connection.end();
}

debugOTP().catch(console.error);
