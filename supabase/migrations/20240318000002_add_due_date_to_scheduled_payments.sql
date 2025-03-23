-- Add due_date column to scheduled_payments table
ALTER TABLE scheduled_payments
ADD COLUMN due_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Create index for faster queries on due_date
CREATE INDEX IF NOT EXISTS scheduled_payments_due_date_idx ON scheduled_payments(due_date); 