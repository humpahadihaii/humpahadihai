-- Create AI usage log table for tracking all AI operations
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  action_type TEXT NOT NULL, -- 'single_generate', 'bulk_generate', 'faq', 'seo', 'translate', etc.
  content_type TEXT, -- 'story', 'travel', 'product', 'cultural_content', etc.
  model_used TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(10, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed', 'rate_limited'
  error_message TEXT,
  request_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI configuration table for admin-controlled settings
CREATE TABLE IF NOT EXISTS public.ai_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default AI config
INSERT INTO public.ai_config (setting_key, setting_value) VALUES
  ('active_model', '"gemini-2.5-flash"'),
  ('available_models', '["gemini-2.5-flash", "gemini-2.0-pro", "gemini-1.5-pro"]'),
  ('api_enabled', 'true'),
  ('rate_limit_per_minute', '30'),
  ('max_tokens_per_request', '8192')
ON CONFLICT (setting_key) DO NOTHING;

-- Create bulk generation jobs table
CREATE TABLE IF NOT EXISTS public.ai_bulk_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  job_type TEXT NOT NULL, -- 'category', 'district', 'selected_items'
  target_section TEXT NOT NULL, -- 'overview', 'history', 'faqs', 'seo', etc.
  target_ids UUID[] NOT NULL DEFAULT '{}',
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  successful_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  total_tokens_used INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd DECIMAL(10, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_bulk_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage_logs (Super Admin and Admin only)
CREATE POLICY "ai_usage_logs_select" ON public.ai_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "ai_usage_logs_insert" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for ai_config (Super Admin only for write, Admin can read)
CREATE POLICY "ai_config_select" ON public.ai_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "ai_config_update" ON public.ai_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "ai_config_insert" ON public.ai_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for ai_bulk_jobs
CREATE POLICY "ai_bulk_jobs_select" ON public.ai_bulk_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "ai_bulk_jobs_insert" ON public.ai_bulk_jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "ai_bulk_jobs_update" ON public.ai_bulk_jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created ON public.ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_bulk_jobs_user ON public.ai_bulk_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_bulk_jobs_status ON public.ai_bulk_jobs(status);