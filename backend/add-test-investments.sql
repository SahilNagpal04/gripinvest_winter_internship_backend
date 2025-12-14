-- Add test investments for admin user
USE gripinvest_db;

-- Get admin user ID
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@gripinvest.in' LIMIT 1);

-- Get product IDs
SET @bond_id = (SELECT id FROM investment_products WHERE investment_type = 'bond' LIMIT 1);
SET @fd_id = (SELECT id FROM investment_products WHERE investment_type = 'fd' LIMIT 1);
SET @mf_id = (SELECT id FROM investment_products WHERE investment_type = 'mf' LIMIT 1);
SET @etf_id = (SELECT id FROM investment_products WHERE investment_type = 'etf' LIMIT 1);

-- Insert active investments
INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date)
VALUES (UUID(), @admin_id, @bond_id, 50000, DATE_SUB(NOW(), INTERVAL 180 DAY), 'active', 54000, DATE_ADD(NOW(), INTERVAL 180 DAY));

INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date)
VALUES (UUID(), @admin_id, @fd_id, 30000, DATE_SUB(NOW(), INTERVAL 120 DAY), 'active', 32025, DATE_ADD(NOW(), INTERVAL 240 DAY));

INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date)
VALUES (UUID(), @admin_id, @mf_id, 25000, DATE_SUB(NOW(), INTERVAL 240 DAY), 'active', 28000, DATE_ADD(NOW(), INTERVAL 840 DAY));

INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date)
VALUES (UUID(), @admin_id, @etf_id, 40000, DATE_SUB(NOW(), INTERVAL 90 DAY), 'active', 44200, DATE_ADD(NOW(), INTERVAL 630 DAY));

INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date)
VALUES (UUID(), @admin_id, @bond_id, 35000, DATE_SUB(NOW(), INTERVAL 60 DAY), 'active', 37625, DATE_ADD(NOW(), INTERVAL 300 DAY));

-- Insert matured investments (past maturity date)
INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date)
VALUES (UUID(), @admin_id, @fd_id, 20000, DATE_SUB(NOW(), INTERVAL 420 DAY), 'matured', 21350, DATE_SUB(NOW(), INTERVAL 60 DAY));

INSERT INTO investments (id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date)
VALUES (UUID(), @admin_id, @bond_id, 15000, DATE_SUB(NOW(), INTERVAL 600 DAY), 'matured', 16125, DATE_SUB(NOW(), INTERVAL 240 DAY));

SELECT 'Test investments added successfully!' AS status;
