-- Add short-term investments maturing in 4-6 days
USE gripinvest_db;

SET @admin_id = (SELECT id FROM users WHERE email = 'admin@gripinvest.in' LIMIT 1);

-- Get product IDs for each type
SET @bond1 = (SELECT id FROM investment_products WHERE investment_type = 'bond' AND risk_level = 'low' LIMIT 1);
SET @bond2 = (SELECT id FROM investment_products WHERE investment_type = 'bond' AND risk_level = 'moderate' LIMIT 1);
SET @fd = (SELECT id FROM investment_products WHERE investment_type = 'fd' LIMIT 1);
SET @mf = (SELECT id FROM investment_products WHERE investment_type = 'mf' LIMIT 1);
SET @etf = (SELECT id FROM investment_products WHERE investment_type = 'etf' LIMIT 1);

-- Insert investments maturing in 4-6 days
INSERT INTO investments (id, user_id, product_id, amount, expected_return, maturity_date, status, invested_at) VALUES
(UUID(), @admin_id, @bond1, 15000, 15300, DATE_ADD(NOW(), INTERVAL 4 DAY), 'active', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
(UUID(), @admin_id, @bond2, 25000, 26200, DATE_ADD(NOW(), INTERVAL 5 DAY), 'active', DATE_SUB(NOW(), INTERVAL 13 MONTH)),
(UUID(), @admin_id, @fd, 10000, 10675, DATE_ADD(NOW(), INTERVAL 4 DAY), 'active', DATE_SUB(NOW(), INTERVAL 12 MONTH)),
(UUID(), @admin_id, @fd, 20000, 21350, DATE_ADD(NOW(), INTERVAL 6 DAY), 'active', DATE_SUB(NOW(), INTERVAL 12 MONTH)),
(UUID(), @admin_id, @mf, 8000, 10880, DATE_ADD(NOW(), INTERVAL 5 DAY), 'active', DATE_SUB(NOW(), INTERVAL 36 MONTH)),
(UUID(), @admin_id, @mf, 12000, 16320, DATE_ADD(NOW(), INTERVAL 6 DAY), 'active', DATE_SUB(NOW(), INTERVAL 36 MONTH)),
(UUID(), @admin_id, @etf, 18000, 21420, DATE_ADD(NOW(), INTERVAL 4 DAY), 'active', DATE_SUB(NOW(), INTERVAL 24 MONTH)),
(UUID(), @admin_id, @etf, 22000, 26180, DATE_ADD(NOW(), INTERVAL 6 DAY), 'active', DATE_SUB(NOW(), INTERVAL 24 MONTH));
