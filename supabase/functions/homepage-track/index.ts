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

function generateVisitorKey(): string {
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

    // Soft check referer (allow if not set or includes our domain)
    if (referer && !referer.includes("humpahadihaii") && !referer.includes("localhost") && !referer.includes("lovable")) {
      // Still allow but log suspicious
      console.log("Suspicious referer:", referer);
    }

    const body = await req.json().catch(() => ({}));
    let visitorKey = body.visitorKey;
    
    // Generate visitor key if not provided
    if (!visitorKey) {
      visitorKey = generateVisitorKey();
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already visited today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: existingVisit } = await supabase
      .from("homepage_visits")
      .select("id")
      .eq("visitor_key", visitorKey)
      .gte("created_at", todayStart.toISOString())
      .limit(1)
      .single();

    let counted = false;
    
    if (!existingVisit) {
      // Insert new visit
      const { error } = await supabase
        .from("homepage_visits")
        .insert({
          visitor_key: visitorKey,
          ip: ip,
          ua: ua.substring(0, 500), // Limit UA length
        });

      if (error) {
        console.error("Insert error:", error);
      } else {
        counted = true;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, visitorKey, counted }),
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