import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!lovableApiKey || !text || text.trim().length === 0) {
    return null;
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-004",
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) {
      console.error("Embedding error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (e) {
    console.error("Embedding failed:", e);
    return null;
  }
}

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { action, content_type, source_id, full_reindex } = body;

    // Full reindex all content
    if (action === "reindex" && full_reindex) {
      const results = await reindexAll(supabase);
      return new Response(
        JSON.stringify({ success: true, indexed: results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Index single item
    if (action === "index" && content_type && source_id) {
      const result = await indexSingleItem(supabase, content_type, source_id);
      return new Response(
        JSON.stringify({ success: true, document: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete from index
    if (action === "delete" && content_type && source_id) {
      await supabase
        .from("search_documents")
        .delete()
        .eq("content_type", content_type)
        .eq("source_id", source_id);

      return new Response(
        JSON.stringify({ success: true, deleted: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Index error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function reindexAll(supabase: any) {
  const results: Record<string, number> = {};

  // Index villages
  const { data: villages } = await supabase
    .from("villages")
    .select("*, districts(name)")
    .eq("status", "published");

  if (villages) {
    for (const v of villages) {
      await indexDocument(supabase, {
        content_type: "village",
        source_id: v.id,
        title: v.name,
        subtitle: v.tehsil,
        excerpt: v.introduction?.slice(0, 300),
        body_text: stripHtml([v.introduction, v.history, v.traditions, v.festivals, v.foods].filter(Boolean).join(" ")),
        district_id: v.district_id,
        district_name: v.districts?.name,
        lat: v.lat,
        lng: v.lng,
        url_slug: v.slug,
        image_url: v.thumbnail_url,
        is_published: true,
        source_created_at: v.created_at,
        source_updated_at: v.updated_at,
      });
    }
    results.villages = villages.length;
  }

  // Index districts
  const { data: districts } = await supabase
    .from("districts")
    .select("*")
    .eq("status", "published");

  if (districts) {
    for (const d of districts) {
      await indexDocument(supabase, {
        content_type: "district",
        source_id: d.id,
        title: d.name,
        subtitle: d.region,
        excerpt: d.overview?.slice(0, 300),
        body_text: stripHtml([d.overview, d.highlights, d.famous_specialties, d.cultural_identity].filter(Boolean).join(" ")),
        lat: d.latitude,
        lng: d.longitude,
        url_slug: d.slug,
        image_url: d.image_url || d.banner_image,
        is_published: true,
        source_created_at: d.created_at,
        source_updated_at: d.updated_at,
      });
    }
    results.districts = districts.length;
  }

  // Index tourism providers
  const { data: providers } = await supabase
    .from("tourism_providers")
    .select("*, districts(name), villages(name)")
    .eq("is_active", true);

  if (providers) {
    for (const p of providers) {
      await indexDocument(supabase, {
        content_type: "provider",
        source_id: p.id,
        title: p.name,
        subtitle: p.type,
        excerpt: p.description?.slice(0, 300),
        body_text: stripHtml(p.description),
        district_id: p.district_id,
        district_name: p.districts?.name,
        village_id: p.village_id,
        village_name: p.villages?.name,
        category: p.type,
        lat: p.lat,
        lng: p.lng,
        rating: p.rating,
        image_url: p.image_url,
        is_promoted: p.map_featured,
        is_published: true,
        source_created_at: p.created_at,
        source_updated_at: p.updated_at,
      });
    }
    results.providers = providers.length;
  }

  // Index tourism listings
  const { data: listings } = await supabase
    .from("tourism_listings")
    .select("*, districts(name), tourism_providers(name)")
    .eq("is_active", true);

  if (listings) {
    for (const l of listings) {
      await indexDocument(supabase, {
        content_type: "listing",
        source_id: l.id,
        title: l.title,
        subtitle: l.tourism_providers?.name,
        excerpt: l.short_description,
        body_text: stripHtml([l.short_description, l.full_description].filter(Boolean).join(" ")),
        district_id: l.district_id,
        district_name: l.districts?.name,
        category: l.category,
        price_min: l.price_per_night || l.price_per_person,
        lat: l.lat,
        lng: l.lng,
        rating: l.rating,
        url_slug: l.slug,
        image_url: l.thumbnail_image_url,
        is_promoted: l.is_featured || l.map_featured,
        is_featured: l.is_featured,
        is_published: true,
        source_created_at: l.created_at,
        source_updated_at: l.updated_at,
      });
    }
    results.listings = listings.length;
  }

  // Index travel packages
  const { data: packages } = await supabase
    .from("travel_packages")
    .select("*")
    .eq("is_active", true);

  if (packages) {
    for (const p of packages) {
      await indexDocument(supabase, {
        content_type: "package",
        source_id: p.id,
        title: p.title,
        subtitle: `${p.duration_days} days - ${p.destination}`,
        excerpt: p.short_description,
        body_text: stripHtml([p.short_description, p.full_description, p.itinerary].filter(Boolean).join(" ")),
        category: p.region,
        price_min: p.price_per_person,
        lat: p.start_lat,
        lng: p.start_lng,
        url_slug: p.slug,
        image_url: p.thumbnail_image_url,
        is_promoted: p.is_featured || p.map_featured,
        is_featured: p.is_featured,
        is_published: true,
        source_created_at: p.created_at,
        source_updated_at: p.updated_at,
      });
    }
    results.packages = packages.length;
  }

  // Index local products
  const { data: products } = await supabase
    .from("local_products")
    .select("*, local_product_categories(name), villages(name)")
    .eq("is_active", true);

  if (products) {
    for (const p of products) {
      await indexDocument(supabase, {
        content_type: "product",
        source_id: p.id,
        title: p.name,
        subtitle: p.local_product_categories?.name,
        excerpt: p.short_description,
        body_text: stripHtml([p.short_description, p.full_description].filter(Boolean).join(" ")),
        village_id: p.village_id,
        village_name: p.villages?.name,
        category: p.local_product_categories?.name,
        tags: p.tags,
        price_min: p.price,
        lat: p.lat,
        lng: p.lng,
        url_slug: p.slug,
        image_url: p.thumbnail_image_url,
        is_promoted: p.is_featured,
        is_featured: p.is_featured,
        is_published: true,
        source_created_at: p.created_at,
        source_updated_at: p.updated_at,
      });
    }
    results.products = products.length;
  }

  // Index events
  const { data: events } = await supabase
    .from("cms_events")
    .select("*")
    .eq("status", "published");

  if (events) {
    for (const e of events) {
      await indexDocument(supabase, {
        content_type: "event",
        source_id: e.id,
        title: e.title,
        subtitle: e.location,
        excerpt: e.description?.slice(0, 300),
        body_text: stripHtml(e.description),
        lat: e.lat,
        lng: e.lng,
        url_slug: e.slug,
        image_url: e.banner_image_url,
        is_promoted: e.is_featured,
        is_featured: e.is_featured,
        is_published: true,
        source_created_at: e.created_at,
        source_updated_at: e.updated_at,
      });
    }
    results.events = events.length;
  }

  // Index stories
  const { data: stories } = await supabase
    .from("cms_stories")
    .select("*")
    .eq("status", "published");

  if (stories) {
    for (const s of stories) {
      await indexDocument(supabase, {
        content_type: "story",
        source_id: s.id,
        title: s.title,
        subtitle: s.author_name,
        excerpt: s.excerpt,
        body_text: stripHtml(s.body),
        category: s.category,
        url_slug: s.slug,
        image_url: s.cover_image_url,
        is_published: true,
        source_created_at: s.created_at,
        source_updated_at: s.updated_at,
      });
    }
    results.stories = stories.length;
  }

  // Index thoughts
  const { data: thoughts } = await supabase
    .from("thoughts")
    .select("*")
    .eq("status", "published");

  if (thoughts) {
    for (const t of thoughts) {
      await indexDocument(supabase, {
        content_type: "thought",
        source_id: t.id,
        title: t.title,
        subtitle: t.author_name,
        excerpt: t.content?.slice(0, 300),
        body_text: stripHtml(t.content),
        category: t.category,
        url_slug: t.slug,
        image_url: t.image_url,
        is_published: true,
        source_created_at: t.created_at,
        source_updated_at: t.updated_at,
      });
    }
    results.thoughts = thoughts.length;
  }

  // Update suggestions from indexed content
  await updateSuggestions(supabase);

  return results;
}

async function indexSingleItem(supabase: any, contentType: string, sourceId: string) {
  // Fetch the item based on type and index it
  // This is a simplified version - in production, would have type-specific fetching
  const tableMap: Record<string, string> = {
    village: "villages",
    district: "districts",
    provider: "tourism_providers",
    listing: "tourism_listings",
    package: "travel_packages",
    product: "local_products",
    event: "cms_events",
    story: "cms_stories",
    thought: "thoughts",
  };

  const table = tableMap[contentType];
  if (!table) throw new Error(`Unknown content type: ${contentType}`);

  const { data } = await supabase.from(table).select("*").eq("id", sourceId).single();
  if (!data) throw new Error("Item not found");

  // Create minimal document
  const doc = {
    content_type: contentType,
    source_id: sourceId,
    title: data.name || data.title,
    excerpt: data.description || data.short_description || data.introduction,
    body_text: stripHtml(data.description || data.body || data.content || data.full_description),
    url_slug: data.slug,
    image_url: data.image_url || data.thumbnail_image_url || data.cover_image_url,
    is_published: true,
    source_created_at: data.created_at,
    source_updated_at: data.updated_at,
  };

  return await indexDocument(supabase, doc);
}

async function indexDocument(supabase: any, doc: any) {
  // Generate embedding from title + excerpt
  const textForEmbedding = [doc.title, doc.subtitle, doc.excerpt].filter(Boolean).join(" ");
  const embedding = await generateEmbedding(textForEmbedding);

  const document = {
    ...doc,
    embedding,
  };

  const { data, error } = await supabase
    .from("search_documents")
    .upsert(document, { onConflict: "content_type,source_id" })
    .select()
    .single();

  if (error) {
    console.error("Failed to index document:", error);
    throw error;
  }

  return data;
}

async function updateSuggestions(supabase: any) {
  // Get top items by type for suggestions
  const { data: docs } = await supabase
    .from("search_documents")
    .select("title, content_type, source_id")
    .eq("is_published", true)
    .order("is_promoted", { ascending: false })
    .order("is_featured", { ascending: false })
    .limit(500);

  if (!docs) return;

  // Upsert suggestions
  const suggestions = docs.map((d: any, i: number) => ({
    suggestion_text: d.title,
    suggestion_type: "entity",
    entity_type: d.content_type,
    entity_id: d.source_id,
    priority: 500 - i,
    is_active: true,
  }));

  // Clear old suggestions and insert new
  await supabase
    .from("search_suggestions")
    .delete()
    .eq("suggestion_type", "entity");

  if (suggestions.length > 0) {
    await supabase.from("search_suggestions").insert(suggestions);
  }
}
