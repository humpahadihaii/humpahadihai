-- Create site_images table for managing static site assets
CREATE TABLE public.site_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Policies for site_images
CREATE POLICY "Anyone can view site images"
  ON public.site_images
  FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can manage site images"
  ON public.site_images
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default images
INSERT INTO public.site_images (key, title, description, image_url, category) VALUES
  ('hero-mountains', 'Hero Mountains', 'Main hero section background image', '/placeholder.svg', 'hero'),
  ('aipan-pattern', 'Aipan Pattern', 'Traditional Aipan art pattern', '/placeholder.svg', 'culture'),
  ('folk-dance', 'Folk Dance', 'Traditional folk dance image', '/placeholder.svg', 'culture'),
  ('pahadi-food', 'Pahadi Food', 'Traditional Pahadi cuisine', '/placeholder.svg', 'food');