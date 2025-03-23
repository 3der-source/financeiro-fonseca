-- Habilitar a extensão UUID para gerar IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis (estende a tabela auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  is_scheduled BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'paid',
  is_recurring BOOLEAN DEFAULT FALSE,
  frequency TEXT,
  reminder_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas de segurança RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver apenas seus próprios perfis" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios perfis" 
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para categories
CREATE POLICY "Usuários podem ver apenas suas próprias categorias" 
ON categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias categorias" 
ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias categorias" 
ON categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias categorias" 
ON categories FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Usuários podem ver apenas suas próprias transações" 
ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações" 
ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias transações" 
ON transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias transações" 
ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notifications
CREATE POLICY "Usuários podem ver apenas suas próprias notificações" 
ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias notificações" 
ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias notificações" 
ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias notificações" 
ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente após registro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Criar bucket para armazenar avatares
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir acesso público aos avatares
CREATE POLICY "Acesso público aos avatares" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profiles');

-- Política para permitir upload de avatares apenas pelo próprio usuário
CREATE POLICY "Usuários podem fazer upload de seus próprios avatares" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profiles' AND auth.uid() = owner);

-- Política para permitir atualização de avatares apenas pelo próprio usuário
CREATE POLICY "Usuários podem atualizar seus próprios avatares" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profiles' AND auth.uid() = owner);

-- Política para permitir exclusão de avatares apenas pelo próprio usuário
CREATE POLICY "Usuários podem excluir seus próprios avatares" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'profiles' AND auth.uid() = owner);

-- Remover tabela de pagamentos agendados que não será mais necessária
DROP TABLE IF EXISTS scheduled_payments;

