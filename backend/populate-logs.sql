-- Populate transaction_logs with sample data
USE gripinvest_db;

-- Get admin user ID
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@gripinvest.in' LIMIT 1);

-- Insert sample logs
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) VALUES
(@admin_id, 'admin@gripinvest.in', '/api/auth/login', 'POST', 200, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(@admin_id, 'admin@gripinvest.in', '/api/products', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(@admin_id, 'admin@gripinvest.in', '/api/investments/portfolio', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@admin_id, 'admin@gripinvest.in', '/api/products/1', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@admin_id, 'admin@gripinvest.in', '/api/investments', 'POST', 201, NULL, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/logs/me', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/auth/profile', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/products', 'POST', 201, NULL, DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/investments/portfolio/summary', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/products/999', 'GET', 404, 'Product not found', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/investments', 'POST', 400, 'Insufficient balance', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/products', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/investments/portfolio', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/logs/me', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/auth/profile', 'PUT', 200, NULL, DATE_SUB(NOW(), INTERVAL 3 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/products/recommended/me', 'GET', 200, NULL, DATE_SUB(NOW(), INTERVAL 2 MINUTE)),
(@admin_id, 'admin@gripinvest.in', '/api/investments', 'POST', 201, NULL, DATE_SUB(NOW(), INTERVAL 1 MINUTE));
