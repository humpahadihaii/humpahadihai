-- Fix security definer view by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.homepage_visits_summary;

CREATE OR REPLACE VIEW public.homepage_visits_summary 
WITH (security_invoker = true) AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) as today
FROM public.homepage_visits;