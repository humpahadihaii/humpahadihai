import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for IP anonymization
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'hum-pahadi-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

// Parse user agent for device and browser
function parseUserAgent(ua: string): { device: string; browser: string } {
  const uaLower = ua.toLowerCase();
  
  // Detect device
  let device = 'desktop';
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(uaLower)) {
    device = /ipad|tablet/i.test(uaLower) ? 'tablet' : 'mobile';
  }
  
  // Detect browser
  let browser = 'other';
  if (uaLower.includes('edg/')) browser = 'edge';
  else if (uaLower.includes('chrome')) browser = 'chrome';
  else if (uaLower.includes('firefox')) browser = 'firefox';
  else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'safari';
  else if (uaLower.includes('opera') || uaLower.includes('opr/')) browser = 'opera';
  
  return { device, browser };
}

// Categorize referrer
function categorizeReferrer(referrer: string | null): string {
  if (!referrer) return 'direct';
  const ref = referrer.toLowerCase();
  if (ref.includes('instagram')) return 'instagram';
  if (ref.includes('facebook') || ref.includes('fb.')) return 'facebook';
  if (ref.includes('youtube')) return 'youtube';
  if (ref.includes('twitter') || ref.includes('x.com')) return 'twitter';
  if (ref.includes('google')) return 'google';
  if (ref.includes('bing')) return 'bing';
  if (ref.includes('linkedin')) return 'linkedin';
  return 'other';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { url, referrer, userAgent, eventName, metadata } = body;

    // Get client IP from headers (anonymize it)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const ipHash = await hashIP(clientIP);

    // Parse user agent
    const { device, browser } = parseUserAgent(userAgent || '');

    // If this is an event tracking request
    if (eventName) {
      const { error: eventError } = await supabase
        .from('internal_events')
        .insert({
          event_name: eventName,
          metadata: metadata || {}
        });

      if (eventError) {
        console.error('Error inserting event:', eventError);
      }

      return new Response(
        JSON.stringify({ success: true, type: 'event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract section from URL path
    const urlPath = url ? new URL(url, 'https://example.com').pathname : '/';
    let section = 'home';
    if (urlPath.startsWith('/districts')) section = 'districts';
    else if (urlPath.startsWith('/travel')) section = 'travel';
    else if (urlPath.startsWith('/marketplace')) section = 'marketplace';
    else if (urlPath.startsWith('/products') || urlPath.startsWith('/shop')) section = 'shop';
    else if (urlPath.startsWith('/culture')) section = 'culture';
    else if (urlPath.startsWith('/food')) section = 'food';
    else if (urlPath.startsWith('/gallery')) section = 'gallery';
    else if (urlPath.startsWith('/thoughts')) section = 'thoughts';
    else if (urlPath.startsWith('/about')) section = 'about';
    else if (urlPath.startsWith('/contact')) section = 'contact';
    else if (urlPath.startsWith('/stories')) section = 'stories';
    else if (urlPath.startsWith('/promotions')) section = 'promotions';
    else if (urlPath !== '/') section = 'other';

    // Record site visit with full details
    const { error: visitError } = await supabase
      .from('site_visits')
      .insert({
        url: url || '/',
        referrer: categorizeReferrer(referrer),
        raw_referrer: referrer || null,
        device,
        browser,
        ip_hash: ipHash,
        section
      });

    if (visitError) {
      console.error('Error inserting site visit:', visitError);
    }

    // Update page view count using upsert
    const pagePath = url ? new URL(url, 'https://example.com').pathname : '/';
    
    // Try to update existing record first
    const { data: existing } = await supabase
      .from('page_views')
      .select('id, count')
      .eq('page', pagePath)
      .single();

    if (existing) {
      await supabase
        .from('page_views')
        .update({ 
          count: existing.count + 1, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('page_views')
        .insert({ page: pagePath, count: 1 });
    }

    return new Response(
      JSON.stringify({ success: true, type: 'pageview' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Track function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
