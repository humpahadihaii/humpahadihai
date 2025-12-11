import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface POIFilters {
  bbox?: string; // "minLng,minLat,maxLng,maxLat"
  types?: string; // comma-separated: "village,provider,listing,package,place,event"
  categories?: string; // comma-separated categories within types
  district?: string; // district ID
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  limit?: number;
  offset?: number;
  cluster?: boolean;
  zoom?: number;
}

interface ClusterResult {
  lat: number;
  lng: number;
  count: number;
  types: Record<string, number>;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse filters from query params
    const filters: POIFilters = {
      bbox: url.searchParams.get("bbox") || undefined,
      types: url.searchParams.get("types") || "village,provider,listing,package,place,event",
      categories: url.searchParams.get("categories") || undefined,
      district: url.searchParams.get("district") || undefined,
      featured: url.searchParams.get("featured") === "true",
      minPrice: url.searchParams.get("minPrice") ? parseFloat(url.searchParams.get("minPrice")!) : undefined,
      maxPrice: url.searchParams.get("maxPrice") ? parseFloat(url.searchParams.get("maxPrice")!) : undefined,
      minRating: url.searchParams.get("minRating") ? parseFloat(url.searchParams.get("minRating")!) : undefined,
      search: url.searchParams.get("search") || undefined,
      limit: Math.min(parseInt(url.searchParams.get("limit") || "200"), 500),
      offset: parseInt(url.searchParams.get("offset") || "0"),
      cluster: url.searchParams.get("cluster") === "true",
      zoom: url.searchParams.get("zoom") ? parseInt(url.searchParams.get("zoom")!) : undefined,
    };

    if (action === "pois" || action === "map-pois") {
      // Build query
      let query = supabase
        .from("map_poi_cache")
        .select("*")
        .eq("is_active", true);

      // Filter by types
      if (filters.types) {
        const types = filters.types.split(",").map(t => t.trim());
        query = query.in("entity_type", types);
      }

      // Filter by bounding box
      if (filters.bbox) {
        const [minLng, minLat, maxLng, maxLat] = filters.bbox.split(",").map(parseFloat);
        query = query
          .gte("lat", minLat)
          .lte("lat", maxLat)
          .gte("lng", minLng)
          .lte("lng", maxLng);
      }

      // Filter by district
      if (filters.district) {
        query = query.eq("district_id", filters.district);
      }

      // Filter by featured
      if (filters.featured) {
        query = query.eq("is_featured", true);
      }

      // Filter by categories
      if (filters.categories) {
        const categories = filters.categories.split(",").map(c => c.trim());
        query = query.in("category", categories);
      }

      // Filter by price range
      if (filters.minPrice !== undefined) {
        query = query.gte("price_min", filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte("price_min", filters.maxPrice);
      }

      // Filter by rating
      if (filters.minRating !== undefined) {
        query = query.gte("rating", filters.minRating);
      }

      // Search filter
      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      // Order by featured first, then by title
      const offset = filters.offset ?? 0;
      const limit = filters.limit ?? 200;
      query = query
        .order("is_featured", { ascending: false })
        .order("title", { ascending: true })
        .range(offset, offset + limit - 1);

      const { data: pois, error } = await query;

      if (error) throw error;

      // If clustering requested and zoom level is low
      if (filters.cluster && filters.zoom !== undefined && filters.zoom < 10) {
        const clusters = clusterPOIs(pois || [], filters.zoom);
        return new Response(
          JSON.stringify({
            type: "FeatureCollection",
            features: clusters.map(c => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [c.lng, c.lat] },
              properties: {
                cluster: true,
                point_count: c.count,
                types: c.types,
                bounds: c.bounds,
              },
            })),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Convert to GeoJSON
      const geojson = {
        type: "FeatureCollection",
        features: (pois || []).map(poi => ({
          type: "Feature",
          id: poi.entity_id,
          geometry: {
            type: "Point",
            coordinates: [poi.lng, poi.lat],
          },
          properties: {
            id: poi.entity_id,
            type: poi.entity_type,
            title: poi.title,
            slug: poi.slug,
            excerpt: poi.excerpt,
            image: poi.image_url,
            category: poi.category,
            district: poi.district_name,
            village: poi.village_name,
            price: poi.price_min,
            rating: poi.rating,
            featured: poi.is_featured,
            tags: poi.tags,
            ...poi.properties,
          },
        })),
        metadata: {
          total: pois?.length || 0,
          offset: filters.offset,
          limit: filters.limit,
        },
      };

      return new Response(JSON.stringify(geojson), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      });
    }

    if (action === "highlights") {
      const { data: highlights, error } = await supabase
        .from("map_highlights")
        .select("*")
        .eq("is_active", true)
        .eq("status", "published")
        .order("priority", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(highlights), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=600" },
      });
    }

    if (action === "search") {
      const q = url.searchParams.get("q") || "";
      const type = url.searchParams.get("type");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

      if (!q || q.length < 2) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let query = supabase
        .from("map_poi_cache")
        .select("entity_id, entity_type, title, slug, excerpt, lat, lng, district_name, category, image_url")
        .eq("is_active", true)
        .ilike("title", `%${q}%`)
        .limit(limit);

      if (type) {
        query = query.eq("entity_type", type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "districts") {
      const { data: districts, error } = await supabase
        .from("districts")
        .select("id, name, slug, latitude, longitude, overview, image_url")
        .eq("status", "published")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("name");

      if (error) throw error;

      const geojson = {
        type: "FeatureCollection",
        features: (districts || []).map(d => ({
          type: "Feature",
          id: d.id,
          geometry: {
            type: "Point",
            coordinates: [d.longitude, d.latitude],
          },
          properties: {
            id: d.id,
            type: "district",
            title: d.name,
            slug: d.slug,
            excerpt: d.overview,
            image: d.image_url,
          },
        })),
      };

      return new Response(JSON.stringify(geojson), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
      });
    }

    if (action === "refresh-cache") {
      // Admin only - refresh POI cache
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const { error } = await supabase.rpc("refresh_map_poi_cache");

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: "POI cache refreshed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Map POIs error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

function clusterPOIs(pois: any[], zoom: number): ClusterResult[] {
  // Simple grid-based clustering
  const gridSize = Math.pow(2, 8 - Math.min(zoom, 8)); // Larger grid at lower zoom
  const clusters: Map<string, ClusterResult> = new Map();

  for (const poi of pois) {
    const gridX = Math.floor(poi.lng / gridSize);
    const gridY = Math.floor(poi.lat / gridSize);
    const key = `${gridX},${gridY}`;

    if (!clusters.has(key)) {
      clusters.set(key, {
        lat: poi.lat,
        lng: poi.lng,
        count: 0,
        types: {},
        bounds: { minLat: poi.lat, maxLat: poi.lat, minLng: poi.lng, maxLng: poi.lng },
      });
    }

    const cluster = clusters.get(key)!;
    cluster.count++;
    cluster.types[poi.entity_type] = (cluster.types[poi.entity_type] || 0) + 1;
    
    // Update centroid (simple average)
    cluster.lat = (cluster.lat * (cluster.count - 1) + poi.lat) / cluster.count;
    cluster.lng = (cluster.lng * (cluster.count - 1) + poi.lng) / cluster.count;
    
    // Update bounds
    cluster.bounds.minLat = Math.min(cluster.bounds.minLat, poi.lat);
    cluster.bounds.maxLat = Math.max(cluster.bounds.maxLat, poi.lat);
    cluster.bounds.minLng = Math.min(cluster.bounds.minLng, poi.lng);
    cluster.bounds.maxLng = Math.max(cluster.bounds.maxLng, poi.lng);
  }

  return Array.from(clusters.values());
}
