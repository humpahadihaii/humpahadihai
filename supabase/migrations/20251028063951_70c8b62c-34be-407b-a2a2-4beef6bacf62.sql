-- Add new columns to districts table for comprehensive information
ALTER TABLE public.districts
ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT,
ADD COLUMN IF NOT EXISTS connectivity TEXT,
ADD COLUMN IF NOT EXISTS local_languages TEXT,
ADD COLUMN IF NOT EXISTS famous_specialties TEXT,
ADD COLUMN IF NOT EXISTS cultural_identity TEXT;

-- Create table for district hotels and stays
CREATE TABLE IF NOT EXISTS public.district_hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('budget', 'mid-range', 'luxury', 'eco-stay', 'homestay')),
  location TEXT,
  contact_info TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on district_hotels
ALTER TABLE public.district_hotels ENABLE ROW LEVEL SECURITY;

-- Create policies for district_hotels
CREATE POLICY "Anyone can view district hotels"
ON public.district_hotels
FOR SELECT
USING (true);

CREATE POLICY "Admins and editors can manage district hotels"
ON public.district_hotels
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create trigger for updated_at on district_hotels
CREATE TRIGGER update_district_hotels_updated_at
BEFORE UPDATE ON public.district_hotels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_district_hotels_district_id ON public.district_hotels(district_id);
CREATE INDEX IF NOT EXISTS idx_district_hotels_category ON public.district_hotels(category);

-- Add more highlight types to district_highlights (existing table supports various types already)
-- The type column is flexible text, so we can add: natural_attraction, religious_site, adventure_activity