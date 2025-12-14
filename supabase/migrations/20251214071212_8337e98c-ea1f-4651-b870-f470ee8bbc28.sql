-- Create cookie consent configuration table
CREATE TABLE public.cookie_consent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_flag BOOLEAN DEFAULT true UNIQUE CHECK (singleton_flag = true),
  -- Banner text
  banner_title TEXT DEFAULT 'We value your privacy',
  banner_description TEXT DEFAULT 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage your preferences below.',
  -- Category configuration
  categories JSONB DEFAULT '{
    "necessary": {
      "enabled": true,
      "locked": true,
      "title": "Essential Cookies",
      "description": "Required for basic site functionality. Cannot be disabled."
    },
    "analytics": {
      "enabled": true,
      "locked": false,
      "title": "Analytics Cookies",
      "description": "Help us understand how visitors interact with our website."
    },
    "marketing": {
      "enabled": true,
      "locked": false,
      "title": "Marketing Cookies",
      "description": "Used to track visitors across websites for advertising purposes."
    },
    "preferences": {
      "enabled": true,
      "locked": false,
      "title": "Preference Cookies",
      "description": "Remember your settings and preferences."
    }
  }'::jsonb,
  -- Button text
  accept_all_text TEXT DEFAULT 'Accept All',
  reject_all_text TEXT DEFAULT 'Reject All',
  manage_text TEXT DEFAULT 'Manage Preferences',
  save_text TEXT DEFAULT 'Save Preferences',
  -- Policy
  privacy_policy_url TEXT DEFAULT '/privacy-policy',
  cookie_policy_url TEXT DEFAULT '/privacy-policy#cookies',
  -- Consent expiry in days
  consent_expiry_days INTEGER DEFAULT 365,
  -- Policy version - increment to force re-consent
  policy_version INTEGER DEFAULT 1,
  -- Force re-consent flag
  force_reconsent BOOLEAN DEFAULT false,
  -- Styling
  banner_position TEXT DEFAULT 'bottom',
  theme TEXT DEFAULT 'auto',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent statistics table
CREATE TABLE public.cookie_consent_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  accepted_all INTEGER DEFAULT 0,
  rejected_all INTEGER DEFAULT 0,
  customized INTEGER DEFAULT 0,
  analytics_accepted INTEGER DEFAULT 0,
  marketing_accepted INTEGER DEFAULT 0,
  preferences_accepted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consent_date)
);

-- Enable RLS
ALTER TABLE public.cookie_consent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consent_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for consent settings (public read, admin write)
CREATE POLICY "Anyone can read consent settings"
ON public.cookie_consent_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update consent settings"
ON public.cookie_consent_settings FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can insert consent settings"
ON public.cookie_consent_settings FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS policies for consent stats (public insert for tracking, admin read)
CREATE POLICY "Anyone can insert consent stats"
ON public.cookie_consent_stats FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update consent stats"
ON public.cookie_consent_stats FOR UPDATE
USING (true);

CREATE POLICY "Admins can view consent stats"
ON public.cookie_consent_stats FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'analytics_viewer'::app_role)
);

-- Insert default settings
INSERT INTO public.cookie_consent_settings (singleton_flag) VALUES (true);

-- Create function to update consent stats
CREATE OR REPLACE FUNCTION public.increment_consent_stat(
  p_stat_type TEXT,
  p_categories TEXT[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert the daily stats record
  INSERT INTO cookie_consent_stats (consent_date)
  VALUES (CURRENT_DATE)
  ON CONFLICT (consent_date) DO NOTHING;
  
  -- Update the appropriate counter
  IF p_stat_type = 'accepted_all' THEN
    UPDATE cookie_consent_stats 
    SET accepted_all = accepted_all + 1,
        analytics_accepted = analytics_accepted + 1,
        marketing_accepted = marketing_accepted + 1,
        preferences_accepted = preferences_accepted + 1,
        updated_at = now()
    WHERE consent_date = CURRENT_DATE;
  ELSIF p_stat_type = 'rejected_all' THEN
    UPDATE cookie_consent_stats 
    SET rejected_all = rejected_all + 1,
        updated_at = now()
    WHERE consent_date = CURRENT_DATE;
  ELSIF p_stat_type = 'customized' THEN
    UPDATE cookie_consent_stats 
    SET customized = customized + 1,
        analytics_accepted = analytics_accepted + (CASE WHEN 'analytics' = ANY(p_categories) THEN 1 ELSE 0 END),
        marketing_accepted = marketing_accepted + (CASE WHEN 'marketing' = ANY(p_categories) THEN 1 ELSE 0 END),
        preferences_accepted = preferences_accepted + (CASE WHEN 'preferences' = ANY(p_categories) THEN 1 ELSE 0 END),
        updated_at = now()
    WHERE consent_date = CURRENT_DATE;
  END IF;
END;
$$;