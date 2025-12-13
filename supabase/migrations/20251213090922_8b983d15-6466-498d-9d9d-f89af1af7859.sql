-- Add new columns to homepage_visits for enhanced tracking
ALTER TABLE public.homepage_visits 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS language TEXT;

-- Create index for faster deduplication queries
CREATE INDEX IF NOT EXISTS idx_homepage_visits_ip_device 
ON public.homepage_visits(ip, device_id) 
WHERE device_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_homepage_visits_created_at 
ON public.homepage_visits(created_at DESC);