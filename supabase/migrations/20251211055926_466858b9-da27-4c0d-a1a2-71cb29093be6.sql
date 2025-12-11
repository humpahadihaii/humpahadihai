-- Create featured_cards table with full localization and scheduling support
CREATE TABLE IF NOT EXISTS public.featured_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title jsonb NOT NULL DEFAULT '{"en":""}',
  subtitle jsonb NOT NULL DEFAULT '{"en":""}',
  cta_label jsonb NOT NULL DEFAULT '{"en":""}',
  cta_url jsonb NOT NULL DEFAULT '{"en":""}',
  image_url text NULL,
  image_alt jsonb NULL DEFAULT '{}',
  icon_name text NULL DEFAULT 'instagram',
  gradient_color text NULL DEFAULT 'bg-white/85',
  order_index int NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT true,
  visible_on_homepage boolean NOT NULL DEFAULT true,
  start_at timestamptz NULL,
  end_at timestamptz NULL,
  is_sample boolean NOT NULL DEFAULT false,
  ab_test_tag text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_featured_cards_slug ON public.featured_cards(slug);
CREATE INDEX idx_featured_cards_order ON public.featured_cards(order_index);
CREATE INDEX idx_featured_cards_published ON public.featured_cards(is_published, visible_on_homepage);

-- Enable RLS
ALTER TABLE public.featured_cards ENABLE ROW LEVEL SECURITY;

-- Public can view published cards that are visible and within date window
CREATE POLICY "Public can view active featured cards"
ON public.featured_cards
FOR SELECT
TO anon, authenticated
USING (
  is_published = true 
  AND visible_on_homepage = true
  AND (start_at IS NULL OR start_at <= now())
  AND (end_at IS NULL OR end_at >= now())
);

-- Admins can manage all featured cards
CREATE POLICY "Admins can manage featured cards"
ON public.featured_cards
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Staff can view all featured cards (for preview)
CREATE POLICY "Staff can view all featured cards"
ON public.featured_cards
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'content_manager'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_featured_cards_updated_at
BEFORE UPDATE ON public.featured_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default "Follow Our Journey" card
INSERT INTO public.featured_cards (
  slug,
  title,
  subtitle,
  cta_label,
  cta_url,
  icon_name,
  order_index,
  is_published,
  visible_on_homepage
) VALUES (
  'follow-our-journey',
  '{"en":"Follow Our Journey","hi":"हमारे साथ यात्रा करें"}',
  '{"en":"Join our Instagram community for daily stories, authentic recipes, and stunning Pahadi landscapes","hi":"दैनिक कहानियाँ, पारंपरिक व्यंजन और खूबसूरत पहाड़ी दृश्य के लिए हमारे इंस्टाग्राम से जुड़ें"}',
  '{"en":"@hum_pahadi_haii","hi":"@hum_pahadi_haii"}',
  '{"en":"https://instagram.com/hum_pahadi_haii","hi":"https://instagram.com/hum_pahadi_haii"}',
  'instagram',
  10,
  true,
  true
);

-- Grant permissions
GRANT SELECT ON public.featured_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.featured_cards TO authenticated;