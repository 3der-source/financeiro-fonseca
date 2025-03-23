-- Create scheduled_payments table
CREATE TABLE IF NOT EXISTS scheduled_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category_id TEXT REFERENCES categories(id),
  due_date DATE NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own scheduled payments" ON scheduled_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled payments" ON scheduled_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled payments" ON scheduled_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled payments" ON scheduled_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX scheduled_payments_user_id_idx ON scheduled_payments(user_id);
CREATE INDEX scheduled_payments_due_date_idx ON scheduled_payments(due_date);
CREATE INDEX scheduled_payments_status_idx ON scheduled_payments(status); 