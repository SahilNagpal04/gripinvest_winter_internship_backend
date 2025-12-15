CREATE TABLE IF NOT EXISTS user_deletions (
  email VARCHAR(255) PRIMARY KEY,
  last_deletion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_last_deletion (last_deletion)
);
