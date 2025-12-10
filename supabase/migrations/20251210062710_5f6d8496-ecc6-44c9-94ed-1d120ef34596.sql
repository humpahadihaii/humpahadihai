-- Add is_sample and source columns to tourism_providers
ALTER TABLE public.tourism_providers 
ADD COLUMN IF NOT EXISTS is_sample boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin';

-- Add is_sample column to tourism_listings
ALTER TABLE public.tourism_listings 
ADD COLUMN IF NOT EXISTS is_sample boolean NOT NULL DEFAULT false;

-- Add page_settings entry for provider intake page
INSERT INTO public.page_settings (page_key, hero_title, hero_subtitle, hero_bullets, meta_title, meta_description, custom_section_title, custom_section_description)
VALUES (
  'list-your-business',
  'List Your Pahadi Business',
  'Join our growing community of local tourism providers and reach travelers from around the world',
  '["Free listing for local businesses", "Reach authentic travel seekers", "Support the local Uttarakhand economy", "Get featured in our curated travel packages"]',
  'List Your Business | Hum Pahadi Haii',
  'Register your homestay, guesthouse, taxi service, or local experience on Hum Pahadi Haii. Reach travelers exploring Uttarakhand.',
  'Why Partner With Us?',
  'Hum Pahadi Haii connects authentic Pahadi tourism providers with travelers seeking genuine Uttarakhand experiences.'
) ON CONFLICT (page_key) DO NOTHING;