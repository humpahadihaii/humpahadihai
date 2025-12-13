-- Featured Content Configuration Table
CREATE TABLE public.featured_content_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton_flag BOOLEAN NOT NULL DEFAULT true UNIQUE,
  auto_rotation_enabled BOOLEAN NOT NULL DEFAULT true,
  rotation_frequency TEXT NOT NULL DEFAULT 'daily',
  last_rotation_at TIMESTAMP WITH TIME ZONE,
  items_per_section INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Featured Content Slots Table (for manual control)
CREATE TABLE public.featured_content_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.cultural_content(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, -- 'cultural_highlight', 'local_food', 'spiritual', 'nature', 'districts'
  priority INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_manual BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(content_id, section_key)
);

-- Featured Content History (for tracking rotations)
CREATE TABLE public.featured_content_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.cultural_content(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  featured_date DATE NOT NULL DEFAULT CURRENT_DATE,
  was_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_content_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_content_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_content_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for featured_content_config
CREATE POLICY "Anyone can view featured config" ON public.featured_content_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage featured config" ON public.featured_content_config
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for featured_content_slots
CREATE POLICY "Anyone can view featured slots" ON public.featured_content_slots
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage featured slots" ON public.featured_content_slots
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for featured_content_history
CREATE POLICY "Admins can view featured history" ON public.featured_content_history
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert featured history" ON public.featured_content_history
  FOR INSERT WITH CHECK (true);

-- Insert default config
INSERT INTO public.featured_content_config (singleton_flag, auto_rotation_enabled, rotation_frequency, items_per_section)
VALUES (true, true, 'daily', 3);

-- Create index for faster queries
CREATE INDEX idx_featured_slots_section ON public.featured_content_slots(section_key);
CREATE INDEX idx_featured_history_date ON public.featured_content_history(featured_date);
CREATE INDEX idx_featured_history_content ON public.featured_content_history(content_id);