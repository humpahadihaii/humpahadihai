-- =============================================
-- STEP 1: Add new roles to app_role enum
-- =============================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'author';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reviewer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'media_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'seo_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'analytics_viewer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';