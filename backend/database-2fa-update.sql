-- Add 2FA columns to users table
ALTER TABLE users 
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN two_factor_code VARCHAR(6),
ADD COLUMN two_factor_expires DATETIME,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Update existing users to have email verified
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;
