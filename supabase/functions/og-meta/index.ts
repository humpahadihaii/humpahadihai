import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known social media and bot user agents
const SOCIAL_CRAWLERS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'Slackbot',
  'Discordbot',
  'Googlebot',
  'bingbot',
  'Pinterest',
  'vkShare',
  'Viber',
  'Line',
  'Snapchat',
];

function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return SOCIAL_CRAWLERS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

// Truncate text for platform limits
function truncateForPlatform(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Ensure URL is absolute
function ensureAbsoluteUrl(url: string | null, baseUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Entity type to table mapping
const ENTITY_TABLE_MAP: Record<string, { table: string; titleField: string; descField: string; imageField: string; slugField?: string }> = {
  village: { table: 'villages', titleField: 'name', descField: 'tagline', imageField: 'thumbnail_image_url', slugField: 'slug' },
  district: { table: 'districts', titleField: 'name', descField: 'overview', imageField: 'image_url', slugField: 'slug' },
  provider: { table: 'tourism_providers', titleField: 'name', descField: 'description', imageField: 'image_url' },
  listing: { table: 'tourism_listings', titleField: 'title', descField: 'short_description', imageField: 'thumbnail_image_url', slugField: 'slug' },
  package: { table: 'travel_packages', titleField: 'title', descField: 'short_description', imageField: 'thumbnail_image_url', slugField: 'slug' },
  product: { table: 'local_products', titleField: 'name', descField: 'description', imageField: 'image_url', slugField: 'slug' },
  story: { table: 'cms_stories', titleField: 'title', descField: 'excerpt', imageField: 'cover_image_url', slugField: 'slug' },
  event: { table: 'cms_events', titleField: 'title', descField: 'description', imageField: 'banner_image_url', slugField: 'slug' },
  thought: { table: 'thoughts', titleField: 'title', descField: 'content', imageField: 'image_url', slugField: 'slug' },
};

interface MetaData {
  title: string;
  description: string;
  image: string | null;
  url: string;
  type: string;
  twitterCard: string;
  twitterSite: string;
  siteName: string;
  locale: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent');
  
  console.log(`[og-meta] Request path: ${url.pathname}, UA: ${userAgent?.substring(0, 50)}`);

  try {
    // Parse the path to determine entity type and ID
    // Expected format: /og-meta/:entityType/:entityIdOrSlug
    // Or: /og-meta/resolve?url=<encoded_url>
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    let entityType: string | null = null;
    let entityId: string | null = null;
    let pageUrl: string = 'https://humpahadihaii.in';

    if (pathParts[1] === 'resolve') {
      // Resolve from URL
      const targetUrl = url.searchParams.get('url');
      if (targetUrl) {
        pageUrl = targetUrl;
        // Parse URL to extract entity type and ID
        const urlObj = new URL(targetUrl);
        const pagePath = urlObj.pathname.split('/').filter(Boolean);
        
        if (pagePath[0] === 'villages' && pagePath[1]) {
          entityType = 'village';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'districts' && pagePath[1]) {
          entityType = 'district';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'providers' && pagePath[1]) {
          entityType = 'provider';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'listings' && pagePath[1]) {
          entityType = 'listing';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'travel-packages' && pagePath[1]) {
          entityType = 'package';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'products' && pagePath[1]) {
          entityType = 'product';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'stories' && pagePath[1]) {
          entityType = 'story';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'events' && pagePath[1]) {
          entityType = 'event';
          entityId = pagePath[1];
        } else if (pagePath[0] === 'thoughts' && pagePath[1]) {
          entityType = 'thought';
          entityId = pagePath[1];
        }
      }
    } else if (pathParts.length >= 3) {
      entityType = pathParts[1];
      entityId = pathParts[2];
    }

    // Fetch site defaults
    const { data: siteDefaults } = await supabase
      .from('site_share_preview')
      .select('*')
      .eq('singleton_flag', true)
      .single();

    // Also get CMS settings for additional defaults
    const { data: cmsSettings } = await supabase
      .from('cms_site_settings')
      .select('site_name, meta_description, tagline')
      .limit(1)
      .single();

    // Initialize meta with defaults
    let meta: MetaData = {
      title: siteDefaults?.default_title || cmsSettings?.site_name || 'Hum Pahadi Haii',
      description: truncateForPlatform(
        siteDefaults?.default_description || cmsSettings?.meta_description || 'Discover Uttarakhand\'s rich culture, traditions, and natural beauty.',
        160
      ),
      image: ensureAbsoluteUrl(siteDefaults?.default_image_url, 'https://humpahadihaii.in'),
      url: pageUrl,
      type: siteDefaults?.og_type || 'website',
      twitterCard: siteDefaults?.twitter_card || 'summary_large_image',
      twitterSite: siteDefaults?.twitter_site || '@humpahadihaii',
      siteName: cmsSettings?.site_name || 'Hum Pahadi Haii',
      locale: 'en_IN',
    };

    // Fetch entity-specific data if available
    if (entityType && entityId) {
      const mapping = ENTITY_TABLE_MAP[entityType];
      
      if (mapping) {
        // Try to find by ID first, then by slug
        let entityData: any = null;
        
        // Check if entityId is a UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityId);
        
        if (isUuid) {
          const { data } = await supabase
            .from(mapping.table)
            .select('*')
            .eq('id', entityId)
            .single();
          entityData = data;
        }
        
        // If not found by ID and slug field exists, try by slug
        if (!entityData && mapping.slugField) {
          const { data } = await supabase
            .from(mapping.table)
            .select('*')
            .eq(mapping.slugField, entityId)
            .single();
          entityData = data;
        }

        if (entityData) {
          // Check for entity-specific override
          const { data: entityOverride } = await supabase
            .from('entity_share_preview')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityData.id)
            .single();

          const useDefault = !entityOverride || entityOverride.use_default !== false;

          // Build meta from entity data with fallbacks
          meta.title = (!useDefault && entityOverride?.title) 
            || entityData[mapping.titleField] 
            || meta.title;
          
          meta.description = truncateForPlatform(
            (!useDefault && entityOverride?.description) 
              || entityData[mapping.descField] 
              || meta.description,
            160
          );
          
          const entityImage = (!useDefault && entityOverride?.image_url) 
            || entityData[mapping.imageField]
            || entityData.image_url
            || entityData.thumbnail_image_url
            || entityData.cover_image_url;
          
          if (entityImage) {
            meta.image = ensureAbsoluteUrl(entityImage, 'https://humpahadihaii.in');
          }

          // Set appropriate OG type for entity
          if (entityType === 'product') {
            meta.type = 'product';
          } else if (entityType === 'story' || entityType === 'thought') {
            meta.type = 'article';
          } else if (entityType === 'event') {
            meta.type = 'event';
          } else {
            meta.type = 'website';
          }
        }
      }
    }

    // Append site name to title if not already present
    if (!meta.title.includes('Hum Pahadi') && !meta.title.includes('Uttarakhand')) {
      meta.title = `${meta.title} | ${meta.siteName}`;
    }

    // Truncate title for platform limits (60 chars for SEO best practices)
    meta.title = truncateForPlatform(meta.title, 70);

    console.log(`[og-meta] Resolved meta for ${entityType}/${entityId}:`, {
      title: meta.title,
      description: meta.description.substring(0, 50) + '...',
      image: meta.image,
    });

    // Return JSON for API calls
    if (req.headers.get('Accept')?.includes('application/json')) {
      return new Response(JSON.stringify(meta), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      });
    }

    // Return HTML page with meta tags for social crawlers
    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="${meta.type}">
  <meta property="og:url" content="${escapeHtml(meta.url)}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:site_name" content="${escapeHtml(meta.siteName)}">
  <meta property="og:locale" content="${meta.locale}">
  ${meta.image ? `
  <meta property="og:image" content="${escapeHtml(meta.image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(meta.image)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(meta.title)}">
  ` : ''}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${meta.twitterCard}">
  <meta name="twitter:site" content="${meta.twitterSite}">
  <meta name="twitter:creator" content="${meta.twitterSite}">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  ${meta.image ? `<meta name="twitter:image" content="${escapeHtml(meta.image)}">` : ''}
  ${meta.image ? `<meta name="twitter:image:alt" content="${escapeHtml(meta.title)}">` : ''}
  
  <!-- LinkedIn -->
  <meta property="article:author" content="Hum Pahadi Haii">
  
  <!-- Canonical -->
  <link rel="canonical" href="${escapeHtml(meta.url)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/jpeg" href="https://humpahadihaii.in/logo.jpg">
  
  <!-- If not a bot, redirect to the actual page -->
  <script>
    if (!navigator.userAgent.match(/bot|crawl|spider|facebook|twitter|linkedin|whatsapp|telegram|slack|discord|google|bing|pinterest/i)) {
      window.location.replace('${escapeHtml(meta.url)}');
    }
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(meta.url)}">
  </noscript>
</head>
<body>
  <h1>${escapeHtml(meta.title)}</h1>
  <p>${escapeHtml(meta.description)}</p>
  ${meta.image ? `<img src="${escapeHtml(meta.image)}" alt="${escapeHtml(meta.title)}">` : ''}
  <p><a href="${escapeHtml(meta.url)}">Visit Page</a></p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('[og-meta] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Escape HTML special characters to prevent XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}
