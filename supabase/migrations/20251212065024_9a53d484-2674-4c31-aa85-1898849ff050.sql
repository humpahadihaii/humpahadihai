-- Add spotlight fields to district_festivals for seasonal festival highlighting
ALTER TABLE public.district_festivals 
ADD COLUMN IF NOT EXISTS start_month integer CHECK (start_month >= 1 AND start_month <= 12),
ADD COLUMN IF NOT EXISTS end_month integer CHECK (end_month >= 1 AND end_month <= 12),
ADD COLUMN IF NOT EXISTS is_spotlight boolean DEFAULT false;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_district_festivals_spotlight ON public.district_festivals(is_spotlight) WHERE is_spotlight = true;
CREATE INDEX IF NOT EXISTS idx_district_festivals_months ON public.district_festivals(start_month, end_month);

-- Add lat/lng to district_hotels if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'district_hotels' AND column_name = 'lat') THEN
    ALTER TABLE public.district_hotels ADD COLUMN lat numeric;
    ALTER TABLE public.district_hotels ADD COLUMN lng numeric;
  END IF;
END $$;

-- Create index on events for performance
CREATE INDEX IF NOT EXISTS idx_events_district_id ON public.events(district_id);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- Comment on new columns
COMMENT ON COLUMN public.district_festivals.start_month IS 'Month (1-12) when festival starts';
COMMENT ON COLUMN public.district_festivals.end_month IS 'Month (1-12) when festival ends';
COMMENT ON COLUMN public.district_festivals.is_spotlight IS 'Whether this festival should be featured in spotlight sections';