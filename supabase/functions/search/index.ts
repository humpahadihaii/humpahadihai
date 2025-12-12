import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

// Generate embedding using Lovable AI Gateway
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!lovableApiKey) {
    console.log("No LOVABLE_API_KEY, skipping embedding generation");
    return null;
  }

  try {
    // Use Gemini embedding model via Lovable gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-004",
        input: text.slice(0, 8000), // Limit input size
      }),
    });

    if (!response.ok) {
      console.error("Embedding API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // POST /search/query - Main search endpoint
    if (req.method === "POST" && path === "query") {
      const startTime = Date.now();
      const body = await req.json();
      const {
        q,
        filter = {},
        page = 1,
        limit = 12,
        session_id,
        user_id,
        user_location,
      } = body;

      if (!q || q.trim().length === 0) {
        return new Response(
          JSON.stringify({ results: [], total: 0, page, limit }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const queryText = q.trim().toLowerCase();
      const lexicalStart = Date.now();

      // Generate embedding for semantic search
      const embeddingStart = Date.now();
      const embedding = await generateEmbedding(queryText);
      const embeddingMs = Date.now() - embeddingStart;

      // Build filters
      const contentTypes = filter.content_type?.length > 0 ? filter.content_type : null;
      const districtId = filter.district || null;
      const minPrice = filter.price_min || null;
      const maxPrice = filter.price_max || null;
      const promotedOnly = filter.promoted_only || false;

      // Execute hybrid search
      const { data: results, error: searchError } = await supabase.rpc("hybrid_search", {
        query_text: queryText,
        query_embedding: embedding,
        match_count: limit * 2, // Get more for better ranking
        content_types: contentTypes,
        district_filter: districtId,
        min_price: minPrice,
        max_price: maxPrice,
        promoted_only: promotedOnly,
        lexical_weight: 0.4,
        semantic_weight: embedding ? 0.6 : 0,
      });

      const lexicalMs = Date.now() - lexicalStart;

      if (searchError) {
        console.error("Search error:", searchError);
        throw searchError;
      }

      // Apply pagination
      const paginatedResults = (results || []).slice((page - 1) * limit, page * limit);

      // Format results with URLs
      const formattedResults = paginatedResults.map((r: any) => ({
        id: r.id,
        source_id: r.source_id,
        type: r.content_type,
        title: r.title,
        subtitle: r.subtitle,
        excerpt: r.excerpt,
        district: r.district_name,
        village: r.village_name,
        category: r.category,
        image_url: r.image_url,
        url: buildUrl(r.content_type, r.url_slug, r.source_id),
        is_promoted: r.is_promoted,
        is_featured: r.is_featured,
        rating: r.rating,
        price: r.price_min,
        lat: r.lat,
        lng: r.lng,
        score: r.final_score,
        lexical_score: r.lexical_score,
        semantic_score: r.semantic_score,
      }));

      const totalMs = Date.now() - startTime;

      // Log query (async, don't await)
      logQuery(supabase, {
        query_text: q,
        query_normalized: queryText,
        filters: filter,
        results_count: results?.length || 0,
        result_ids: formattedResults.map((r: any) => r.id),
        session_id,
        user_id,
        user_location,
        lexical_ms: lexicalMs,
        vector_ms: embeddingMs,
        total_ms: totalMs,
      });

      return new Response(
        JSON.stringify({
          results: formattedResults,
          total: results?.length || 0,
          page,
          limit,
          timings: {
            lexical_ms: lexicalMs,
            vector_ms: embeddingMs,
            total_ms: totalMs,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /search/suggest - Autosuggest endpoint
    if (req.method === "GET" && path === "suggest") {
      const q = url.searchParams.get("q") || "";
      const type = url.searchParams.get("type");
      const limitParam = parseInt(url.searchParams.get("limit") || "8");

      if (q.length < 2) {
        return new Response(
          JSON.stringify({ suggestions: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fuzzy search on titles using trigram similarity
      let query = supabase
        .from("search_documents")
        .select("id, title, content_type, url_slug, source_id, image_url")
        .eq("is_published", true)
        .ilike("title", `%${q}%`)
        .order("is_promoted", { ascending: false })
        .order("is_featured", { ascending: false })
        .limit(limitParam);

      if (type) {
        query = query.eq("content_type", type);
      }

      const { data: docs, error } = await query;

      if (error) {
        console.error("Suggest error:", error);
        throw error;
      }

      // Also get popular suggestions
      const { data: popularSuggestions } = await supabase
        .from("search_suggestions")
        .select("suggestion_text, suggestion_type, entity_type, entity_id")
        .eq("is_active", true)
        .ilike("suggestion_text", `${q}%`)
        .order("priority", { ascending: false })
        .order("search_count", { ascending: false })
        .limit(5);

      const suggestions = [
        ...(popularSuggestions || []).map((s: any) => ({
          text: s.suggestion_text,
          type: s.suggestion_type,
          entity_type: s.entity_type,
        })),
        ...(docs || []).map((d: any) => ({
          text: d.title,
          type: "entity",
          entity_type: d.content_type,
          url: buildUrl(d.content_type, d.url_slug, d.source_id),
          image_url: d.image_url,
        })),
      ].slice(0, limitParam);

      return new Response(
        JSON.stringify({ suggestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /search/feedback - Track clicks/conversions
    if (req.method === "POST" && path === "feedback") {
      const { query_log_id, document_id, result_position, feedback_type, session_id, user_id } =
        await req.json();

      const { error } = await supabase.from("search_feedback").insert({
        query_log_id,
        document_id,
        result_position,
        feedback_type,
        session_id,
        user_id,
      });

      if (error) {
        console.error("Feedback error:", error);
      }

      // Update click count on document
      if (feedback_type === "click" && document_id) {
        await supabase.rpc("increment_search_clicks", { doc_id: document_id });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildUrl(contentType: string, slug: string | null, sourceId: string): string {
  const slugOrId = slug || sourceId;
  switch (contentType) {
    case "village":
      return `/villages/${slugOrId}`;
    case "district":
      return `/districts/${slugOrId}`;
    case "provider":
      // Providers don't have a detail page - link to marketplace with filter
      return `/marketplace?provider=${slugOrId}`;
    case "listing":
      // Listings don't have individual pages - link to marketplace
      return `/marketplace`;
    case "package":
      return `/travel-packages/${slugOrId}`;
    case "product":
      return `/products/${slugOrId}`;
    case "story":
      // Stories use /culture/:slug for culture-type stories
      return `/culture/${slugOrId}`;
    case "event":
      return `/events/${slugOrId}`;
    case "thought":
      return `/thoughts/${slugOrId}`;
    default:
      return `/${contentType}/${slugOrId}`;
  }
}

async function logQuery(supabase: any, data: any) {
  try {
    await supabase.from("search_query_logs").insert(data);
  } catch (e) {
    console.error("Failed to log query:", e);
  }
}
