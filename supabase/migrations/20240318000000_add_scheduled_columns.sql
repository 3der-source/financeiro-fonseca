-- Adicionar colunas is_scheduled e status na tabela transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; 