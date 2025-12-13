import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common bot user agents to filter
const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
  /python/i, /java/i, /php/i, /perl/i, /ruby/i,
  /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
  /googlebot/i, /bingbot/i, /yandex/i, /baidu/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
];

// Simple in-memory rate limiting (per IP, 1 request per 5 seconds)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds

function isBot(ua: string): boolean {
  if (!ua) return true;
  return BOT_PATTERNS.some(pattern => pattern.test(ua));
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);
  
  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return true;
  }
  
  rateLimitMap.set(ip, now);
  
  // Clean old entries periodically
  if (rateLimitMap.size > 10000) {
    const cutoff = now - RATE_LIMIT_WINDOW * 2;
    for (const [key, time] of rateLimitMap.entries()) {
      if (time < cutoff) rateLimitMap.delete(key);
    }
  }
  
  return false;
}

// Hash IP for privacy (SHA-256)
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "_hp_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

function generateVisitorId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("cf-connecting-ip") || 
               "unknown";
    const ua = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    // Check for bots
    if (isBot(ua)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Bot detected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Rate limiting
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Rate limited" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Soft check referer
    if (referer && !referer.includes("humpahadihaii") && !referer.includes("localhost") && !referer.includes("lovable")) {
      console.log("Suspicious referer:", referer);
    }

    const body = await req.json().catch(() => ({}));
    
    // Get identifiers from client
    let visitorId = body.visitorId;
    const sessionId = body.sessionId || null;
    const deviceId = body.deviceId || null;
    const screenResolution = body.screenResolution || null;
    const timezone = body.timezone || null;
    const language = body.language || null;
    
    // Generate visitor ID if not provided
    if (!visitorId) {
      visitorId = generateVisitorId();
    }

    // Hash the IP for privacy
    const ipHash = await hashIP(ip);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's date boundary
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // PRIMARY DEDUPLICATION: Check by IP hash first (most reliable)
    // This catches same visitor even if cookies are cleared
    const { data: existingByIP } = await supabase
      .from("homepage_visits")
      .select("id")
      .eq("ip", ipHash)
      .gte("created_at", todayStart.toISOString())
      .limit(1)
      .single();

    // If already visited from this IP today, don't count again
    if (existingByIP) {
      console.log("Already visited today (IP match):", ipHash.substring(0, 8));
      return new Response(
        JSON.stringify({ ok: true, visitorId, counted: false, reason: "already_visited_today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECONDARY CHECK: By visitor_id cookie (for cases where IP might change but cookie persists)
    const { data: existingByVisitor } = await supabase
      .from("homepage_visits")
      .select("id")
      .eq("visitor_key", visitorId)
      .gte("created_at", todayStart.toISOString())
      .limit(1)
      .single();

    if (existingByVisitor) {
      console.log("Already visited today (cookie match):", visitorId.substring(0, 10));
      return new Response(
        JSON.stringify({ ok: true, visitorId, counted: false, reason: "already_visited_today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TERTIARY CHECK: By device fingerprint (for same device, different browser/incognito)
    if (deviceId) {
      const { data: existingByDevice } = await supabase
        .from("homepage_visits")
        .select("id")
        .eq("device_id", deviceId)
        .gte("created_at", todayStart.toISOString())
        .limit(1)
        .single();

      if (existingByDevice) {
        console.log("Already visited today (device match):", deviceId.substring(0, 10));
        return new Response(
          JSON.stringify({ ok: true, visitorId, counted: false, reason: "already_visited_today" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // New unique visitor today - insert record
    const { error } = await supabase
      .from("homepage_visits")
      .insert({
        visitor_key: visitorId,
        ip: ipHash,
        ua: ua.substring(0, 500),
        session_id: sessionId,
        device_id: deviceId,
        screen_resolution: screenResolution,
        timezone: timezone,
        language: language,
      });

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ ok: false, error: "Database error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("New visitor counted:", ipHash.substring(0, 8), visitorId.substring(0, 10));
    
    return new Response(
      JSON.stringify({ ok: true, visitorId, counted: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
