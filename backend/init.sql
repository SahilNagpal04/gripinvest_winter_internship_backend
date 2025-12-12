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
(UUID(), 'Government Bond 2025', 'bond', 12, 7.50, 'low', 5000.00, 500000.00, 'Secure government-backed bonds with steady returns'),
(UUID(), 'Fixed Deposit - 1 Year', 'fd', 12, 6.75, 'low', 1000.00, 1000000.00, 'Bank fixed deposit with guaranteed returns'),
(UUID(), 'Equity Mutual Fund', 'mf', 36, 12.00, 'high', 500.00, 100000.00, 'High-growth equity mutual fund for long-term wealth'),
(UUID(), 'Index ETF', 'etf', 24, 10.50, 'moderate', 1000.00, 500000.00, 'Diversified index-tracking ETF'),
(UUID(), 'Corporate Bond', 'bond', 18, 8.25, 'moderate', 10000.00, 1000000.00, 'High-rated corporate bonds with moderate risk')
ON DUPLICATE KEY UPDATE name=name;
