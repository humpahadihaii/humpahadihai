import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate short hash for URLs
function generateShortHash(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let hash = '';
  for (let i = 0; i < 8; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Hash IP for privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'hph_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

// Substitute placeholders in templates
function substitutePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  }
  return result;
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
    // GET /share-preview/resolve/:entityType/:entityId - Get resolved preview
    if (req.method === 'GET' && pathParts[1] === 'resolve') {
      const entityType = pathParts[2];
      const entityId = pathParts[3];

      // Get site defaults
      const { data: siteDefaults } = await supabase
        .from('site_share_preview')
        .select('*')
        .single();

      // Get entity override if exists
      let entityPreview = null;
      if (entityId) {
        const { data } = await supabase
          .from('entity_share_preview')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .single();
        entityPreview = data;
      }

      // Get entity data for fallback values
      let entityData: any = null;
      const entityTableMap: Record<string, string> = {
        village: 'villages',
        district: 'districts',
        provider: 'tourism_providers',
        listing: 'tourism_listings',
        package: 'travel_packages',
        product: 'local_products',
        story: 'cms_stories',
        event: 'cms_events',
      };

      const tableName = entityTableMap[entityType];
      if (tableName && entityId) {
        const { data } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', entityId)
          .single();
        entityData = data;
      }

      // Resolve preview (entity override > entity data > site defaults)
      const useDefault = entityPreview?.use_default !== false;
      
      const resolved = {
        title: (!useDefault && entityPreview?.title) || entityData?.name || entityData?.title || siteDefaults?.default_title,
        description: (!useDefault && entityPreview?.description) || entityData?.description || entityData?.overview || entityData?.short_description || siteDefaults?.default_description,
        image_url: (!useDefault && entityPreview?.image_url) || entityData?.image_url || entityData?.thumbnail_image_url || entityData?.main_image_url || siteDefaults?.default_image_url,
        og_type: (!useDefault && entityPreview?.og_type) || siteDefaults?.og_type || 'website',
        twitter_card: (!useDefault && entityPreview?.twitter_card) || siteDefaults?.twitter_card || 'summary_large_image',
        twitter_site: siteDefaults?.twitter_site || '@humpahadihaii',
        templates: (!useDefault && entityPreview?.templates) || siteDefaults?.templates,
        entity_type: entityType,
        entity_id: entityId,
      };

      return new Response(JSON.stringify(resolved), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      });
    }

    // POST /share-preview/short-link - Create short link
    if (req.method === 'POST' && pathParts[1] === 'short-link') {
      const body = await req.json();
      const { target_url, entity_type, entity_id, ref } = body;

      if (!target_url) {
        return new Response(JSON.stringify({ error: 'target_url is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if short link already exists for this URL
      const { data: existing } = await supabase
        .from('short_links')
        .select('*')
        .eq('target_url', target_url)
        .eq('ref', ref || '')
        .single();

      if (existing) {
        return new Response(JSON.stringify({ hash: existing.hash, short_url: `${supabaseUrl.replace('.supabase.co', '')}/s/${existing.hash}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create new short link
      const hash = generateShortHash();
      const { data: newLink, error } = await supabase
        .from('short_links')
        .insert({
          hash,
          target_url,
          entity_type,
          entity_id,
          ref: ref || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating short link:', error);
        return new Response(JSON.stringify({ error: 'Failed to create short link' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ hash: newLink.hash, short_url: `${supabaseUrl.replace('.supabase.co', '')}/s/${newLink.hash}` }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /share-preview/redirect/:hash - Redirect short link
    if (req.method === 'GET' && pathParts[1] === 'redirect') {
      const hash = pathParts[2];

      const { data: link } = await supabase
        .from('short_links')
        .select('*')
        .eq('hash', hash)
        .single();

      if (!link) {
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      }

      // Increment click count
      await supabase
        .from('short_links')
        .update({ click_count: (link.click_count || 0) + 1 })
        .eq('id', link.id);

      // Record click
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
      const ipHash = await hashIP(clientIP);

      await supabase.from('share_clicks').insert({
        entity_type: link.entity_type,
        entity_id: link.entity_id,
        channel: link.ref || 'direct',
        short_link_id: link.id,
        ip_hash: ipHash,
        user_agent: req.headers.get('user-agent'),
      });

      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': link.target_url },
      });
    }

    // POST /share-preview/track-click - Track share button click
    if (req.method === 'POST' && pathParts[1] === 'track-click') {
      const body = await req.json();
      const { entity_type, entity_id, channel } = body;

      if (!entity_type || !channel) {
        return new Response(JSON.stringify({ error: 'entity_type and channel are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
      const ipHash = await hashIP(clientIP);

      await supabase.from('share_clicks').insert({
        entity_type,
        entity_id: entity_id || null,
        channel,
        ip_hash: ipHash,
        user_agent: req.headers.get('user-agent'),
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /share-preview/generate-links - Generate share links with templates
    if (req.method === 'POST' && pathParts[1] === 'generate-links') {
      const body = await req.json();
      const { entity_type, entity_id, page_url, title, description } = body;

      // Get site defaults for templates
      const { data: siteDefaults } = await supabase
        .from('site_share_preview')
        .select('templates')
        .single();

      // Get entity override templates if exists
      let templates = siteDefaults?.templates || {};
      if (entity_id) {
        const { data: entityPreview } = await supabase
          .from('entity_share_preview')
          .select('templates, use_default')
          .eq('entity_type', entity_type)
          .eq('entity_id', entity_id)
          .single();
        
        if (entityPreview && !entityPreview.use_default && entityPreview.templates) {
          templates = { ...templates, ...entityPreview.templates };
        }
      }

      const placeholders = {
        entity_title: title || 'Hum Pahadi Haii',
        entity_description: description || '',
        short_url: page_url,
        site_name: 'Hum Pahadi Haii',
      };

      const channels = ['whatsapp', 'facebook', 'twitter', 'linkedin', 'email'];
      const shareLinks: Record<string, any> = {};

      for (const channel of channels) {
        const urlWithRef = `${page_url}${page_url.includes('?') ? '&' : '?'}ref=${channel}`;
        const template = templates[channel] || '{entity_title}';
        const message = substitutePlaceholders(template, { ...placeholders, short_url: urlWithRef });

        switch (channel) {
          case 'whatsapp':
            shareLinks.whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
          case 'facebook':
            shareLinks.facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlWithRef)}&quote=${encodeURIComponent(message)}`;
            break;
          case 'twitter':
            shareLinks.twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
            break;
          case 'linkedin':
            shareLinks.linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlWithRef)}`;
            break;
          case 'email':
            const emailSubject = substitutePlaceholders(templates.email_subject || '{entity_title}', placeholders);
            const emailBody = substitutePlaceholders(templates.email_body || '{entity_description}\n\n{short_url}', { ...placeholders, short_url: urlWithRef });
            shareLinks.email = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            break;
        }
      }

      shareLinks.copy = `${page_url}?ref=copy`;

      return new Response(JSON.stringify({ links: shareLinks, templates }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Share preview error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});