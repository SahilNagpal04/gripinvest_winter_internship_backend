-- Update balance_before and balance_after for existing transactions
SET @balance = (SELECT balance FROM users WHERE id = 'e2fc93e3-d75b-11f0-af2c-f21ad984b22d');

UPDATE financial_transactions ft
JOIN (
  SELECT id, user_id, transaction_type, amount, created_at,
    @balance := CASE 
      WHEN transaction_type IN ('investment_created', 'withdrawal', 'fee_charged') THEN @balance + amount
      ELSE @balance - amount
    END as balance_before,
    @balance as balance_after
  FROM financial_transactions
  WHERE user_id = 'e2fc93e3-d75b-11f0-af2c-f21ad984b22d'
  ORDER BY created_at ASC
) calc ON ft.id = calc.id
SET ft.balance_before = calc.balance_before,
    ft.balance_after = calc.balance_after;
