-- =====================================================
-- POST-BOOKING NOTIFICATION SYSTEM
-- =====================================================

-- A) booking_notify_settings (singleton configuration)
CREATE TABLE IF NOT EXISTS public.booking_notify_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_flag boolean NOT NULL DEFAULT true,
  enabled_whatsapp boolean NOT NULL DEFAULT true,
  enabled_email boolean NOT NULL DEFAULT true,
  whatsapp_label varchar(80) NOT NULL DEFAULT 'WhatsApp Us',
  email_label varchar(80) NOT NULL DEFAULT 'Email Us',
  admin_fallback_phone text NULL,
  admin_fallback_email text NULL,
  allow_server_fallback boolean NOT NULL DEFAULT false,
  server_fallback_rate_limit_per_hour int NOT NULL DEFAULT 5,
  phone_min_digits int NOT NULL DEFAULT 8,
  default_language text NOT NULL DEFAULT 'en',
  show_confirm_question boolean NOT NULL DEFAULT true,
  position_order jsonb NOT NULL DEFAULT '["whatsapp", "email"]',
  visibility jsonb NOT NULL DEFAULT '{"package": true, "listing": true, "product": true}',
  config_version int NOT NULL DEFAULT 1,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Singleton constraint
CREATE UNIQUE INDEX IF NOT EXISTS uq_notify_settings_singleton
ON public.booking_notify_settings(singleton_flag) WHERE singleton_flag = true;

-- Enable RLS
ALTER TABLE public.booking_notify_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_notify_settings
CREATE POLICY "Admin and super_admin can view notify settings"
ON public.booking_notify_settings FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only super_admin can insert notify settings"
ON public.booking_notify_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admin can update notify settings"
ON public.booking_notify_settings FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admin can delete notify settings"
ON public.booking_notify_settings FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- B) booking_notify_templates (versioned templates)
CREATE TABLE IF NOT EXISTS public.booking_notify_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(64) NOT NULL,
  template text NOT NULL,
  description text NULL,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for active templates lookup
CREATE INDEX IF NOT EXISTS idx_notify_templates_key_active 
ON public.booking_notify_templates(key, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.booking_notify_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_notify_templates
CREATE POLICY "Admin and super_admin can view notify templates"
ON public.booking_notify_templates FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only super_admin can insert notify templates"
ON public.booking_notify_templates FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admin can update notify templates"
ON public.booking_notify_templates FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admin can delete notify templates"
ON public.booking_notify_templates FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- C) booking_notify_audit (audit log)
CREATE TABLE IF NOT EXISTS public.booking_notify_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id uuid REFERENCES public.booking_notify_settings(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.booking_notify_templates(id) ON DELETE SET NULL,
  changed_by uuid NULL,
  change_type text NOT NULL,
  before_value jsonb NULL,
  after_value jsonb NULL,
  ip inet NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for audit lookups
CREATE INDEX IF NOT EXISTS idx_notify_audit_created 
ON public.booking_notify_audit(created_at DESC);

-- Enable RLS
ALTER TABLE public.booking_notify_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_notify_audit (super_admin only)
CREATE POLICY "Only super_admin can view notify audit"
ON public.booking_notify_audit FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admin can insert notify audit"
ON public.booking_notify_audit FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- D) booking_notify_consent (for server fallback)
CREATE TABLE IF NOT EXISTS public.booking_notify_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  consent_ip inet NULL,
  consent_ua text NULL
);

-- Index for consent lookups
CREATE INDEX IF NOT EXISTS idx_notify_consent_booking 
ON public.booking_notify_consent(booking_id);

-- Enable RLS
ALTER TABLE public.booking_notify_consent ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_notify_consent
CREATE POLICY "Super_admin can view all consents"
ON public.booking_notify_consent FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can insert own consent"
ON public.booking_notify_consent FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default singleton settings
INSERT INTO public.booking_notify_settings (
  singleton_flag,
  enabled_whatsapp,
  enabled_email,
  whatsapp_label,
  email_label,
  default_language,
  position_order,
  visibility
) VALUES (
  true,
  true,
  true,
  'WhatsApp Hum Pahadi Haii',
  'Email Hum Pahadi Haii',
  'en',
  '["whatsapp", "email"]',
  '{"package": true, "listing": true, "product": true}'
) ON CONFLICT DO NOTHING;

-- Insert default templates
INSERT INTO public.booking_notify_templates (key, template, description, version) VALUES
('whatsapp_short_en', 'Hi! I just booked {{itemName}}. Booking ref: {{bookingId}}. Please confirm.', 'Short WhatsApp message (English)', 1),
('whatsapp_short_hi', 'नमस्ते! मैंने {{itemName}} बुक किया है। बुकिंग रेफ: {{bookingId}}। कृपया कन्फर्म करें।', 'Short WhatsApp message (Hindi)', 1),
('whatsapp_full_en', 'Namaste Hum Pahadi Haii Team,

I just submitted a {{bookingType}} on your website.

Name: {{customerName}}
Email: {{customerEmail}}
Phone: {{customerPhone}}

Type: {{bookingType}}
Item: {{itemName}}

Dates: {{dates}}
{{guestInfo}}
{{productInfo}}

Notes: {{notes}}

Please confirm my booking.', 'Full WhatsApp message (English)', 1),
('whatsapp_full_hi', 'नमस्ते हम पहाड़ी हैं टीम,

मैंने अभी आपकी वेबसाइट पर {{bookingType}} सबमिट किया है।

नाम: {{customerName}}
ईमेल: {{customerEmail}}
फोन: {{customerPhone}}

प्रकार: {{bookingType}}
आइटम: {{itemName}}

तिथियां: {{dates}}
{{guestInfo}}
{{productInfo}}

नोट्स: {{notes}}

कृपया मेरी बुकिंग कन्फर्म करें।', 'Full WhatsApp message (Hindi)', 1),
('email_subject_en', '{{bookingType}} – {{itemName}}', 'Email subject (English)', 1),
('email_subject_hi', '{{bookingType}} – {{itemName}}', 'Email subject (Hindi)', 1),
('email_body_en', 'Namaste Hum Pahadi Haii Team,

I just submitted a {{bookingType}} on your website. Here are my details:

Name: {{customerName}}
Email: {{customerEmail}}
Phone/WhatsApp: {{customerPhone}}

Type: {{bookingType}}
Item: {{itemName}}

Dates:
{{dates}}
{{guestInfo}}
{{productInfo}}

Additional notes:
{{notes}}

Please confirm my {{bookingType}} and share the next steps.

Thank you!
{{customerName}}', 'Full Email body (English)', 1),
('email_body_hi', 'नमस्ते हम पहाड़ी हैं टीम,

मैंने अभी आपकी वेबसाइट पर {{bookingType}} सबमिट किया है। यहाँ मेरी जानकारी है:

नाम: {{customerName}}
ईमेल: {{customerEmail}}
फोन/व्हाट्सएप: {{customerPhone}}

प्रकार: {{bookingType}}
आइटम: {{itemName}}

तिथियां:
{{dates}}
{{guestInfo}}
{{productInfo}}

अतिरिक्त नोट्स:
{{notes}}

कृपया मेरी {{bookingType}} कन्फर्म करें और अगले कदम बताएं।

धन्यवाद!
{{customerName}}', 'Full Email body (Hindi)', 1)
ON CONFLICT DO NOTHING;