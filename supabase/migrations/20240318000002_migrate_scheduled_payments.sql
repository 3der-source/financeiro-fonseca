-- Primeiro, garantir que a tabela transactions tenha todas as colunas necessárias
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'paid',
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS frequency TEXT,
ADD COLUMN IF NOT EXISTS reminder_days INTEGER;

-- Migrar dados existentes da tabela scheduled_payments para transactions
INSERT INTO transactions (
  user_id,
  name,
  amount,
  category_id,
  date,
  payment_method,
  notes,
  is_scheduled,
  status,
  is_recurring,
  frequency,
  reminder_days,
  created_at,
  updated_at
)
SELECT
  user_id,
  name,
  amount,
  category_id,
  payment_date,
  payment_method,
  notes,
  TRUE, -- is_scheduled
  status,
  is_recurring,
  frequency,
  reminder_days,
  created_at,
  updated_at
FROM scheduled_payments
ON CONFLICT (id) DO NOTHING; -- Evitar duplicatas caso alguma transação já tenha sido migrada

-- Fazer backup da tabela scheduled_payments antes de excluí-la (por segurança)
CREATE TABLE IF NOT EXISTS scheduled_payments_backup AS
SELECT * FROM scheduled_payments;

-- Remover a tabela scheduled_payments
DROP TABLE IF EXISTS scheduled_payments; 