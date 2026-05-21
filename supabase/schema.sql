-- ============================================================
-- POWERFIT GYM MANAGEMENT - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- STEP 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT UNIQUE,
  phone       TEXT,
  role        TEXT DEFAULT 'member' CHECK (role IN ('admin','member','trainer')),
  avatar_url  TEXT,
  address     TEXT,
  date_of_birth DATE,
  gender      TEXT CHECK (gender IN ('male','female','other')),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "public_read_trainers" ON public.profiles
  FOR SELECT USING (role = 'trainer');

-- ============================================================
-- TABLE: plans (membership plans)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  description   TEXT,
  features      JSONB DEFAULT '[]',
  color         TEXT DEFAULT '#FF6B00',
  is_popular    BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_public_read" ON public.plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_plans" ON public.plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert default 3 plans
INSERT INTO public.plans (name, price, duration_days, description, features, color, is_popular) VALUES
(
  'Basic', 2500, 30,
  'Perfect for beginners starting their fitness journey',
  '["Access to gym floor","Locker room access","2 group classes/month","Basic equipment","Mobile app access"]',
  '#6B7280', false
),
(
  'Premium', 4500, 30,
  'Most popular plan for serious fitness enthusiasts',
  '["All Basic features","Unlimited group classes","1 PT session/month","Diet consultation","Progress tracking AI","Priority booking"]',
  '#FF6B00', true
),
(
  'Elite', 8000, 30,
  'Ultimate package with full AI-powered coaching',
  '["All Premium features","Unlimited PT sessions","AI workout planner","Nutrition AI coach","Body composition analysis","VIP lounge access","24/7 gym access"]',
  '#1a1a2e', false
);

-- ============================================================
-- TABLE: memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id        UUID NOT NULL REFERENCES public.plans(id),
  start_date     DATE DEFAULT CURRENT_DATE,
  end_date       DATE,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('active','expired','pending','cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid','unpaid','partial')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_view_own_membership" ON public.memberships
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "admin_all_memberships" ON public.memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "members_insert_membership" ON public.memberships
  FOR INSERT WITH CHECK (auth.uid() = member_id);

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id    UUID REFERENCES public.memberships(id),
  member_id        UUID NOT NULL REFERENCES public.profiles(id),
  amount           DECIMAL(10,2) NOT NULL,
  payment_method   TEXT DEFAULT 'easypaisa',
  transaction_id   TEXT,
  easypaisa_number TEXT,
  screenshot_url   TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('completed','pending','failed','verified')),
  notes            TEXT,
  payment_date     TIMESTAMPTZ DEFAULT NOW(),
  verified_by      UUID REFERENCES public.profiles(id),
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_view_own_payments" ON public.payments
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "members_insert_payment" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "admin_all_payments" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- TABLE: trainer_profiles (extended trainer info)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trainer_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id       UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization   TEXT,
  bio              TEXT,
  experience_years INTEGER DEFAULT 1,
  certifications   TEXT[] DEFAULT '{}',
  image_url        TEXT,
  rating           DECIMAL(3,2) DEFAULT 4.5,
  total_clients    INTEGER DEFAULT 0,
  instagram        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_profiles_public_read" ON public.trainer_profiles
  FOR SELECT USING (true);

CREATE POLICY "trainer_update_own" ON public.trainer_profiles
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "admin_manage_trainer_profiles" ON public.trainer_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- TABLE: classes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  trainer_id       UUID REFERENCES public.profiles(id),
  schedule         TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  capacity         INTEGER DEFAULT 20,
  enrolled_count   INTEGER DEFAULT 0,
  category         TEXT DEFAULT 'General',
  image_url        TEXT,
  level            TEXT DEFAULT 'All Levels' CHECK (level IN ('Beginner','Intermediate','Advanced','All Levels')),
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_public_read" ON public.classes
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_all_classes" ON public.classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "trainer_manage_own_classes" ON public.classes
  FOR UPDATE USING (auth.uid() = trainer_id);

-- Insert sample classes
INSERT INTO public.classes (name, description, category, schedule, duration_minutes, capacity, level, image_url) VALUES
('Power Yoga', 'Build strength and flexibility with this intense yoga session', 'Yoga', NOW() + INTERVAL '1 day 8 hours', 60, 15, 'All Levels', 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg'),
('HIIT Blast', 'High intensity interval training for maximum fat burn', 'Cardio', NOW() + INTERVAL '1 day 10 hours', 45, 20, 'Intermediate', 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg'),
('Heavy Lifting', 'Compound movements for serious muscle building', 'Strength', NOW() + INTERVAL '2 days 9 hours', 75, 12, 'Advanced', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Boxing Fundamentals', 'Learn boxing techniques and improve cardio', 'Martial Arts', NOW() + INTERVAL '2 days 17 hours', 60, 16, 'Beginner', 'https://images.pexels.com/photos/598687/pexels-photo-598687.jpeg'),
('Core Crusher', 'Target your core with this intensive abs workout', 'Core', NOW() + INTERVAL '3 days 7 hours', 40, 25, 'All Levels', 'https://images.pexels.com/photos/2827400/pexels-photo-2827400.jpeg'),
('Spin Cycling', 'Indoor cycling for endurance and calorie burn', 'Cardio', NOW() + INTERVAL '3 days 18 hours', 50, 18, 'Intermediate', 'https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg');

-- ============================================================
-- TABLE: class_bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.class_bookings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id   UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','attended','no-show')),
  booked_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, member_id)
);

ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_view_own_bookings" ON public.class_bookings
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "members_insert_booking" ON public.class_bookings
  FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "members_update_own_booking" ON public.class_bookings
  FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "trainer_view_class_bookings" ON public.class_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND trainer_id = auth.uid())
  );

CREATE POLICY "admin_all_bookings" ON public.class_bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment     TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_approved" ON public.reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "members_insert_review" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "members_view_own_review" ON public.reviews
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "admin_all_reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert sample reviews
INSERT INTO public.reviews (member_id, rating, comment, is_approved) VALUES
((SELECT id FROM auth.users LIMIT 1), 5, 'PowerFit completely transformed my fitness journey! The AI coaching is mind-blowing.', true),
((SELECT id FROM auth.users LIMIT 1), 5, 'Best gym management system ever. The trainers are top-notch and the AI BMI tracker is amazing!', true),
((SELECT id FROM auth.users LIMIT 1), 4, 'Great experience overall. The class booking system is super convenient. Highly recommended!', true),
((SELECT id FROM auth.users LIMIT 1), 5, 'The AI workout planner customizes everything for me. Lost 15kg in 3 months!', true),
((SELECT id FROM auth.users LIMIT 1), 5, 'Premium membership is totally worth it. The personalized training plans are exceptional.', true);

-- ============================================================
-- TABLE: ai_conversations (store AI chat history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages   JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_ai_conv" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER memberships_updated_at BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- VIEW: member_stats (for admin dashboard)
-- ============================================================
CREATE OR REPLACE VIEW public.member_stats AS
SELECT
  COUNT(*) FILTER (WHERE role = 'member') AS total_members,
  COUNT(*) FILTER (WHERE role = 'member' AND is_active = true) AS active_members,
  COUNT(*) FILTER (WHERE role = 'trainer') AS total_trainers,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days' AND role = 'member') AS new_members_this_month
FROM public.profiles;

-- Grant access
GRANT SELECT ON public.member_stats TO authenticated;

-- ============================================================
-- DONE: Schema created successfully
-- ============================================================
