-- Migration: create admin_impersonations table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_impersonations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id uuid NOT NULL,
  impersonated_user_id uuid NOT NULL,
  reason text NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  start_ip inet NULL,
  end_ip inet NULL,
  start_ua text NULL,
  end_ua text NULL,
  session_token text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for quick queries
CREATE INDEX idx_admin_impersonations_super_admin ON public.admin_impersonations (super_admin_id);
CREATE INDEX idx_admin_impersonations_impersonated ON public.admin_impersonations (impersonated_user_id);
CREATE INDEX idx_admin_impersonations_active ON public.admin_impersonations (super_admin_id) WHERE ended_at IS NULL;

-- Enable RLS
ALTER TABLE public.admin_impersonations ENABLE ROW LEVEL SECURITY;

-- Only super_admin can view impersonation logs
CREATE POLICY "Only super_admin can view impersonation logs"
ON public.admin_impersonations
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Only super_admin can insert impersonation records
CREATE POLICY "Only super_admin can insert impersonation logs"
ON public.admin_impersonations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Only super_admin can update impersonation records (to end session)
CREATE POLICY "Only super_admin can update impersonation logs"
ON public.admin_impersonations
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));