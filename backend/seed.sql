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

-- Insert Investment Products (Real Grip Invest products)
INSERT INTO investment_products (id, name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description) VALUES
-- Corporate Bonds
(UUID(), 'Tata Capital Corporate Bond', 'bond', 24, 10.5, 'low', 10000.00, 5000000.00, 'AAA-rated corporate bond from Tata Capital with fixed returns and quarterly interest payouts'),
(UUID(), 'Bajaj Finance Corporate Bond', 'bond', 36, 11.2, 'moderate', 25000.00, 10000000.00, 'High-yield corporate bond from Bajaj Finance with monthly interest payments'),
(UUID(), 'Mahindra Finance Bond', 'bond', 18, 10.0, 'low', 10000.00, 2000000.00, 'Secured corporate bond backed by vehicle loans with stable returns'),
-- Fixed Deposits
(UUID(), 'HDFC Bank Fixed Deposit', 'fd', 24, 8.5, 'low', 10000.00, 10000000.00, 'Secure bank FD with guaranteed returns and DICGC insurance up to ₹5 lakhs'),
(UUID(), 'ICICI Bank Tax Saver FD', 'fd', 60, 9.0, 'low', 10000.00, 1500000.00, 'Tax-saving FD under Section 80C with 5-year lock-in and higher interest rates'),
(UUID(), 'Bajaj Finance FD', 'fd', 36, 8.8, 'low', 15000.00, 5000000.00, 'High-rated NBFC fixed deposit with flexible tenure and attractive returns'),
-- Securitized Debt Instruments (SDIs)
(UUID(), 'LeaseX - Equipment Leasing', 'bond', 24, 12.5, 'moderate', 10000.00, 5000000.00, 'Asset-backed SDI secured by equipment leases with monthly returns'),
(UUID(), 'LoanX - MSME Loans', 'bond', 18, 13.0, 'moderate', 25000.00, 2000000.00, 'Loan-backed securities from verified MSMEs with diversified risk'),
(UUID(), 'InvoiceX - Invoice Discounting', 'bond', 6, 14.0, 'moderate', 10000.00, 1000000.00, 'Short-term invoice discounting with corporate invoices as collateral'),
-- Mutual Funds
(UUID(), 'HDFC Balanced Advantage Fund', 'mf', 36, 11.5, 'moderate', 5000.00, 10000000.00, 'Hybrid mutual fund with dynamic asset allocation between equity and debt'),
(UUID(), 'SBI Bluechip Fund', 'mf', 60, 12.8, 'high', 5000.00, 5000000.00, 'Large-cap equity fund investing in top 100 companies by market cap'),
(UUID(), 'ICICI Prudential Liquid Fund', 'mf', 12, 7.5, 'low', 1000.00, 10000000.00, 'Low-risk liquid fund for short-term parking with high liquidity'),
-- ETFs
(UUID(), 'Nifty 50 ETF', 'etf', 12, 11.0, 'moderate', 500.00, 10000000.00, 'Index ETF tracking Nifty 50 with low expense ratio and high liquidity'),
(UUID(), 'Gold BeES ETF', 'etf', 24, 8.0, 'low', 1000.00, 5000000.00, 'Gold ETF tracking domestic gold prices as hedge against inflation'),
(UUID(), 'Bank Nifty ETF', 'etf', 18, 12.0, 'high', 1000.00, 5000000.00, 'Sectoral ETF tracking banking sector with higher volatility and returns');

-- Get user IDs for creating investments
SET @user1 = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com');
SET @user2 = (SELECT id FROM users WHERE email = 'priya.patel@example.com');
SET @user3 = (SELECT id FROM users WHERE email = 'amit.kumar@example.com');
SET @user4 = (SELECT id FROM users WHERE email = 'sneha.reddy@example.com');
SET @user5 = (SELECT id FROM users WHERE email = 'vikram.singh@example.com');

-- Get product IDs
SET @prod1 = (SELECT id FROM investment_products WHERE name = 'Tata Capital Corporate Bond');
SET @prod2 = (SELECT id FROM investment_products WHERE name = 'HDFC Bank Fixed Deposit');
SET @prod3 = (SELECT id FROM investment_products WHERE name = 'SBI Bluechip Fund');
SET @prod4 = (SELECT id FROM investment_products WHERE name = 'Nifty 50 ETF');
SET @prod5 = (SELECT id FROM investment_products WHERE name = 'LeaseX - Equipment Leasing');
SET @prod6 = (SELECT id FROM investment_products WHERE name = 'Gold BeES ETF');
SET @prod7 = (SELECT id FROM investment_products WHERE name = 'InvoiceX - Invoice Discounting');

-- Insert Investments (mix of active, matured, and cancelled)
INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date) VALUES
(UUID(), @user1, @prod3, 50000.00, '2024-10-15 10:30:00', 'active', 56250.00, '2027-10-15'),
(UUID(), @user1, @prod4, 25000.00, '2024-11-01 14:20:00', 'active', 27800.00, '2025-11-01'),
(UUID(), @user1, @prod2, 30000.00, '2023-12-01 09:00:00', 'matured', 32550.00, '2024-12-01'),
(UUID(), @user1, @prod1, 20000.00, '2023-11-15 10:00:00', 'matured', 21500.00, '2024-11-15'),
(UUID(), @user2, @prod1, 100000.00, '2024-09-20 09:15:00', 'active', 107250.00, '2025-09-20'),
(UUID(), @user2, @prod2, 50000.00, '2024-10-10 11:45:00', 'active', 54875.00, '2026-04-10'),
(UUID(), @user2, @prod5, 40000.00, '2023-10-01 11:00:00', 'matured', 44300.00, '2024-10-01'),
(UUID(), @user3, @prod2, 200000.00, '2024-08-05 16:00:00', 'active', 219500.00, '2026-02-05'),
(UUID(), @user3, @prod5, 100000.00, '2024-09-15 10:00:00', 'active', 117500.00, '2026-09-15'),
(UUID(), @user3, @prod3, 60000.00, '2023-09-01 14:00:00', 'matured', 67200.00, '2024-09-01'),
(UUID(), @user4, @prod4, 75000.00, '2024-11-20 13:30:00', 'active', 83400.00, '2025-11-20'),
(UUID(), @user4, @prod6, 50000.00, '2024-10-25 15:45:00', 'active', 58500.00, '2026-10-25'),
(UUID(), @user5, @prod7, 30000.00, '2024-09-01 12:00:00', 'active', 52500.00, '2029-09-01'),
(UUID(), @user5, @prod3, 40000.00, '2024-10-30 09:30:00', 'active', 45000.00, '2027-10-30'),
(UUID(), @user5, @prod4, 15000.00, '2023-08-15 10:30:00', 'matured', 16575.00, '2024-08-15');

-- Insert Transaction Logs (Sample API calls with more variety)
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) VALUES
(@user1, 'rahul.sharma@example.com', '/api/auth/login', 'POST', 200, NULL, '2024-12-01 09:00:00'),
(@user1, 'rahul.sharma@example.com', '/api/products', 'GET', 200, NULL, '2024-12-01 09:05:00'),
(@user1, 'rahul.sharma@example.com', '/api/investments', 'POST', 201, NULL, '2024-12-01 09:10:00'),
(@user1, 'rahul.sharma@example.com', '/api/investments/portfolio', 'GET', 200, NULL, '2024-12-01 09:15:00'),
(@user1, 'rahul.sharma@example.com', '/api/investments/portfolio/summary', 'GET', 200, NULL, '2024-12-01 09:20:00'),
(@user1, 'rahul.sharma@example.com', '/api/products/recommended/me', 'GET', 200, NULL, '2024-12-01 09:25:00'),
(@user1, 'rahul.sharma@example.com', '/api/logs/me', 'GET', 200, NULL, '2024-12-01 09:30:00'),
(@user2, 'priya.patel@example.com', '/api/auth/login', 'POST', 200, NULL, '2024-12-02 10:30:00'),
(@user2, 'priya.patel@example.com', '/api/investments/portfolio', 'GET', 200, NULL, '2024-12-02 10:35:00'),
(@user2, 'priya.patel@example.com', '/api/products', 'GET', 200, NULL, '2024-12-02 10:40:00'),
(@user2, 'priya.patel@example.com', '/api/investments', 'POST', 201, NULL, '2024-12-02 10:45:00'),
(@user3, 'amit.kumar@example.com', '/api/auth/login', 'POST', 401, 'Invalid email or password', '2024-12-03 14:20:00'),
(@user3, 'amit.kumar@example.com', '/api/auth/login', 'POST', 200, NULL, '2024-12-03 14:22:00'),
(@user3, 'amit.kumar@example.com', '/api/auth/profile', 'GET', 200, NULL, '2024-12-03 14:25:00'),
(@user3, 'amit.kumar@example.com', '/api/investments/portfolio/summary', 'GET', 200, NULL, '2024-12-03 14:30:00'),
(@user4, 'sneha.reddy@example.com', '/api/products/recommended/me', 'GET', 200, NULL, '2024-12-04 11:15:00'),
(@user4, 'sneha.reddy@example.com', '/api/investments', 'POST', 201, NULL, '2024-12-04 11:20:00'),
(@user4, 'sneha.reddy@example.com', '/api/logs/me', 'GET', 200, NULL, '2024-12-04 11:25:00'),
(@user5, 'vikram.singh@example.com', '/api/investments', 'POST', 400, 'Insufficient balance', '2024-12-05 16:40:00'),
(@user5, 'vikram.singh@example.com', '/api/auth/profile', 'GET', 200, NULL, '2024-12-05 16:45:00'),
(@user5, 'vikram.singh@example.com', '/api/products', 'GET', 200, NULL, '2024-12-05 16:50:00'),
(@user5, 'vikram.singh@example.com', '/api/investments/portfolio', 'GET', 200, NULL, '2024-12-05 16:55:00');

-- Display summary
SELECT 'Seed data inserted successfully!' AS Status;
SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalProducts FROM investment_products;
SELECT COUNT(*) AS TotalInvestments FROM investments;
SELECT COUNT(*) AS TotalLogs FROM transaction_logs;