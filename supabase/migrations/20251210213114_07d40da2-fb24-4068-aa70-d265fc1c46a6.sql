-- Create table for tracking admin section visits
CREATE TABLE IF NOT EXISTS public.admin_section_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_section_visits ENABLE ROW LEVEL SECURITY;

-- Only super_admin and developer can view
CREATE POLICY "Super admin and developer can view admin section visits"
ON public.admin_section_visits
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

-- Authenticated users can insert their own visits
CREATE POLICY "Authenticated users can insert own section visits"
ON public.admin_section_visits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_admin_section_visits_created_at ON public.admin_section_visits(created_at DESC);
CREATE INDEX idx_admin_section_visits_user_id ON public.admin_section_visits(user_id);
CREATE INDEX idx_admin_section_visits_section ON public.admin_section_visits(section);

-- Add raw_referrer column to site_visits for full referrer URL
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS raw_referrer TEXT;

-- Add section column to site_visits to track which section was visited
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS section TEXT;