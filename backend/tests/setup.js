const { pool } = require('../src/config/database');

// Run before all tests
beforeAll(async () => {
  console.log('🧪 Test suite starting...');
});

// Run after all tests
afterAll(async () => {
  console.log('🧪 Test suite completed. Cleaning up...');
  await pool.end();
});

// Helper function to clear database
const clearDatabase = async () => {
  await pool.query('DELETE FROM transaction_logs');
  await pool.query('DELETE FROM investments');
  await pool.query('DELETE FROM investment_products WHERE name LIKE "Test%"');
  await pool.query('DELETE FROM users WHERE email LIKE "test%"');
};

module.exports = {
  clearDatabase
};
