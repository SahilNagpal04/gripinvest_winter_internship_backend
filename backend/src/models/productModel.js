const { query } = require('../config/database');

/**
 * Get all products with optional filters
 */
const getAllProducts = async (filters = {}) => {
  let sql = 'SELECT * FROM investment_products WHERE is_active = TRUE';
  const params = [];

  if (filters.investment_type) {
    sql += ' AND investment_type = ?';
    params.push(filters.investment_type);
  }

  if (filters.risk_level) {
    sql += ' AND risk_level = ?';
    params.push(filters.risk_level);
  }

  if (filters.min_yield) {
    sql += ' AND annual_yield >= ?';
    params.push(filters.min_yield);
  }

  sql += ' ORDER BY annual_yield DESC';

  return await query(sql, params);
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  const products = await query(
    'SELECT * FROM investment_products WHERE id = ? AND is_active = TRUE',
    [productId]
  );

  return products.length > 0 ? products[0] : null;
};

/**
 * Get products recommended for user based on risk appetite
 */
const getRecommendedProducts = async (riskAppetite) => {
  return await query(
    `SELECT * FROM investment_products 
     WHERE risk_level = ? AND is_active = TRUE 
     ORDER BY annual_yield DESC`,
    [riskAppetite]
  );
};

/**
 * Get top performing products
 */
const getTopProducts = async (limit = 5) => {
  return await query(
    `SELECT * FROM investment_products WHERE is_active = TRUE ORDER BY annual_yield DESC LIMIT ${limit}`
  );
};

module.exports = {
  getAllProducts,
  getProductById,
  getRecommendedProducts,
  getTopProducts
};
