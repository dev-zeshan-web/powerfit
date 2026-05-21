-- ============================================================
-- PowerFit: Fix reviews table — add reviewer_name, auto-approve
-- Run in Supabase SQL Editor
-- ============================================================

-- Add reviewer_name column so public page can show name without RLS join issue
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- Auto-approve all existing reviews so they appear on the website
UPDATE public.reviews SET is_approved = true WHERE is_approved = false;

-- Update sample reviews to have reviewer_name
UPDATE public.reviews SET reviewer_name = 'Ahmed Raza'   WHERE comment ILIKE '%transformed my life%';
UPDATE public.reviews SET reviewer_name = 'Bilal Hassan'  WHERE comment ILIKE '%Best gym%';
UPDATE public.reviews SET reviewer_name = 'Usman Khan'   WHERE comment ILIKE '%class booking%';
