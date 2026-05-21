-- ============================================================
-- PowerFit: Fix classes table + RLS policy name mismatch
-- Run AFTER schema.sql and fix_rls.sql
-- ============================================================

-- 1. Add missing columns to classes
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Main Hall';

-- 2. Drop the recursive admin policy (schema named it "admin_all_classes"
--    but fix_rls.sql was dropping "admin_manage_classes" — mismatch)
DROP POLICY IF EXISTS "admin_all_classes"    ON public.classes;
DROP POLICY IF EXISTS "admin_manage_classes" ON public.classes;

-- 3. Recreate using the safe is_admin() function
CREATE POLICY "admin_all_classes" ON public.classes
  FOR ALL USING (public.is_admin());

-- 4. Enable realtime on classes and class_bookings
--    (run once — idempotent)
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_bookings;

-- 5. Update sample classes to have a location
UPDATE public.classes SET location = 'Yoga Studio'   WHERE name = 'Power Yoga';
UPDATE public.classes SET location = 'Cardio Zone'   WHERE name = 'HIIT Blast';
UPDATE public.classes SET location = 'Weight Room'   WHERE name = 'Heavy Lifting';
UPDATE public.classes SET location = 'Boxing Ring'   WHERE name = 'Boxing Fundamentals';
UPDATE public.classes SET location = 'Main Hall'     WHERE name = 'Core Crusher';
UPDATE public.classes SET location = 'Spin Studio'   WHERE name = 'Spin Cycling';
