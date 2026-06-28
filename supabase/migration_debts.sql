-- 1. Add account_type to Income
ALTER TABLE public.income ADD COLUMN account_type TEXT DEFAULT 'Digital';

-- 2. Add account_type to Expenses 
ALTER TABLE public.expenses ADD COLUMN account_type TEXT DEFAULT 'Digital';

-- 3. Create Debts table
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_name TEXT NOT NULL,
  amount_lent NUMERIC(12,2) NOT NULL CHECK (amount_lent > 0),
  amount_collected NUMERIC(12,2) DEFAULT 0 CHECK (amount_collected >= 0),
  account_type TEXT DEFAULT 'Digital',
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Pending', -- Pending, Settled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index and RLS for Debts
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own debts" ON public.debts FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER handle_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Create Debt Collections (Transactions) table to track partial repayments
CREATE TABLE IF NOT EXISTS public.debt_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  account_type TEXT DEFAULT 'Digital',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index and RLS for Debt Collections
CREATE INDEX IF NOT EXISTS idx_debt_coll_user_id ON public.debt_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_coll_debt_id ON public.debt_collections(debt_id);

ALTER TABLE public.debt_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own debt collections" ON public.debt_collections FOR ALL USING (auth.uid() = user_id);

-- 5. Trigger to automatically update amount_collected in debts table
CREATE OR REPLACE FUNCTION public.update_debt_collection_total()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.debts SET amount_collected = amount_collected + NEW.amount WHERE id = NEW.debt_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.debts SET amount_collected = amount_collected - OLD.amount WHERE id = OLD.debt_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.debts SET amount_collected = amount_collected - OLD.amount + NEW.amount WHERE id = NEW.debt_id;
  END IF;
  
  -- Auto-update status
  UPDATE public.debts 
  SET status = CASE WHEN amount_collected >= amount_lent THEN 'Settled' ELSE 'Pending' END
  WHERE id = COALESCE(NEW.debt_id, OLD.debt_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_debt_collection_change
  AFTER INSERT OR UPDATE OR DELETE ON public.debt_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_debt_collection_total();
