
-- Create share_referrals table for tracking incoming referrals
CREATE TABLE IF NOT EXISTS public.share_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_source text NOT NULL,
  full_url text NOT NULL,
  page_type text NOT NULL,
  page_id uuid NULL,
  ip_hash text NULL,
  user_agent text NULL,
  visited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_share_referrals_page ON public.share_referrals (page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_share_referrals_source ON public.share_referrals (ref_source);
CREATE INDEX IF NOT EXISTS idx_share_referrals_visited_at ON public.share_referrals (visited_at);

-- Create social_share_settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.social_share_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT true,
  share_title text DEFAULT 'Share the Pahadi Spirit!',
  default_message text DEFAULT 'Discover the beauty of Uttarakhand!',
  button_position text DEFAULT 'bottom-right',
  theme text DEFAULT 'pahadi-green',
  custom_icons jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  singleton_flag boolean DEFAULT true UNIQUE
);

-- Insert default settings
INSERT INTO public.social_share_settings (is_enabled, share_title, default_message, button_position, theme)
VALUES (true, 'Share the Pahadi Spirit!', 'Discover the beauty of Uttarakhand!', 'bottom-right', 'pahadi-green')
ON CONFLICT (singleton_flag) DO NOTHING;

-- Enable RLS
ALTER TABLE public.share_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_share_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for share_referrals
CREATE POLICY "Allow public insert for share_referrals"
ON public.share_referrals
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view share_referrals"
ON public.share_referrals
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'analytics_viewer'::app_role)
);

-- RLS policies for social_share_settings
CREATE POLICY "Anyone can view share settings"
ON public.social_share_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage share settings"
ON public.social_share_settings
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);
