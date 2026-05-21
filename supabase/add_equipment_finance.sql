-- ============================================================
-- PowerFit: Add trainer selection to bookings + Equipment + Finance
-- Run in Supabase SQL Editor AFTER schema.sql and fix_rls.sql
-- ============================================================

-- 1. Add trainer_id to class_bookings
ALTER TABLE public.class_bookings
  ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS public.equipment (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  type           TEXT DEFAULT 'Cardio',
  condition      TEXT DEFAULT 'Good' CHECK (condition IN ('Excellent','Good','Fair','Poor','Out of Service')),
  quantity       INTEGER DEFAULT 1,
  location       TEXT DEFAULT 'Main Hall',
  purchase_date  DATE,
  purchase_price DECIMAL(10,2),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_equipment" ON public.equipment
  FOR ALL USING (public.is_admin());

CREATE POLICY "equipment_public_read" ON public.equipment
  FOR SELECT USING (true);

-- 3. FINANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.finance_records (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('income','expense')),
  category    TEXT DEFAULT 'Other',
  amount      DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date        DATE DEFAULT CURRENT_DATE,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_finance" ON public.finance_records
  FOR ALL USING (public.is_admin());

-- 4. Sample equipment
INSERT INTO public.equipment (name, type, condition, quantity, location, purchase_price) VALUES
  ('Treadmill Pro X200',    'Cardio',       'Excellent', 8, 'Cardio Zone',     85000),
  ('Dumbbells Set (5-50kg)','Free Weights', 'Good',      4, 'Weight Area',     45000),
  ('Barbell + Plates Set',  'Free Weights', 'Good',      6, 'Weight Area',     32000),
  ('Cable Machine',         'Machines',     'Excellent', 3, 'Machine Zone',   120000),
  ('Rowing Machine',        'Cardio',       'Good',      4, 'Cardio Zone',     65000),
  ('Bench Press Rack',      'Machines',     'Good',      5, 'Weight Area',     38000),
  ('Elliptical Trainer',    'Cardio',       'Fair',      3, 'Cardio Zone',     55000),
  ('Pull-up Station',       'Bodyweight',   'Excellent', 2, 'Functional Zone', 18000)
ON CONFLICT DO NOTHING;

-- 5. Sample finance records
INSERT INTO public.finance_records (type, category, amount, description, date) VALUES
  ('income',  'Membership', 25000, 'Monthly membership fees batch 1', CURRENT_DATE - 20),
  ('income',  'Membership', 18500, 'Monthly membership fees batch 2', CURRENT_DATE - 12),
  ('expense', 'Utilities',   8500, 'Electricity bill',                CURRENT_DATE - 15),
  ('expense', 'Maintenance', 4200, 'Treadmill belt replacement',      CURRENT_DATE - 10),
  ('income',  'Classes',     6000, 'Personal training sessions',      CURRENT_DATE - 5),
  ('expense', 'Supplies',    2800, 'Cleaning supplies & towels',      CURRENT_DATE - 3)
ON CONFLICT DO NOTHING;
