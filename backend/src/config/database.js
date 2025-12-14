const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables before initialization
if (!process.env.DB_PASSWORD) {
  console.error('[DB_CONFIG] Missing required DB_PASSWORD environment variable');
  throw new Error('DB_PASSWORD environment variable is required');
}

console.log('[DB_CONFIG] Initializing database connection pool...');

// Create MySQL connection pool with optimized settings
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'gripinvest_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('[DB_CONFIG] Connection pool created successfully');

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
  console.log('[DB_TEST] Testing database connection...');
  try {
    const connection = await pool.getConnection();
    console.log('[DB_TEST] Database connected successfully');
    connection.release();
    console.log('[DB_TEST] Connection released back to pool');
    return true;
  } catch (error) {
    console.error('[DB_TEST] Database connection failed');
    return false;
  }
};

/**
 * Execute SQL query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const query = async (sql, params) => {
  console.log('[DB_QUERY] Executing query...');
  try {
    const [results] = await pool.execute(sql, params);
    console.log('[DB_QUERY] Query executed successfully');
    return results;
  } catch (error) {
    console.error('[DB_QUERY] Query execution failed');
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};