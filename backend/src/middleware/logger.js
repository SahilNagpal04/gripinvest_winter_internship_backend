const { query } = require('../config/database');

console.log('[LOGGER_MIDDLEWARE] Transaction logger initialized');

/**
 * Middleware to log all API requests to database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const logTransaction = async (req, res, next) => {
  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody;

  // Override res.json to capture response
  res.json = function (data) {
    responseBody = data;
    return originalJson.call(this, data);
  };

  // Override res.send to capture response
  res.send = function (data) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  // Wait for response to complete
  res.on('finish', async () => {
    const method = req.method;
    const endpoint = (req.originalUrl || req.url).substring(0, 255);
    const status = res.statusCode;
    
    console.log(`[LOGGER_MIDDLEWARE] Logging transaction: ${method} ${endpoint} - Status: ${status}`);
    
    try {
      const userId = req.user ? req.user.id : null;
      const email = req.user ? req.user.email : null;

      // Extract error message if exists
      let errorMessage = null;
      if (status >= 400 && responseBody) {
        try {
          const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          errorMessage = parsed.message || 'Unknown error';
        } catch (parseError) {
          errorMessage = 'Error parsing response';
        }
      }

      // Log to database
      console.log('[LOGGER_MIDDLEWARE] Inserting log into database...');
      await query(
        `INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, email, endpoint, method, status, errorMessage]
      );
      
      console.log(`[LOGGER_MIDDLEWARE] Transaction logged successfully for ${email || 'anonymous'}`);
    } catch (error) {
      console.error(`[LOGGER_MIDDLEWARE] Failed to log transaction for ${method} ${endpoint}:`, error.message);
    }
  });

  next();
};

module.exports = {
  logTransaction
};
