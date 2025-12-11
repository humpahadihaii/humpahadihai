-- Geo aggregation table
CREATE TABLE IF NOT EXISTS public.analytics_geo_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_date DATE NOT NULL,
  country TEXT,
  state TEXT,
  city TEXT,
  unique_visitors INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aggregate_date, country, state, city)
);

-- Alert configurations
CREATE TABLE IF NOT EXISTS public.analytics_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  metric TEXT NOT NULL, -- unique_visitors, sessions, page_views, conversions, bounce_rate
  condition TEXT NOT NULL, -- greater_than, less_than, equals, change_percent
  threshold NUMERIC NOT NULL,
  comparison_period TEXT DEFAULT 'previous_day', -- previous_day, previous_week, previous_month
  page_filter TEXT, -- optional page slug filter
  notification_channels JSONB DEFAULT '["email"]'::jsonb, -- email, whatsapp
  recipient_emails TEXT[],
  recipient_phones TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alert history/logs
CREATE TABLE IF NOT EXISTS public.analytics_alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_config_id UUID REFERENCES public.analytics_alert_configs(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  metric_value NUMERIC,
  threshold_value NUMERIC,
  comparison_value NUMERIC,
  notification_status JSONB, -- { email: 'sent', whatsapp: 'failed' }
  message TEXT,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id)
);

-- Scheduled reports
CREATE TABLE IF NOT EXISTS public.analytics_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- summary, detailed, funnel, geo, custom
  schedule TEXT NOT NULL, -- daily, weekly, monthly
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME DEFAULT '09:00:00',
  date_range TEXT DEFAULT 'last_7_days', -- last_7_days, last_30_days, last_month, custom
  filters JSONB DEFAULT '{}'::jsonb,
  export_format TEXT DEFAULT 'csv', -- csv, xlsx, pdf
  delivery_method TEXT DEFAULT 'email', -- email, storage, bigquery
  recipient_emails TEXT[],
  storage_path TEXT,
  bigquery_dataset TEXT,
  bigquery_table TEXT,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Report execution history
CREATE TABLE IF NOT EXISTS public.analytics_report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_report_id UUID REFERENCES public.analytics_scheduled_reports(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  records_count INTEGER,
  file_url TEXT,
  file_size INTEGER,
  error_message TEXT,
  duration_ms INTEGER
);

-- BigQuery export queue
CREATE TABLE IF NOT EXISTS public.analytics_bigquery_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL, -- events, sessions, aggregates
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  records_exported INTEGER,
  bigquery_job_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.analytics_geo_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_bigquery_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view geo aggregates" ON public.analytics_geo_aggregates
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'analytics_viewer'::app_role)
  );

CREATE POLICY "System can insert geo aggregates" ON public.analytics_geo_aggregates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage alert configs" ON public.analytics_alert_configs
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Analytics viewers can view alert configs" ON public.analytics_alert_configs
  FOR SELECT USING (has_role(auth.uid(), 'analytics_viewer'::app_role));

CREATE POLICY "Admins can manage alert logs" ON public.analytics_alert_logs
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Analytics viewers can view alert logs" ON public.analytics_alert_logs
  FOR SELECT USING (has_role(auth.uid(), 'analytics_viewer'::app_role));

CREATE POLICY "Admins can manage scheduled reports" ON public.analytics_scheduled_reports
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can manage report history" ON public.analytics_report_history
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can manage bigquery exports" ON public.analytics_bigquery_exports
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_geo_aggregates_date ON public.analytics_geo_aggregates(aggregate_date);
CREATE INDEX IF NOT EXISTS idx_geo_aggregates_country ON public.analytics_geo_aggregates(country);
CREATE INDEX IF NOT EXISTS idx_alert_logs_config ON public.analytics_alert_logs(alert_config_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_triggered ON public.analytics_alert_logs(triggered_at);
CREATE INDEX IF NOT EXISTS idx_report_history_report ON public.analytics_report_history(scheduled_report_id);
CREATE INDEX IF NOT EXISTS idx_bigquery_exports_status ON public.analytics_bigquery_exports(status);