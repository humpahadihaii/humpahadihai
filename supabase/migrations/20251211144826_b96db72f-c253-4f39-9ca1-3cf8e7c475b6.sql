-- Funnel definitions table
CREATE TABLE IF NOT EXISTS public.analytics_funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Funnel results (aggregated)
CREATE TABLE IF NOT EXISTS public.analytics_funnel_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid REFERENCES public.analytics_funnels(id) ON DELETE CASCADE,
  result_date date NOT NULL DEFAULT CURRENT_DATE,
  step_results jsonb NOT NULL DEFAULT '[]',
  total_sessions integer DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(funnel_id, result_date)
);

-- Session paths for path analysis
CREATE TABLE IF NOT EXISTS public.analytics_session_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  path_sequence text[] NOT NULL DEFAULT '{}',
  entry_page text,
  exit_page text,
  page_count integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  is_bounce boolean DEFAULT false,
  has_conversion boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Retention cohorts
CREATE TABLE IF NOT EXISTS public.analytics_retention_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_date date NOT NULL,
  cohort_size integer DEFAULT 0,
  retention_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_funnel_results_date ON public.analytics_funnel_results(result_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_paths_session ON public.analytics_session_paths(session_id);
CREATE INDEX IF NOT EXISTS idx_session_paths_created ON public.analytics_session_paths(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_retention_cohorts_date ON public.analytics_retention_cohorts(cohort_date DESC);

-- Enable RLS
ALTER TABLE public.analytics_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_funnel_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_session_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_retention_cohorts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage funnels" ON public.analytics_funnels FOR ALL USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "Analytics viewers can view funnels" ON public.analytics_funnels FOR SELECT USING (
  has_role(auth.uid(), 'analytics_viewer')
);

CREATE POLICY "System can insert funnel results" ON public.analytics_funnel_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view funnel results" ON public.analytics_funnel_results FOR SELECT USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'analytics_viewer')
);

CREATE POLICY "System can insert session paths" ON public.analytics_session_paths FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view session paths" ON public.analytics_session_paths FOR SELECT USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'analytics_viewer')
);

CREATE POLICY "System can manage retention cohorts" ON public.analytics_retention_cohorts FOR ALL USING (true);
CREATE POLICY "Admins can view retention cohorts" ON public.analytics_retention_cohorts FOR SELECT USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'analytics_viewer')
);