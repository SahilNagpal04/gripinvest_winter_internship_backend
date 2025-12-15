CREATE TABLE IF NOT EXISTS financial_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  investment_id VARCHAR(36),
  transaction_type ENUM('investment_created', 'investment_cancelled', 'investment_matured') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'success',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
