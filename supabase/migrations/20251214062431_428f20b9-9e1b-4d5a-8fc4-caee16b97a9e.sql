
-- Create homepage_ctas table for multiple admin-editable CTAs
CREATE TABLE public.homepage_ctas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  variant TEXT DEFAULT 'default',
  icon TEXT,
  position TEXT NOT NULL DEFAULT 'hero',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  background_color TEXT,
  text_color TEXT,
  size TEXT DEFAULT 'default',
  open_in_new_tab BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add constraint for valid positions
ALTER TABLE public.homepage_ctas ADD CONSTRAINT valid_position 
  CHECK (position IN ('hero', 'below_hero', 'mid_page', 'footer_cta'));

-- Add constraint for valid variants
ALTER TABLE public.homepage_ctas ADD CONSTRAINT valid_variant 
  CHECK (variant IN ('default', 'secondary', 'outline', 'ghost', 'destructive', 'link'));

-- Add constraint for valid sizes
ALTER TABLE public.homepage_ctas ADD CONSTRAINT valid_size 
  CHECK (size IN ('sm', 'default', 'lg', 'icon'));

-- Enable RLS
ALTER TABLE public.homepage_ctas ENABLE ROW LEVEL SECURITY;

-- Public read policy for active CTAs
CREATE POLICY "Anyone can view active CTAs" 
  ON public.homepage_ctas 
  FOR SELECT 
  USING (is_active = true);

-- Admin read all policy
CREATE POLICY "Admins can view all CTAs" 
  ON public.homepage_ctas 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Admin insert policy
CREATE POLICY "Admins can create CTAs" 
  ON public.homepage_ctas 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Admin update policy
CREATE POLICY "Admins can update CTAs" 
  ON public.homepage_ctas 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Admin delete policy (super_admin and admin only)
CREATE POLICY "Super admins can delete CTAs" 
  ON public.homepage_ctas 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_homepage_ctas_updated_at
  BEFORE UPDATE ON public.homepage_ctas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample CTAs
INSERT INTO public.homepage_ctas (label, url, variant, icon, position, display_order, is_active) VALUES
  ('Explore Culture', '/culture', 'default', 'Compass', 'hero', 1, true),
  ('View Gallery', '/gallery', 'secondary', 'Images', 'hero', 2, true),
  ('Discover Districts', '/districts', 'outline', 'MapPin', 'below_hero', 1, true),
  ('Travel Packages', '/travel-packages', 'outline', 'Mountain', 'below_hero', 2, true),
  ('Local Products', '/products', 'outline', 'ShoppingBag', 'below_hero', 3, true),
  ('List Your Business', '/list-your-business', 'default', 'Building2', 'mid_page', 1, true),
  ('Contact Us', '/contact', 'secondary', 'Mail', 'footer_cta', 1, true),
  ('Submit Your Story', '/submit-story', 'outline', 'PenTool', 'footer_cta', 2, true);
