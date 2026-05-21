-- ============================================================
-- PowerFit: Fix RLS Infinite Recursion on profiles table
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- ============================================================

-- STEP 1: Drop all existing admin policies that cause recursion
DROP POLICY IF EXISTS "admin_all_profiles"         ON public.profiles;
DROP POLICY IF EXISTS "admin_all_memberships"      ON public.memberships;
DROP POLICY IF EXISTS "admin_all_payments"         ON public.payments;
DROP POLICY IF EXISTS "admin_manage_classes"       ON public.classes;
DROP POLICY IF EXISTS "admin_all_bookings"         ON public.class_bookings;
DROP POLICY IF EXISTS "admin_all_reviews"          ON public.reviews;
DROP POLICY IF EXISTS "admin_manage_trainer_profiles" ON public.trainer_profiles;

-- STEP 2: Create a SECURITY DEFINER function that bypasses RLS
-- This function runs as the DB owner so it won't trigger RLS on profiles,
-- breaking the infinite recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- STEP 3: Recreate all admin policies using the safe function

-- profiles
CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- memberships
CREATE POLICY "admin_all_memberships" ON public.memberships
  FOR ALL USING (public.is_admin());

-- payments
CREATE POLICY "admin_all_payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- classes
CREATE POLICY "admin_manage_classes" ON public.classes
  FOR ALL USING (public.is_admin());

-- class_bookings
CREATE POLICY "admin_all_bookings" ON public.class_bookings
  FOR ALL USING (public.is_admin());

-- reviews
CREATE POLICY "admin_all_reviews" ON public.reviews
  FOR ALL USING (public.is_admin());

-- trainer_profiles
CREATE POLICY "admin_manage_trainer_profiles" ON public.trainer_profiles
  FOR ALL USING (public.is_admin());

-- ============================================================
-- Done! The infinite recursion is now fixed.
-- ============================================================
