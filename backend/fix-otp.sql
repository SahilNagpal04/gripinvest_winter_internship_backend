-- Fix OTP issue by adding missing 2FA columns
USE gripinvest_db;

-- Check if columns exist and add them if they don't
SET @dbname = 'gripinvest_db';
SET @tablename = 'users';

-- Add two_factor_enabled column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'two_factor_enabled');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE', 
    'SELECT "two_factor_enabled already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add two_factor_code column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'two_factor_code');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN two_factor_code VARCHAR(6) DEFAULT NULL', 
    'SELECT "two_factor_code already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add two_factor_expires column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'two_factor_expires');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN two_factor_expires DATETIME DEFAULT NULL', 
    'SELECT "two_factor_expires already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add email_verified column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'email_verified');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE', 
    'SELECT "email_verified already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing users to have email_verified = TRUE
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE OR email_verified IS NULL;

SELECT 'OTP fix applied successfully!' AS status;
