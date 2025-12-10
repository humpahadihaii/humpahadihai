-- Create page_settings table for storing page-specific CMS content
CREATE TABLE public.page_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  hero_bullets JSONB DEFAULT '[]'::jsonb,
  hero_cta_label TEXT,
  hero_cta_link TEXT,
  intro_text TEXT,
  bottom_seo_text TEXT,
  custom_section_title TEXT,
  custom_section_description TEXT,
  custom_section_cta_label TEXT,
  custom_section_cta_link TEXT,
  faqs JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  extra_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read page settings (public content)
CREATE POLICY "Anyone can view page settings"
ON public.page_settings
FOR SELECT
USING (true);

-- Admins can manage page settings
CREATE POLICY "Admins can manage page settings"
ON public.page_settings
FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_page_settings_updated_at
  BEFORE UPDATE ON public.page_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data for Marketplace and Travel Packages pages
INSERT INTO public.page_settings (page_key, hero_title, hero_subtitle, hero_bullets, hero_image_url, custom_section_title, custom_section_description, custom_section_cta_label, custom_section_cta_link, faqs, meta_title, meta_description)
VALUES 
(
  'marketplace',
  'Tourism Marketplace',
  'Discover authentic local stays, experienced guides, reliable taxis, and unique experiences across Uttarakhand. Connect directly with verified local providers.',
  '[
    {"icon": "check", "text": "Verified homestays & local accommodations"},
    {"icon": "check", "text": "Experienced local guides & trek leaders"},
    {"icon": "check", "text": "Safe & reliable taxi services"},
    {"icon": "check", "text": "Authentic cultural experiences"}
  ]'::jsonb,
  NULL,
  'Need Something Custom?',
  'Can''t find what you''re looking for? Tell us your requirements and we''ll connect you with the right local providers.',
  'Submit a Travel Request',
  '/contact',
  '[
    {"question": "How are providers verified?", "answer": "All providers undergo a verification process where we check their credentials, reviews, and service quality before listing them on our marketplace."},
    {"question": "Is it safe to book through the marketplace?", "answer": "Yes, we only list providers with verified credentials. We also collect feedback after every booking to maintain quality standards."},
    {"question": "How do I make a booking?", "answer": "Click ''Enquire Now'' on any listing, fill in your details, and the provider will contact you directly to confirm availability and pricing."},
    {"question": "What payment methods are accepted?", "answer": "Payment is handled directly with the provider. Most accept UPI, bank transfers, and cash. Some providers also accept cards."},
    {"question": "Can I get a customized itinerary?", "answer": "Yes! Use the ''Submit a Travel Request'' option to describe your requirements and we''ll help connect you with suitable providers."}
  ]'::jsonb,
  'Tourism Marketplace | Local Stays & Experiences in Uttarakhand',
  'Discover authentic homestays, local guides, taxis, and unique experiences in Uttarakhand. Book directly with verified local providers.'
),
(
  'travel-packages',
  'Curated Travel Packages',
  'Experience the magic of Uttarakhand with our carefully crafted travel packages. From spiritual Char Dham yatras to thrilling adventure treks in the Himalayas.',
  '[
    {"icon": "check", "text": "Expert local guides"},
    {"icon": "check", "text": "Comfortable accommodations"},
    {"icon": "check", "text": "All-inclusive pricing"},
    {"icon": "check", "text": "Flexible customization"}
  ]'::jsonb,
  NULL,
  'Can''t Find the Perfect Package?',
  'Tell us your dream Uttarakhand adventure and we''ll create a custom itinerary just for you.',
  'Request Custom Package',
  '/contact',
  '[
    {"question": "What''s included in the package price?", "answer": "Each package clearly lists inclusions and exclusions. Typically, packages include accommodation, meals, transportation, and guide services. Check individual package details for specifics."},
    {"question": "Can packages be customized?", "answer": "Yes! We can modify most packages to suit your preferences, including adjusting duration, accommodation type, or adding specific activities."},
    {"question": "What is the best time to visit?", "answer": "Uttarakhand is beautiful year-round. Summer (April-June) is ideal for hill stations, monsoon (July-September) for lush landscapes, and winter for snow experiences. Each package mentions its best season."},
    {"question": "How do I book a package?", "answer": "Click ''View Details'' on any package and use the enquiry form. Our team will contact you within 24 hours with availability and pricing."}
  ]'::jsonb,
  'Travel Packages | Explore Uttarakhand | Hum Pahadi Haii',
  'Discover curated travel packages to explore Uttarakhand - from Char Dham yatra to adventure treks in Garhwal and Kumaon.'
);