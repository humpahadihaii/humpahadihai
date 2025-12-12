import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareSettings {
  defaults: {
    title_suffix: string;
    default_description: string;
    default_image_url: string | null;
    site_name: string;
    twitter_site: string;
    locale: string;
  };
  templates: Record<string, {
    enabled: boolean;
    title_template: string;
    description_template: string;
    image_url?: string | null;
    card_type?: string;
    hashtags?: string[];
    subject_template?: string;
    body_template?: string;
  }>;
}

// Template token substitution
function substituteTokens(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+\.?\w*)\}\}/g, (_, key) => {
    const keys = key.split('.');
    let value: any = data;
    for (const k of keys) {
      value = value?.[k];
    }
    return String(value ?? '');
  });
}

// Generate share URL with referral tracking
function generateShareUrl(baseUrl: string, platform: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('ref', platform);
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  return url.toString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  try {
    // GET /share-settings - Get all settings
    if (req.method === 'GET' && pathParts.length === 1) {
      const { data: settings, error } = await supabase
        .from('site_share_settings')
        .select('*');
      
      if (error) throw error;
      
      const result: Record<string, any> = {};
      settings?.forEach(s => {
        result[s.key] = s.value;
      });
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT /share-settings - Update settings (requires auth)
    if (req.method === 'PUT' && pathParts.length === 1) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify user is super_admin
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Only super admin can update global settings' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      const { key, value } = body;

      // Get current value for audit
      const { data: currentSetting } = await supabase
        .from('site_share_settings')
        .select('value')
        .eq('key', key)
        .single();

      // Update setting
      const { error: updateError } = await supabase
        .from('site_share_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, { onConflict: 'key' });

      if (updateError) throw updateError;

      // Create audit entry
      await supabase.from('share_template_audit').insert({
        changed_by: user.id,
        entity_type: 'global_settings',
        entity_id: null,
        change_type: currentSetting ? 'update' : 'create',
        before_value: currentSetting?.value,
        after_value: value
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /share-settings/entity/:type/:id - Get entity share settings
    if (req.method === 'GET' && pathParts[1] === 'entity' && pathParts.length === 4) {
      const entityType = pathParts[2];
      const entityId = pathParts[3];

      // Map entity type to table
      const tableMap: Record<string, string> = {
        village: 'villages',
        district: 'districts',
        provider: 'tourism_providers',
        listing: 'tourism_listings',
        package: 'travel_packages',
        product: 'local_products',
        story: 'cms_stories',
        event: 'cms_events',
        page: 'cms_pages',
        thought: 'thoughts'
      };

      const table = tableMap[entityType];
      if (!table) {
        return new Response(JSON.stringify({ error: 'Invalid entity type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from(table)
        .select('seo_title, seo_description, seo_image_url, seo_schema, share_templates')
        .eq('id', entityId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT /share-settings/entity/:type/:id - Update entity share settings
    if (req.method === 'PUT' && pathParts[1] === 'entity' && pathParts.length === 4) {
      const entityType = pathParts[2];
      const entityId = pathParts[3];

      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!['super_admin', 'admin', 'content_manager', 'seo_manager'].includes(profile?.role || '')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const tableMap: Record<string, string> = {
        village: 'villages',
        district: 'districts',
        provider: 'tourism_providers',
        listing: 'tourism_listings',
        package: 'travel_packages',
        product: 'local_products',
        story: 'cms_stories',
        event: 'cms_events',
        page: 'cms_pages',
        thought: 'thoughts'
      };

      const table = tableMap[entityType];
      if (!table) {
        return new Response(JSON.stringify({ error: 'Invalid entity type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      const { seo_title, seo_description, seo_image_url, seo_schema, share_templates } = body;

      // Get current value for audit
      const { data: currentData } = await supabase
        .from(table)
        .select('seo_title, seo_description, seo_image_url, seo_schema, share_templates')
        .eq('id', entityId)
        .single();

      // Update entity
      const { error: updateError } = await supabase
        .from(table)
        .update({
          seo_title,
          seo_description,
          seo_image_url,
          seo_schema,
          share_templates
        })
        .eq('id', entityId);

      if (updateError) throw updateError;

      // Create audit entry
      await supabase.from('share_template_audit').insert({
        changed_by: user.id,
        entity_type: entityType,
        entity_id: entityId,
        change_type: 'update',
        before_value: currentData,
        after_value: { seo_title, seo_description, seo_image_url, seo_schema, share_templates }
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /share-settings/purge - Purge social cache
    if (req.method === 'POST' && pathParts[1] === 'purge') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!['super_admin', 'admin'].includes(profile?.role || '')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      const { pageUrl } = body;

      const results: Record<string, any> = {
        facebook: { status: 'manual', message: 'Visit Facebook Sharing Debugger to refresh' },
        twitter: { status: 'manual', message: 'Visit Twitter Card Validator to refresh' },
        linkedin: { status: 'manual', message: 'Use LinkedIn Post Inspector to refresh' },
        telegram: { status: 'manual', message: 'Telegram caches OG data; wait 24h or use different link' },
        whatsapp: { status: 'manual', message: 'WhatsApp refreshes from OG tags on share' }
      };

      // Try Facebook Graph API scrape if possible
      const fbToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
      if (fbToken) {
        try {
          const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/?id=${encodeURIComponent(pageUrl)}&scrape=true`,
            {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${fbToken}` }
            }
          );
          const fbResult = await fbResponse.json();
          results.facebook = { status: 'success', data: fbResult };
        } catch (e) {
          results.facebook = { status: 'error', message: String(e) };
        }
      }

      return new Response(JSON.stringify({
        success: true,
        url: pageUrl,
        results,
        debugUrls: {
          facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(pageUrl)}`,
          twitter: `https://cards-dev.twitter.com/validator`,
          linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(pageUrl)}`
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /share-settings/track - Track share event
    if (req.method === 'POST' && pathParts[1] === 'track') {
      const body = await req.json();
      const { entity_type, entity_id, platform, url } = body;

      // Hash IP for privacy
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      const encoder = new TextEncoder();
      const data = encoder.encode(clientIp + new Date().toDateString());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

      await supabase.from('share_events').insert({
        entity_type,
        entity_id,
        platform,
        url,
        referrer: req.headers.get('referer'),
        user_agent: req.headers.get('user-agent'),
        ip_hash: ipHash
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /share-settings/audit - Get audit history
    if (req.method === 'GET' && pathParts[1] === 'audit') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const limit = parseInt(url.searchParams.get('limit') || '50');
      const entityType = url.searchParams.get('entity_type');
      const entityId = url.searchParams.get('entity_id');

      let query = supabase
        .from('share_template_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) query = query.eq('entity_type', entityType);
      if (entityId) query = query.eq('entity_id', entityId);

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /share-settings/resolve/:type/:id - Resolve final meta for an entity
    if (req.method === 'GET' && pathParts[1] === 'resolve' && pathParts.length === 4) {
      const entityType = pathParts[2];
      const entityId = pathParts[3];

      // Get global defaults
      const { data: settings } = await supabase
        .from('site_share_settings')
        .select('*');

      const defaults = settings?.find(s => s.key === 'defaults')?.value || {};
      const templates = settings?.find(s => s.key === 'templates')?.value || {};

      // Get entity data
      const tableMap: Record<string, { table: string; nameField: string; descField: string; imageField: string | null }> = {
        village: { table: 'villages', nameField: 'name', descField: 'tagline', imageField: 'thumbnail_image_url' },
        district: { table: 'districts', nameField: 'name', descField: 'overview', imageField: 'banner_image' },
        provider: { table: 'tourism_providers', nameField: 'name', descField: 'description', imageField: 'image_url' },
        listing: { table: 'tourism_listings', nameField: 'title', descField: 'short_description', imageField: 'thumbnail_image_url' },
        package: { table: 'travel_packages', nameField: 'title', descField: 'short_description', imageField: 'thumbnail_image_url' },
        product: { table: 'local_products', nameField: 'name', descField: 'description', imageField: 'image_url' },
        story: { table: 'cms_stories', nameField: 'title', descField: 'excerpt', imageField: 'cover_image_url' },
        event: { table: 'cms_events', nameField: 'title', descField: 'description', imageField: 'banner_image_url' },
        page: { table: 'cms_pages', nameField: 'title', descField: 'meta_description', imageField: null },
        thought: { table: 'thoughts', nameField: 'title', descField: 'content', imageField: 'image_url' }
      };

      const config = tableMap[entityType];
      if (!config) {
        return new Response(JSON.stringify({ error: 'Invalid entity type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: entity, error } = await supabase
        .from(config.table)
        .select('*')
        .eq('id', entityId)
        .single();

      if (error) throw error;

      // Build resolved meta
      const title = entity.seo_title || entity[config.nameField] || '';
      const description = entity.seo_description || entity[config.descField] || defaults.default_description || '';
      const image = entity.seo_image_url || (config.imageField ? entity[config.imageField] : null) || defaults.default_image_url;

      const tokenData = {
        page: {
          title,
          excerpt: description.slice(0, 160)
        },
        entity: {
          name: entity[config.nameField] || ''
        },
        site: {
          name: defaults.site_name || 'Hum Pahadi Haii',
          suffix: defaults.title_suffix || ''
        }
      };

      // Build platform-specific meta
      const platformMeta: Record<string, any> = {};
      for (const [platform, template] of Object.entries(templates as Record<string, any>)) {
        if (!template.enabled) continue;
        
        const entityTemplates = entity.share_templates?.[platform] || {};
        platformMeta[platform] = {
          title: substituteTokens(entityTemplates.title_template || template.title_template || '{{page.title}}', tokenData),
          description: substituteTokens(entityTemplates.description_template || template.description_template || '{{page.excerpt}}', tokenData),
          image: entityTemplates.image_url || template.image_url || image,
          ...(template.card_type && { card_type: template.card_type }),
          ...(template.hashtags && { hashtags: entityTemplates.hashtags || template.hashtags })
        };
      }

      return new Response(JSON.stringify({
        title: title + (defaults.title_suffix || ''),
        description,
        image,
        canonical: entity.slug ? `/${entityType}s/${entity.slug}` : null,
        schema: entity.seo_schema,
        platforms: platformMeta,
        defaults,
        templates
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /share-settings/analytics - Get share analytics
    if (req.method === 'GET' && pathParts[1] === 'analytics') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const days = parseInt(url.searchParams.get('days') || '30');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: byPlatform } = await supabase
        .from('share_events')
        .select('platform')
        .gte('created_at', startDate.toISOString());

      const { data: byEntity } = await supabase
        .from('share_events')
        .select('entity_type, entity_id')
        .gte('created_at', startDate.toISOString());

      const { data: daily } = await supabase
        .from('share_events')
        .select('created_at, platform')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Aggregate platform counts
      const platformCounts: Record<string, number> = {};
      byPlatform?.forEach(e => {
        platformCounts[e.platform] = (platformCounts[e.platform] || 0) + 1;
      });

      // Aggregate entity counts
      const entityCounts: Record<string, number> = {};
      byEntity?.forEach(e => {
        const key = `${e.entity_type}:${e.entity_id}`;
        entityCounts[key] = (entityCounts[key] || 0) + 1;
      });

      // Top shared entities
      const topEntities = Object.entries(entityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, count]) => {
          const [type, id] = key.split(':');
          return { entity_type: type, entity_id: id, count };
        });

      // Daily trend
      const dailyTrend: Record<string, Record<string, number>> = {};
      daily?.forEach(e => {
        const date = e.created_at.split('T')[0];
        if (!dailyTrend[date]) dailyTrend[date] = {};
        dailyTrend[date][e.platform] = (dailyTrend[date][e.platform] || 0) + 1;
      });

      return new Response(JSON.stringify({
        total: byPlatform?.length || 0,
        byPlatform: platformCounts,
        topEntities,
        dailyTrend: Object.entries(dailyTrend).map(([date, platforms]) => ({ date, ...platforms }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Share settings error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
