-- Use the database
USE gripinvest_db;

-- Clear existing data (except admin)
DELETE FROM transaction_logs;
DELETE FROM investments;
DELETE FROM investment_products;
DELETE FROM users WHERE email != 'admin@gripinvest.in';

-- Insert Users (5 users + 1 admin already exists)
INSERT INTO users (id, first_name, last_name, email, password_hash, risk_appetite, balance, is_admin) VALUES
(UUID(), 'Rahul', 'Sharma', 'rahul.sharma@example.com', '$2a$10$rZ0H3P5Z9qN5pX7kF2Y0ZOxGq8jXvZ5gF3mF6pZ9N5rX7kF2Y0ZOxG', 'high', 250000.00, FALSE),
(UUID(), 'Priya', 'Patel', 'priya.patel@example.com', '$2a$10$rZ0H3P5Z9qN5pX7kF2Y0ZOxGq8jXvZ5gF3mF6pZ9N5rX7kF2Y0ZOxG', 'moderate', 180000.00, FALSE),
(UUID(), 'Amit', 'Kumar', 'amit.kumar@example.com', '$2a$10$rZ0H3P5Z9qN5pX7kF2Y0ZOxGq8jXvZ5gF3mF6pZ9N5rX7kF2Y0ZOxG', 'low', 500000.00, FALSE),
(UUID(), 'Sneha', 'Reddy', 'sneha.reddy@example.com', '$2a$10$rZ0H3P5Z9qN5pX7kF2Y0ZOxGq8jXvZ5gF3mF6pZ9N5rX7kF2Y0ZOxG', 'moderate', 320000.00, FALSE),
(UUID(), 'Vikram', 'Singh', 'vikram.singh@example.com', '$2a$10$rZ0H3P5Z9qN5pX7kF2Y0ZOxGq8jXvZ5gF3mF6pZ9N5rX7kF2Y0ZOxG', 'high', 150000.00, FALSE);

-- Insert Investment Products (10 diverse products)
INSERT INTO investment_products (id, name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description) VALUES
(UUID(), 'Government Treasury Bond 2025', 'bond', 12, 7.25, 'low', 10000.00, 1000000.00, 'Safe government-backed treasury bonds with guaranteed returns and minimal risk'),
(UUID(), 'SBI Fixed Deposit - 18 Months', 'fd', 18, 6.50, 'low', 5000.00, 500000.00, 'Secure bank fixed deposit with assured returns from State Bank of India'),
(UUID(), 'HDFC Tax Saver FD', 'fd', 60, 7.00, 'low', 1000.00, 150000.00, 'Tax-saving fixed deposit under Section 80C with 5-year lock-in period'),
(UUID(), 'Axis Bluechip Mutual Fund', 'mf', 36, 12.50, 'high', 500.00, 100000.00, 'Large-cap equity mutual fund targeting high growth over 3 years'),
(UUID(), 'ICICI Balanced Advantage Fund', 'mf', 24, 9.80, 'moderate', 1000.00, 200000.00, 'Hybrid fund with balanced mix of equity and debt for moderate risk investors'),
(UUID(), 'Nifty 50 Index ETF', 'etf', 12, 11.20, 'moderate', 500.00, 500000.00, 'Exchange-traded fund tracking Nifty 50 index for diversified equity exposure'),
(UUID(), 'Gold ETF', 'etf', 24, 8.50, 'moderate', 1000.00, 300000.00, 'Gold-backed ETF providing hedge against inflation and market volatility'),
(UUID(), 'Corporate Bond - AAA Rated', 'bond', 24, 8.75, 'moderate', 25000.00, 2000000.00, 'High-rated corporate bonds from blue-chip companies with stable returns'),
(UUID(), 'Infrastructure Bond', 'bond', 36, 9.25, 'moderate', 50000.00, 1000000.00, 'Long-term infrastructure development bonds with tax benefits'),
(UUID(), 'Small Cap Growth Fund', 'mf', 60, 15.00, 'high', 1000.00, 50000.00, 'High-risk high-return small-cap fund for aggressive long-term investors');

-- Get user IDs for creating investments
SET @user1 = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com');
SET @user2 = (SELECT id FROM users WHERE email = 'priya.patel@example.com');
SET @user3 = (SELECT id FROM users WHERE email = 'amit.kumar@example.com');
SET @user4 = (SELECT id FROM users WHERE email = 'sneha.reddy@example.com');
SET @user5 = (SELECT id FROM users WHERE email = 'vikram.singh@example.com');

-- Get product IDs
SET @prod1 = (SELECT id FROM investment_products WHERE name = 'Government Treasury Bond 2025');
SET @prod2 = (SELECT id FROM investment_products WHERE name = 'SBI Fixed Deposit - 18 Months');
SET @prod3 = (SELECT id FROM investment_products WHERE name = 'Axis Bluechip Mutual Fund');
SET @prod4 = (SELECT id FROM investment_products WHERE name = 'Nifty 50 Index ETF');
SET @prod5 = (SELECT id FROM investment_products WHERE name = 'Corporate Bond - AAA Rated');
SET @prod6 = (SELECT id FROM investment_products WHERE name = 'Gold ETF');
SET @prod7 = (SELECT id FROM investment_products WHERE name = 'Small Cap Growth Fund');

-- Insert Investments (8-10 realistic investments)
INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date) VALUES
(UUID(), @user1, @prod3, 50000.00, '2024-10-15 10:30:00', 'active', 56250.00, '2027-10-15'),
(UUID(), @user1, @prod4, 25000.00, '2024-11-01 14:20:00', 'active', 27800.00, '2025-11-01'),
(UUID(), @user2, @prod1, 100000.00, '2024-09-20 09:15:00', 'active', 107250.00, '2025-09-20'),
(UUID(), @user2, @prod2, 50000.00, '2024-10-10 11:45:00', 'active', 54875.00, '2026-04-10'),
(UUID(), @user3, @prod2, 200000.00, '2024-08-05 16:00:00', 'active', 219500.00, '2026-02-05'),
(UUID(), @user3, @prod5, 100000.00, '2024-09-15 10:00:00', 'active', 117500.00, '2026-09-15'),
(UUID(), @user4, @prod4, 75000.00, '2024-11-20 13:30:00', 'active', 83400.00, '2025-11-20'),
(UUID(), @user4, @prod6, 50000.00, '2024-10-25 15:45:00', 'active', 58500.00, '2026-10-25'),
(UUID(), @user5, @prod7, 30000.00, '2024-09-01 12:00:00', 'active', 52500.00, '2029-09-01'),
(UUID(), @user5, @prod3, 40000.00, '2024-10-30 09:30:00', 'active', 45000.00, '2027-10-30');

-- Insert Transaction Logs (Sample API calls)
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) VALUES
(@user1, 'rahul.sharma@example.com', '/api/auth/login', 'POST', 200, NULL, '2024-12-01 09:00:00'),
(@user1, 'rahul.sharma@example.com', '/api/products', 'GET', 200, NULL, '2024-12-01 09:05:00'),
(@user1, 'rahul.sharma@example.com', '/api/investments', 'POST', 201, NULL, '2024-12-01 09:10:00'),
(@user2, 'priya.patel@example.com', '/api/auth/login', 'POST', 200, NULL, '2024-12-02 10:30:00'),
(@user2, 'priya.patel@example.com', '/api/investments/portfolio', 'GET', 200, NULL, '2024-12-02 10:35:00'),
(@user3, 'amit.kumar@example.com', '/api/auth/login', 'POST', 401, 'Invalid email or password', '2024-12-03 14:20:00'),
(@user3, 'amit.kumar@example.com', '/api/auth/login', 'POST', 200, NULL, '2024-12-03 14:22:00'),
(@user4, 'sneha.reddy@example.com', '/api/products/recommended/me', 'GET', 200, NULL, '2024-12-04 11:15:00'),
(@user5, 'vikram.singh@example.com', '/api/investments', 'POST', 400, 'Insufficient balance', '2024-12-05 16:40:00'),
(@user5, 'vikram.singh@example.com', '/api/auth/profile', 'GET', 200, NULL, '2024-12-05 16:45:00');

-- Display summary
SELECT 'Seed data inserted successfully!' AS Status;
SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalProducts FROM investment_products;
SELECT COUNT(*) AS TotalInvestments FROM investments;
SELECT COUNT(*) AS TotalLogs FROM transaction_logs;