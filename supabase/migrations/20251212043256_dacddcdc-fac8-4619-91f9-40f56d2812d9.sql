-- Enable required extensions FIRST
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search_documents table for unified search index
CREATE TABLE public.search_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  source_id uuid NOT NULL,
  title text NOT NULL,
  subtitle text,
  excerpt text,
  body_text text,
  district_id uuid,
  district_name text,
  village_id uuid,
  village_name text,
  category text,
  tags text[],
  price_min numeric,
  price_max numeric,
  rating numeric,
  lat numeric,
  lng numeric,
  image_url text,
  url_slug text,
  is_promoted boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  clicks_count integer DEFAULT 0,
  conversions_count integer DEFAULT 0,
  is_published boolean DEFAULT true,
  source_created_at timestamptz,
  source_updated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(body_text, '')), 'D')
  ) STORED,
  embedding vector(768),
  CONSTRAINT unique_source UNIQUE (content_type, source_id)
);

-- Indexes
CREATE INDEX idx_search_documents_search_vector ON search_documents USING GIN (search_vector);
CREATE INDEX idx_search_documents_content_type ON search_documents (content_type);
CREATE INDEX idx_search_documents_district_id ON search_documents (district_id);
CREATE INDEX idx_search_documents_is_published ON search_documents (is_published);
CREATE INDEX idx_search_documents_is_promoted ON search_documents (is_promoted);
CREATE INDEX idx_search_documents_tags ON search_documents USING GIN (tags);
CREATE INDEX idx_search_documents_title_trgm ON search_documents USING GIN (title gin_trgm_ops);

-- Query logs table
CREATE TABLE public.search_query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  query_normalized text,
  filters jsonb,
  results_count integer DEFAULT 0,
  result_ids uuid[],
  session_id text,
  user_id uuid,
  user_location jsonb,
  lexical_ms integer,
  vector_ms integer,
  total_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_search_query_logs_created_at ON search_query_logs (created_at);

-- Feedback table
CREATE TABLE public.search_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_log_id uuid REFERENCES search_query_logs(id),
  document_id uuid REFERENCES search_documents(id),
  result_position integer,
  feedback_type text NOT NULL,
  session_id text,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Suggestions table
CREATE TABLE public.search_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_text text NOT NULL,
  suggestion_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  priority integer DEFAULT 0,
  search_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_search_suggestions_text_trgm ON search_suggestions USING GIN (suggestion_text gin_trgm_ops);

-- Synonyms table
CREATE TABLE public.search_synonyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  synonyms text[] NOT NULL,
  language text DEFAULT 'en',
  scope text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE search_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_synonyms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published search documents" ON search_documents FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage search documents" ON search_documents FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can insert query logs" ON search_query_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view query logs" ON search_query_logs FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can insert search feedback" ON search_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view search feedback" ON search_feedback FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active suggestions" ON search_suggestions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage search suggestions" ON search_suggestions FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active synonyms" ON search_synonyms FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage search synonyms" ON search_synonyms FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text text,
  query_embedding vector(768) DEFAULT NULL,
  match_count int DEFAULT 20,
  content_types text[] DEFAULT NULL,
  district_filter uuid DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  promoted_only boolean DEFAULT false,
  lexical_weight float DEFAULT 0.4,
  semantic_weight float DEFAULT 0.6
)
RETURNS TABLE (
  id uuid,
  content_type text,
  source_id uuid,
  title text,
  subtitle text,
  excerpt text,
  district_name text,
  village_name text,
  category text,
  image_url text,
  url_slug text,
  is_promoted boolean,
  is_featured boolean,
  rating numeric,
  price_min numeric,
  lat numeric,
  lng numeric,
  lexical_score float,
  semantic_score float,
  final_score float
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH lexical_results AS (
    SELECT 
      sd.id as doc_id,
      ts_rank_cd(sd.search_vector, plainto_tsquery('english', query_text)) as score
    FROM search_documents sd
    WHERE sd.is_published = true
      AND sd.search_vector @@ plainto_tsquery('english', query_text)
      AND (content_types IS NULL OR sd.content_type = ANY(content_types))
      AND (district_filter IS NULL OR sd.district_id = district_filter)
      AND (min_price IS NULL OR sd.price_min >= min_price)
      AND (max_price IS NULL OR sd.price_max <= max_price)
      AND (NOT promoted_only OR sd.is_promoted = true)
    ORDER BY score DESC
    LIMIT match_count * 2
  ),
  semantic_results AS (
    SELECT 
      sd.id as doc_id,
      CASE WHEN query_embedding IS NOT NULL AND sd.embedding IS NOT NULL 
           THEN 1 - (sd.embedding <=> query_embedding) 
           ELSE 0 END as score
    FROM search_documents sd
    WHERE sd.is_published = true
      AND query_embedding IS NOT NULL
      AND sd.embedding IS NOT NULL
      AND (content_types IS NULL OR sd.content_type = ANY(content_types))
      AND (district_filter IS NULL OR sd.district_id = district_filter)
      AND (min_price IS NULL OR sd.price_min >= min_price)
      AND (max_price IS NULL OR sd.price_max <= max_price)
      AND (NOT promoted_only OR sd.is_promoted = true)
    ORDER BY sd.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  combined AS (
    SELECT 
      COALESCE(lr.doc_id, sr.doc_id) as doc_id,
      COALESCE(lr.score, 0) as lex_score,
      COALESCE(sr.score, 0) as sem_score
    FROM lexical_results lr
    FULL OUTER JOIN semantic_results sr ON lr.doc_id = sr.doc_id
  ),
  scored AS (
    SELECT 
      c.doc_id,
      c.lex_score,
      c.sem_score,
      (c.lex_score * lexical_weight + c.sem_score * semantic_weight + 
       CASE WHEN sd.is_promoted THEN 0.1 ELSE 0 END +
       CASE WHEN sd.is_featured THEN 0.05 ELSE 0 END) as combined_score
    FROM combined c
    JOIN search_documents sd ON sd.id = c.doc_id
  )
  SELECT 
    sd.id,
    sd.content_type,
    sd.source_id,
    sd.title,
    sd.subtitle,
    sd.excerpt,
    sd.district_name,
    sd.village_name,
    sd.category,
    sd.image_url,
    sd.url_slug,
    sd.is_promoted,
    sd.is_featured,
    sd.rating,
    sd.price_min,
    sd.lat,
    sd.lng,
    s.lex_score::float as lexical_score,
    s.sem_score::float as semantic_score,
    s.combined_score::float as final_score
  FROM scored s
  JOIN search_documents sd ON sd.id = s.doc_id
  ORDER BY s.combined_score DESC
  LIMIT match_count;
END;
$$;