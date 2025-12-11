-- Add new columns to existing analytics_settings table
ALTER TABLE public.analytics_settings 
ADD COLUMN IF NOT EXISTS raw_event_retention_days integer DEFAULT 180,
ADD COLUMN IF NOT EXISTS aggregate_retention_days integer DEFAULT 730,
ADD COLUMN IF NOT EXISTS heatmap_sampling_rate numeric DEFAULT 0.1,
ADD COLUMN IF NOT EXISTS enable_click_tracking boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_scroll_tracking boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_heatmaps boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS opt_out_cookie_name text DEFAULT 'hp_analytics_opt_out';