-- Create transaction_logs table for financial transactions
DROP TABLE IF EXISTS financial_transactions;

CREATE TABLE financial_transactions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  balance_before DECIMAL(12,2),
  balance_after DECIMAL(12,2),
  investment_id CHAR(36),
  product_id CHAR(36),
  reference_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'success',
  description TEXT,
  notes TEXT,
  payment_method VARCHAR(50),
  payment_gateway VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES investment_products(id),
  INDEX idx_user_transactions (user_id, created_at),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_status (status)
);
