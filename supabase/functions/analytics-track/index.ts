import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SHA-256 hash function for IP anonymization
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(0, 16));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Parse user agent for device and browser info
function parseUserAgent(ua: string): { device: string; browser: string } {
  let device = 'desktop';
  let browser = 'unknown';

  if (/mobile/i.test(ua)) device = 'mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'tablet';

  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = 'chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
  else if (/firefox/i.test(ua)) browser = 'firefox';
  else if (/edge|edg/i.test(ua)) browser = 'edge';
  else if (/opera|opr/i.test(ua)) browser = 'opera';

  return { device, browser };
}

// Parse UTM parameters from referrer or page path
function parseUTM(url: string): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  try {
    const urlObj = new URL(url, 'https://example.com');
    return {
      utm_source: urlObj.searchParams.get('utm_source') || undefined,
      utm_medium: urlObj.searchParams.get('utm_medium') || undefined,
      utm_campaign: urlObj.searchParams.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

// Categorize referrer source
function categorizeReferrer(referrer: string): string {
  if (!referrer) return 'direct';
  const r = referrer.toLowerCase();
  if (r.includes('google')) return 'google';
  if (r.includes('facebook') || r.includes('fb.')) return 'facebook';
  if (r.includes('instagram')) return 'instagram';
  if (r.includes('twitter') || r.includes('t.co')) return 'twitter';
  if (r.includes('youtube')) return 'youtube';
  if (r.includes('linkedin')) return 'linkedin';
  if (r.includes('whatsapp')) return 'whatsapp';
  return 'referral';
}

interface AnalyticsEvent {
  event_type: string;
  page_path: string;
  page_title?: string;
  element_id?: string;
  element_class?: string;
  click_x?: number;
  click_y?: number;
  viewport_width?: number;
  viewport_height?: number;
  scroll_depth?: number;
  referrer?: string;
  session_id?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const ipHash = await hashIP(clientIP);

    // Get user agent
    const userAgent = req.headers.get('user-agent') || '';
    const { device, browser } = parseUserAgent(userAgent);

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // GET /analytics-track/summary - Get analytics summary
    if (req.method === 'GET' && action === 'summary') {
      const startDate = url.searchParams.get('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = url.searchParams.get('end') || new Date().toISOString().split('T')[0];
      const pageSlug = url.searchParams.get('page_slug');

      // Get unique visitors
      let uniqueQuery = supabase
        .from('page_unique_visits')
        .select('id', { count: 'exact' })
        .gte('visit_date', startDate)
        .lte('visit_date', endDate);
      
      if (pageSlug) {
        uniqueQuery = uniqueQuery.eq('page_slug', pageSlug);
      }
      
      const { count: uniqueTotal } = await uniqueQuery;

      // Get today's unique visitors
      const today = new Date().toISOString().split('T')[0];
      let todayQuery = supabase
        .from('page_unique_visits')
        .select('id', { count: 'exact' })
        .eq('visit_date', today);
      
      if (pageSlug) {
        todayQuery = todayQuery.eq('page_slug', pageSlug);
      }
      
      const { count: uniqueToday } = await todayQuery;

      // Get total sessions
      let sessionsQuery = supabase
        .from('analytics_sessions')
        .select('id', { count: 'exact' })
        .gte('started_at', `${startDate}T00:00:00`)
        .lte('started_at', `${endDate}T23:59:59`);
      
      const { count: sessions } = await sessionsQuery;

      // Get total page views
      let pageViewsQuery = supabase
        .from('analytics_events')
        .select('id', { count: 'exact' })
        .eq('event_type', 'page_view')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
      
      if (pageSlug) {
        pageViewsQuery = pageViewsQuery.eq('page_path', pageSlug);
      }
      
      const { count: pageViews } = await pageViewsQuery;

      // Get conversions (bookings, inquiries)
      const { count: conversions } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact' })
        .in('event_type', ['booking', 'inquiry', 'purchase'])
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

      // Get device breakdown
      const { data: deviceData } = await supabase
        .from('page_unique_visits')
        .select('device')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate);

      const deviceBreakdown = (deviceData || []).reduce((acc: Record<string, number>, row) => {
        const d = row.device || 'unknown';
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {});

      // Get top pages
      const { data: topPagesData } = await supabase
        .from('page_unique_visits')
        .select('page_slug')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate);

      const pageCounts = (topPagesData || []).reduce((acc: Record<string, number>, row) => {
        acc[row.page_slug] = (acc[row.page_slug] || 0) + 1;
        return acc;
      }, {});

      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, count]) => ({ page, unique_visitors: count }));

      // Get referrer breakdown
      const { data: referrerData } = await supabase
        .from('page_unique_visits')
        .select('referrer')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate);

      const referrerCounts = (referrerData || []).reduce((acc: Record<string, number>, row) => {
        const r = row.referrer || 'direct';
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, {});

      const topReferrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([referrer, count]) => ({ referrer, count }));

      return new Response(JSON.stringify({
        unique_total: uniqueTotal || 0,
        unique_today: uniqueToday || 0,
        sessions: sessions || 0,
        page_views: pageViews || 0,
        conversions: conversions || 0,
        device_breakdown: deviceBreakdown,
        top_pages: topPages,
        top_referrers: topReferrers,
        date_range: { start: startDate, end: endDate }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /analytics-track/heatmap - Get heatmap data
    if (req.method === 'GET' && action === 'heatmap') {
      const pageSlug = url.searchParams.get('page_slug');
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

      if (!pageSlug) {
        return new Response(JSON.stringify({ error: 'page_slug required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('analytics_heatmap_aggregates')
        .select('bucket_x, bucket_y, click_count, element_id, viewport_width')
        .eq('page_slug', pageSlug)
        .eq('aggregate_date', date);

      if (error) throw error;

      return new Response(JSON.stringify({ buckets: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /analytics-track - Track events
    if (req.method === 'POST') {
      const body = await req.json();
      const events: AnalyticsEvent[] = Array.isArray(body.events) ? body.events : [body];

      if (events.length === 0) {
        return new Response(JSON.stringify({ error: 'No events provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate and limit batch size
      if (events.length > 100) {
        return new Response(JSON.stringify({ error: 'Max 100 events per batch' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sessionId = events[0].session_id || crypto.randomUUID();
      const referrer = events[0].referrer || '';
      const referrerCategory = categorizeReferrer(referrer);
      const utmParams = parseUTM(events[0].page_path || '');

      // Upsert session
      const { error: sessionError } = await supabase
        .from('analytics_sessions')
        .upsert({
          session_id: sessionId,
          ip_hash: ipHash,
          user_agent: userAgent,
          device,
          browser,
          referrer: referrerCategory,
          last_activity_at: new Date().toISOString(),
          page_count: events.filter(e => e.event_type === 'page_view').length,
        }, { onConflict: 'session_id' });

      if (sessionError) {
        console.error('Session upsert error:', sessionError);
      }

      // Insert events
      const eventRecords = events.map(event => ({
        session_id: sessionId,
        ip_hash: ipHash,
        event_type: event.event_type || 'page_view',
        page_path: event.page_path || '/',
        page_title: event.page_title,
        element_id: event.element_id,
        element_class: event.element_class,
        click_x: event.click_x,
        click_y: event.click_y,
        viewport_width: event.viewport_width,
        viewport_height: event.viewport_height,
        scroll_depth: event.scroll_depth,
        referrer: referrerCategory,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        user_agent: userAgent,
        device,
        browser,
        metadata: event.metadata || {},
      }));

      const { error: eventsError } = await supabase
        .from('analytics_events')
        .insert(eventRecords);

      if (eventsError) {
        console.error('Events insert error:', eventsError);
      }

      // Track unique visits per page per day
      const pageViews = events.filter(e => e.event_type === 'page_view');
      const today = new Date().toISOString().split('T')[0];

      for (const pv of pageViews) {
        const { error: uniqueError } = await supabase
          .from('page_unique_visits')
          .upsert({
            ip_hash: ipHash,
            page_slug: pv.page_path || '/',
            visit_date: today,
            session_id: sessionId,
            device,
            browser,
            referrer: referrerCategory,
          }, { onConflict: 'ip_hash,page_slug,visit_date', ignoreDuplicates: true });

        if (uniqueError && !uniqueError.message?.includes('duplicate')) {
          console.error('Unique visit error:', uniqueError);
        }
      }

      // Aggregate heatmap clicks (with sampling)
      const { data: settings } = await supabase
        .from('analytics_settings')
        .select('heatmap_sampling_rate, enable_heatmaps')
        .single();

      const samplingRate = settings?.heatmap_sampling_rate || 0.1;
      const heatmapsEnabled = settings?.enable_heatmaps !== false;

      if (heatmapsEnabled) {
        const clickEvents = events.filter(e => 
          e.event_type === 'click' && 
          e.click_x !== undefined && 
          e.click_y !== undefined &&
          Math.random() < samplingRate
        );

        for (const click of clickEvents) {
          // Bucket clicks into 50x50 pixel grid
          const bucketX = Math.floor((click.click_x || 0) / 50) * 50;
          const bucketY = Math.floor((click.click_y || 0) / 50) * 50;
          const viewportWidth = click.viewport_width || 1920;

          // Upsert heatmap aggregate
          const { data: existing } = await supabase
            .from('analytics_heatmap_aggregates')
            .select('id, click_count')
            .eq('page_slug', click.page_path || '/')
            .eq('aggregate_date', today)
            .eq('bucket_x', bucketX)
            .eq('bucket_y', bucketY)
            .eq('viewport_width', viewportWidth)
            .single();

          if (existing) {
            await supabase
              .from('analytics_heatmap_aggregates')
              .update({ click_count: (existing.click_count || 0) + 1, updated_at: new Date().toISOString() })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('analytics_heatmap_aggregates')
              .insert({
                page_slug: click.page_path || '/',
                aggregate_date: today,
                bucket_x: bucketX,
                bucket_y: bucketY,
                click_count: 1,
                element_id: click.element_id,
                viewport_width: viewportWidth,
              });
          }
        }
      }

      console.log(`Tracked ${events.length} events for session ${sessionId}`);

      return new Response(JSON.stringify({ 
        success: true, 
        session_id: sessionId,
        events_tracked: events.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics track error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});