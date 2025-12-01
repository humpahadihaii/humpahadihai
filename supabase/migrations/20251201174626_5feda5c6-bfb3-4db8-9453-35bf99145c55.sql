-- Create enum for district content categories
CREATE TYPE public.district_content_category AS ENUM ('Festival', 'Food', 'Place', 'Culture');

-- Create district_content table
CREATE TABLE public.district_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  category public.district_content_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  google_map_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.district_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view district content"
ON public.district_content
FOR SELECT
USING (true);

CREATE POLICY "Admins and editors can manage district content"
ON public.district_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_district_content_updated_at
BEFORE UPDATE ON public.district_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_district_content_district_id ON public.district_content(district_id);
CREATE INDEX idx_district_content_category ON public.district_content(category);