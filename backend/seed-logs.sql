-- Insert sample transaction logs with both success and error logs
-- Using the first user from the database

-- Get the first user ID and use it for all logs
SET @user_id = (SELECT id FROM users LIMIT 1);
SET @user_email = (SELECT email FROM users LIMIT 1);

-- Success logs (no error messages for successful requests)
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) VALUES
(@user_id, @user_email, '/api/auth/login', 'POST', 200, '', NOW() - INTERVAL 1 HOUR),
(@user_id, @user_email, '/api/products', 'GET', 200, '', NOW() - INTERVAL 2 HOUR),
(@user_id, @user_email, '/api/investments/portfolio', 'GET', 200, '', NOW() - INTERVAL 3 HOUR),
(@user_id, @user_email, '/api/investments', 'POST', 201, '', NOW() - INTERVAL 4 HOUR),
(@user_id, @user_email, '/api/products/1', 'GET', 200, '', NOW() - INTERVAL 5 HOUR),
(@user_id, @user_email, '/api/auth/profile', 'GET', 200, '', NOW() - INTERVAL 6 HOUR),
(@user_id, @user_email, '/api/products/recommended/me', 'GET', 200, '', NOW() - INTERVAL 7 HOUR),
(@user_id, @user_email, '/api/investments/portfolio/summary', 'GET', 200, '', NOW() - INTERVAL 8 HOUR),
(@user_id, @user_email, '/api/logs/me', 'GET', 200, '', NOW() - INTERVAL 9 HOUR),
(@user_id, @user_email, '/api/products', 'POST', 201, '', NOW() - INTERVAL 10 HOUR),

-- Error logs - 400 series (Client errors)
(@user_id, @user_email, '/api/investments', 'POST', 400, 'Insufficient balance. Your current balance is ₹50000', NOW() - INTERVAL 30 MINUTE),
(@user_id, @user_email, '/api/investments', 'POST', 400, 'Insufficient balance. Your current balance is ₹50000', NOW() - INTERVAL 1 HOUR),
(@user_id, @user_email, '/api/investments', 'POST', 400, 'Insufficient balance. Your current balance is ₹50000', NOW() - INTERVAL 2 HOUR),
(@user_id, @user_email, '/api/investments', 'POST', 400, 'Minimum investment for this product is ₹10000', NOW() - INTERVAL 3 HOUR),
(@user_id, @user_email, '/api/investments', 'POST', 400, 'Invalid investment amount', NOW() - INTERVAL 4 HOUR),
(@user_id, @user_email, '/api/products/999', 'GET', 404, 'Product not found', NOW() - INTERVAL 5 HOUR),
(@user_id, @user_email, '/api/products/888', 'GET', 404, 'Product not found', NOW() - INTERVAL 6 HOUR),
(@user_id, @user_email, '/api/investments/777', 'GET', 404, 'Investment not found', NOW() - INTERVAL 7 HOUR),
(@user_id, @user_email, '/api/auth/login', 'POST', 401, 'Invalid email or password', NOW() - INTERVAL 8 HOUR),
(@user_id, @user_email, '/api/auth/login', 'POST', 401, 'Invalid email or password', NOW() - INTERVAL 9 HOUR),
(@user_id, @user_email, '/api/investments/5', 'DELETE', 403, 'Access denied', NOW() - INTERVAL 10 HOUR),
(@user_id, @user_email, '/api/investments/10', 'PUT', 400, 'Cannot cancel matured investment', NOW() - INTERVAL 11 HOUR),

-- Error logs - 500 series (Server errors)
(@user_id, @user_email, '/api/investments', 'POST', 500, 'Failed to create investment. Your balance has not been deducted.', NOW() - INTERVAL 12 HOUR),
(@user_id, @user_email, '/api/products', 'POST', 500, 'Database connection timeout', NOW() - INTERVAL 13 HOUR),
(@user_id, @user_email, '/api/investments/portfolio', 'GET', 500, 'Internal server error', NOW() - INTERVAL 14 HOUR);
