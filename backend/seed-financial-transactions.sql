-- Populate financial_transactions from existing investments
INSERT INTO financial_transactions (id, user_id, transaction_type, amount, investment_id, product_id, status, description, created_at)
SELECT 
  UUID(),
  i.user_id,
  CASE 
    WHEN i.status = 'active' THEN 'investment_created'
    WHEN i.status = 'matured' THEN 'investment_matured'
    WHEN i.status = 'cancelled' THEN 'investment_cancelled'
  END,
  CASE 
    WHEN i.status = 'matured' THEN i.expected_return
    ELSE i.amount
  END,
  i.id,
  i.product_id,
  'success',
  CASE 
    WHEN i.status = 'active' THEN CONCAT('Investment in ', p.name)
    WHEN i.status = 'matured' THEN CONCAT('Investment matured - ', p.name)
    WHEN i.status = 'cancelled' THEN CONCAT('Investment cancelled - ', p.name)
  END,
  i.invested_at
FROM investments i
JOIN investment_products p ON i.product_id = p.id;
