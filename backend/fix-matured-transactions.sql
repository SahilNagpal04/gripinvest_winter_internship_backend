-- Add missing investment_created transactions for matured investments
INSERT INTO financial_transactions (id, user_id, transaction_type, amount, investment_id, product_id, status, description, created_at)
SELECT 
  UUID(),
  i.user_id,
  'investment_created',
  i.amount,
  i.id,
  i.product_id,
  'success',
  CONCAT('Investment in ', p.name),
  DATE_SUB(i.invested_at, INTERVAL 1 SECOND)
FROM investments i
JOIN investment_products p ON i.product_id = p.id
WHERE i.status = 'matured'
AND NOT EXISTS (
  SELECT 1 FROM financial_transactions ft 
  WHERE ft.investment_id = i.id 
  AND ft.transaction_type = 'investment_created'
);
