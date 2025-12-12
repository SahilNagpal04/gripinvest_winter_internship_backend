const { query } = require('../config/database');

/**
 * Create new investment product (Admin only)
 */
const createProduct = async (productData) => {
  const {
    name,
    investment_type,
    tenure_months,
    annual_yield,
    risk_level,
    min_investment,
    max_investment,
    description
  } = productData;

  const result = await query(
    `INSERT INTO investment_products 
     (name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description]
  );

  return result.insertId;
};

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
 * Update product (Admin only)
 */
const updateProduct = async (productId, updateData) => {
  const fields = [];
  const values = [];

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });

  if (fields.length === 0) return null;

  values.push(productId);

  await query(
    `UPDATE investment_products SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return await getProductById(productId);
};

/**
 * Delete product (Admin only) - Soft delete
 */
const deleteProduct = async (productId) => {
  await query(
    'UPDATE investment_products SET is_active = FALSE WHERE id = ?',
    [productId]
  );

  return true;
};

/**
 * Get products recommended for user based on risk appetite
 */
const getRecommendedProducts = async (riskAppetite) => {
  return await query(
    'SELECT * FROM investment_products WHERE risk_level = ? AND is_active = TRUE ORDER BY annual_yield DESC LIMIT 5',
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
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getRecommendedProducts,
  getTopProducts
};
