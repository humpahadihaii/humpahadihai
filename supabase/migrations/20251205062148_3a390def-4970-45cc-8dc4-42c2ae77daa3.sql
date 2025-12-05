-- Add tehsil column to villages table for Census data import
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS tehsil text;