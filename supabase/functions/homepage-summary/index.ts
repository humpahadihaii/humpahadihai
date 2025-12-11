import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory cache with TTL
let cachedSummary: { total: number; today: number } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Return cached value if still valid
    if (cachedSummary && now - cacheTimestamp < CACHE_TTL) {
      return new Response(
        JSON.stringify({ ...cachedSummary, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from("homepage_visits")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      console.error("Total count error:", totalError);
    }

    // Get today's count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { count: today, error: todayError } = await supabase
      .from("homepage_visits")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    if (todayError) {
      console.error("Today count error:", todayError);
    }

    // Update cache
    cachedSummary = {
      total: total || 0,
      today: today || 0,
    };
    cacheTimestamp = now;

    return new Response(
      JSON.stringify({ ...cachedSummary, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ total: 0, today: 0, error: "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});