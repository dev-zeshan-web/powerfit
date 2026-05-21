-- ============================================================
-- PowerFit: Fix payments table — add plan_id, fix status
-- Run in Supabase SQL Editor
-- ============================================================

-- Add plan_id to payments so admin can see which plan was purchased
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);

-- Fix any stuck 'rejected' status values (rejected isn't valid, use 'failed')
UPDATE public.payments SET status = 'failed' WHERE status = 'rejected';

-- Add 'rejected' as valid alias by expanding CHECK (so existing data isn't broken)
-- Actually just keep 'failed' as the standard; update all refs in code
