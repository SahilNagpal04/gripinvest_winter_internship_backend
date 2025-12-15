-- Create database if not exists
CREATE DATABASE IF NOT EXISTS gripinvest_db;
USE gripinvest_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    risk_appetite ENUM('low','moderate','high') DEFAULT 'moderate',
    balance DECIMAL(12,2) DEFAULT 100000.00,
    is_admin BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6) DEFAULT NULL,
    otp_expiry DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Investment Products Table
CREATE TABLE IF NOT EXISTS investment_products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    investment_type ENUM('bond','fd','mf','etf','other') NOT NULL,
    tenure_months INT NOT NULL,
    annual_yield DECIMAL(5,2) NOT NULL,
    risk_level ENUM('low','moderate','high') NOT NULL,
    min_investment DECIMAL(12,2) DEFAULT 1000.00,
    max_investment DECIMAL(12,2),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_risk_level (risk_level),
    INDEX idx_investment_type (investment_type)
);

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    invested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active','matured','cancelled') DEFAULT 'active',
    expected_return DECIMAL(12,2),
    maturity_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES investment_products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status)
);

-- Financial Transactions Table
CREATE TABLE IF NOT EXISTS financial_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    investment_id CHAR(36),
    transaction_type ENUM('investment','withdrawal','return','cancellation') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending','completed','failed') DEFAULT 'completed',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_investment_id (investment_id),
    INDEX idx_created_at (created_at)
);

-- Transaction Logs Table
CREATE TABLE IF NOT EXISTS transaction_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36),
    email VARCHAR(255),
    endpoint VARCHAR(255) NOT NULL,
    http_method ENUM('GET','POST','PUT','DELETE') NOT NULL,
    status_code INT NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_status_code (status_code),
    INDEX idx_created_at (created_at)
);

-- Insert Admin User (password: Admin@123)
INSERT INTO users (id, first_name, last_name, email, password_hash, is_admin, balance) 
VALUES (
    UUID(),
    'Admin',
    'User',
    'admin@gripinvest.in',
    '$2b$10$5sk6ErRXs.o4V4rS.QNYwu2zoc3Uw5SXji/xKXpPSAn4nPiaIwjO2',
    TRUE,
    1000000.00
) ON DUPLICATE KEY UPDATE email=email;

-- Insert Sample Investment Products
INSERT INTO investment_products (id, name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description) VALUES
-- LOW RISK BONDS
(UUID(), 'Government Bond 2025', 'bond', 12, 7.50, 'low', 5000.00, 500000.00, 'Secure government-backed bonds with steady returns'),
(UUID(), 'Treasury Bond 5Y', 'bond', 60, 7.25, 'low', 10000.00, 1000000.00, 'Long-term government treasury bonds with guaranteed returns'),
(UUID(), 'Municipal Bond', 'bond', 36, 6.80, 'low', 5000.00, 500000.00, 'Tax-free municipal bonds for stable income'),
-- LOW RISK FIXED DEPOSITS
(UUID(), 'Fixed Deposit - 1 Year', 'fd', 12, 6.75, 'low', 1000.00, 1000000.00, 'Bank fixed deposit with guaranteed returns'),
(UUID(), 'Senior Citizen FD', 'fd', 24, 7.00, 'low', 5000.00, 500000.00, 'Higher interest FD for senior citizens'),
(UUID(), 'Tax Saver FD', 'fd', 60, 6.50, 'low', 1000.00, 150000.00, 'Tax-saving fixed deposit with 5-year lock-in'),
-- MODERATE RISK BONDS
(UUID(), 'Corporate Bond AAA', 'bond', 18, 8.25, 'moderate', 10000.00, 1000000.00, 'High-rated corporate bonds with moderate risk'),
(UUID(), 'Infrastructure Bond', 'bond', 36, 8.50, 'moderate', 15000.00, 500000.00, 'Bonds funding infrastructure projects'),
-- MODERATE RISK ETFs
(UUID(), 'Index ETF', 'etf', 24, 10.50, 'moderate', 1000.00, 500000.00, 'Diversified index-tracking ETF'),
(UUID(), 'Nifty 50 ETF', 'etf', 36, 11.00, 'moderate', 500.00, 300000.00, 'ETF tracking Nifty 50 index'),
(UUID(), 'Gold ETF', 'etf', 24, 9.00, 'moderate', 1000.00, 200000.00, 'Gold-backed ETF for portfolio diversification'),
(UUID(), 'Banking Sector ETF', 'etf', 18, 10.00, 'moderate', 2000.00, 250000.00, 'ETF focused on banking sector stocks'),
-- MODERATE RISK MUTUAL FUNDS
(UUID(), 'Balanced Hybrid Fund', 'mf', 36, 10.00, 'moderate', 500.00, 100000.00, 'Balanced mix of equity and debt for steady growth'),
(UUID(), 'Debt Fund', 'mf', 24, 8.50, 'moderate', 1000.00, 200000.00, 'Low-risk debt mutual fund for stable returns'),
-- HIGH RISK MUTUAL FUNDS
(UUID(), 'Equity Mutual Fund', 'mf', 36, 12.00, 'high', 500.00, 100000.00, 'High-growth equity mutual fund for long-term wealth'),
(UUID(), 'Small Cap Fund', 'mf', 60, 15.00, 'high', 1000.00, 150000.00, 'High-risk small cap fund with potential for high returns'),
(UUID(), 'Mid Cap Fund', 'mf', 48, 13.50, 'high', 1000.00, 200000.00, 'Mid cap equity fund for aggressive growth'),
(UUID(), 'Technology Sector Fund', 'mf', 36, 14.00, 'high', 2000.00, 100000.00, 'Sector-focused fund investing in tech companies'),
(UUID(), 'Emerging Markets Fund', 'mf', 60, 16.00, 'high', 5000.00, 250000.00, 'High-risk fund investing in emerging markets'),
-- HIGH RISK ETFs
(UUID(), 'Sectoral ETF - IT', 'etf', 24, 13.00, 'high', 1000.00, 150000.00, 'Technology sector ETF with high growth potential'),
(UUID(), 'International ETF', 'etf', 36, 12.50, 'high', 2000.00, 200000.00, 'ETF tracking international markets'),
-- HIGH RISK BONDS
(UUID(), 'High Yield Corporate Bond', 'bond', 24, 11.00, 'high', 25000.00, 500000.00, 'High-yield bonds from growing companies'),
-- ADDITIONAL LOW RISK OPTIONS
(UUID(), 'Post Office Savings', 'fd', 12, 6.25, 'low', 500.00, 100000.00, 'Government-backed post office savings scheme'),
(UUID(), 'Sovereign Gold Bond', 'bond', 96, 7.00, 'low', 5000.00, 400000.00, 'Government-issued gold bonds with fixed interest')
ON DUPLICATE KEY UPDATE name=name;
