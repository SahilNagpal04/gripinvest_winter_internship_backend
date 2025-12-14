-- Add 2FA columns to users table
USE gripinvest_db;

ALTER TABLE users 
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN two_factor_code VARCHAR(6) DEFAULT NULL,
ADD COLUMN two_factor_expires DATETIME DEFAULT NULL,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Update existing users to have email_verified = TRUE
UPDATE users SET email_verified = TRUE;
