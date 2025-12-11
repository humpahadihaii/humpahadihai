-- Create event type enum
CREATE TYPE event_type AS ENUM ('festival', 'fair', 'cultural', 'religious', 'music', 'food', 'sports', 'workshop', 'exhibition', 'other');

-- Create event status enum
CREATE TYPE event_status AS ENUM ('draft', 'pending', 'published', 'archived', 'cancelled');

-- Event venues table
CREATE TABLE public.event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  phone TEXT,
  website TEXT,
  capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Main events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  recurrence_end_at TIMESTAMPTZ,
  event_type event_type DEFAULT 'other',
  organizer_id UUID REFERENCES public.tourism_providers(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES public.event_venues(id) ON DELETE SET NULL,
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  ticket_price NUMERIC,
  ticket_url TEXT,
  capacity INTEGER,
  seats_booked INTEGER DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  tags TEXT[],
  map_visible BOOLEAN DEFAULT true,
  status event_status DEFAULT 'draft',
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event occurrences for recurring events
CREATE TABLE public.event_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  occurrence_start TIMESTAMPTZ NOT NULL,
  occurrence_end TIMESTAMPTZ,
  is_cancelled BOOLEAN DEFAULT false,
  override_title TEXT,
  override_description TEXT,
  override_venue_id UUID REFERENCES public.event_venues(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event tags table
CREATE TABLE public.event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event tag links (many-to-many)
CREATE TABLE public.event_tag_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.event_tags(id) ON DELETE CASCADE,
  UNIQUE(event_id, tag_id)
);

-- Event promotions (link packages/listings/products to events)
CREATE TABLE public.event_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('package', 'listing', 'product')),
  item_id UUID NOT NULL,
  promote BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  discount_percent NUMERIC,
  promo_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, item_type, item_id)
);

-- Event inquiries/ticket requests
CREATE TABLE public.event_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  occurrence_id UUID REFERENCES public.event_occurrences(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  seats_requested INTEGER DEFAULT 1,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'cancelled', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event audit log
CREATE TABLE public.event_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changed_by UUID,
  before_state JSONB,
  after_state JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_at ON public.events(start_at);
CREATE INDEX idx_events_district ON public.events(district_id);
CREATE INDEX idx_events_village ON public.events(village_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_featured ON public.events(is_featured) WHERE is_featured = true;
CREATE INDEX idx_event_occurrences_event ON public.event_occurrences(event_id);
CREATE INDEX idx_event_occurrences_start ON public.event_occurrences(occurrence_start);
CREATE INDEX idx_event_promotions_event ON public.event_promotions(event_id);
CREATE INDEX idx_event_inquiries_event ON public.event_inquiries(event_id);
CREATE INDEX idx_event_venues_district ON public.event_venues(district_id);
CREATE INDEX idx_event_venues_village ON public.event_venues(village_id);

-- Enable RLS
ALTER TABLE public.event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_venues
CREATE POLICY "Anyone can view active venues" ON public.event_venues FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can view all venues" ON public.event_venues FOR SELECT USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);
CREATE POLICY "Admins can manage venues" ON public.event_venues FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);

-- RLS Policies for events
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Staff can view all events" ON public.events FOR SELECT USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'moderator')
);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);

-- RLS Policies for event_occurrences
CREATE POLICY "Anyone can view occurrences of published events" ON public.event_occurrences FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status = 'published')
);
CREATE POLICY "Admins can manage occurrences" ON public.event_occurrences FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);

-- RLS Policies for event_tags
CREATE POLICY "Anyone can view event tags" ON public.event_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage event tags" ON public.event_tags FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);

-- RLS Policies for event_tag_links
CREATE POLICY "Anyone can view tag links" ON public.event_tag_links FOR SELECT USING (true);
CREATE POLICY "Admins can manage tag links" ON public.event_tag_links FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);

-- RLS Policies for event_promotions
CREATE POLICY "Anyone can view promotions for published events" ON public.event_promotions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status = 'published')
);
CREATE POLICY "Admins can manage promotions" ON public.event_promotions FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);

-- RLS Policies for event_inquiries
CREATE POLICY "Anyone can submit inquiries" ON public.event_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage inquiries" ON public.event_inquiries FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'support_agent')
);

-- RLS Policies for event_audit_log
CREATE POLICY "Admins can view audit log" ON public.event_audit_log FOR SELECT USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "System can insert audit log" ON public.event_audit_log FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager')
);

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_venues_updated_at BEFORE UPDATE ON public.event_venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_inquiries_updated_at BEFORE UPDATE ON public.event_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();