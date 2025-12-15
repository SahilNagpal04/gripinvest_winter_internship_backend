-- Add sample investments for admin user to test health score
USE gripinvest_db;

SET @admin_id = (SELECT id FROM users WHERE email = 'admin@gripinvest.in' LIMIT 1);
SET @bond_id = (SELECT id FROM investment_products WHERE investment_type = 'bond' LIMIT 1);
SET @fd_id = (SELECT id FROM investment_products WHERE investment_type = 'fd' LIMIT 1);
SET @mf_id = (SELECT id FROM investment_products WHERE investment_type = 'mf' LIMIT 1);

INSERT INTO investments (id, user_id, product_id, amount, expected_return, maturity_date, status, invested_at) VALUES
(UUID(), @admin_id, @bond_id, 50000, 53750, DATE_ADD(NOW(), INTERVAL 12 MONTH), 'active', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(UUID(), @admin_id, @fd_id, 30000, 32025, DATE_ADD(NOW(), INTERVAL 10 MONTH), 'active', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(UUID(), @admin_id, @mf_id, 20000, 27200, DATE_ADD(NOW(), INTERVAL 34 MONTH), 'active', DATE_SUB(NOW(), INTERVAL 15 DAY));
