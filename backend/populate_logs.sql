-- Populate transaction logs with sample data for all users
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) 
SELECT 
    u.id,
    u.email,
    '/api/products',
    'GET',
    200,
    NULL,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY)
FROM users u
LIMIT 10;

INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) 
SELECT 
    u.id,
    u.email,
    '/api/investments',
    'POST',
    201,
    NULL,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 20) DAY)
FROM users u
LIMIT 8;

INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) 
SELECT 
    u.id,
    u.email,
    '/api/investments/portfolio',
    'GET',
    200,
    NULL,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 15) DAY)
FROM users u
LIMIT 12;

INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) 
SELECT 
    u.id,
    u.email,
    '/api/auth/profile',
    'GET',
    200,
    NULL,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 10) DAY)
FROM users u
LIMIT 15;

-- Add some error logs
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) 
SELECT 
    u.id,
    u.email,
    '/api/investments',
    'POST',
    400,
    'Insufficient balance',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 25) DAY)
FROM users u
LIMIT 3;

INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) 
SELECT 
    u.id,
    u.email,
    '/api/products/999',
    'GET',
    404,
    'Product not found',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 18) DAY)
FROM users u
LIMIT 2;
