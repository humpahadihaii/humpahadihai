import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://humpahadihaii.in";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "index";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let xml = "";

    switch (type) {
      case "index":
        xml = generateSitemapIndex();
        break;
      case "villages":
        xml = await generateVillagesSitemap(supabase);
        break;
      case "districts":
        xml = await generateDistrictsSitemap(supabase);
        break;
      case "marketplace":
        xml = await generateMarketplaceSitemap(supabase);
        break;
      case "packages":
        xml = await generatePackagesSitemap(supabase);
        break;
      case "products":
        xml = await generateProductsSitemap(supabase);
        break;
      case "stories":
        xml = await generateStoriesSitemap(supabase);
        break;
      case "static":
        xml = generateStaticSitemap();
        break;
      default:
        xml = generateSitemapIndex();
    }

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Sitemap generation error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateSitemapIndex(): string {
  const lastmod = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=static</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=villages</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=districts</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=marketplace</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=packages</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=products</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=stories</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function generateStaticSitemap(): string {
  const pages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/culture", priority: "0.9", changefreq: "weekly" },
    { url: "/food", priority: "0.9", changefreq: "weekly" },
    { url: "/travel", priority: "0.9", changefreq: "weekly" },
    { url: "/districts", priority: "0.9", changefreq: "weekly" },
    { url: "/villages", priority: "0.8", changefreq: "weekly" },
    { url: "/gallery", priority: "0.8", changefreq: "weekly" },
    { url: "/thoughts", priority: "0.7", changefreq: "weekly" },
    { url: "/marketplace", priority: "0.9", changefreq: "daily" },
    { url: "/travel-packages", priority: "0.9", changefreq: "daily" },
    { url: "/products", priority: "0.8", changefreq: "daily" },
    { url: "/promotions", priority: "0.7", changefreq: "weekly" },
    { url: "/list-your-business", priority: "0.7", changefreq: "monthly" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
    { url: "/disclaimer", priority: "0.3", changefreq: "yearly" },
  ];

  const lastmod = new Date().toISOString().split("T")[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

async function generateVillagesSitemap(supabase: any): Promise<string> {
  const { data: villages } = await supabase
    .from("villages")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("name");

  return generateUrlset(
    villages || [],
    (v) => `/villages/${v.slug}`,
    "0.8",
    "weekly"
  );
}

async function generateDistrictsSitemap(supabase: any): Promise<string> {
  const { data: districts } = await supabase
    .from("districts")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("name");

  return generateUrlset(
    districts || [],
    (d) => `/districts/${d.slug}`,
    "0.9",
    "weekly"
  );
}

async function generateMarketplaceSitemap(supabase: any): Promise<string> {
  const { data: listings } = await supabase
    .from("tourism_listings")
    .select("id, updated_at")
    .eq("is_active", true)
    .order("title");

  return generateUrlset(
    listings || [],
    (l) => `/marketplace/${l.id}`,
    "0.7",
    "daily"
  );
}

async function generatePackagesSitemap(supabase: any): Promise<string> {
  const { data: packages } = await supabase
    .from("travel_packages")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("title");

  return generateUrlset(
    packages || [],
    (p) => `/travel-packages/${p.slug}`,
    "0.8",
    "weekly"
  );
}

async function generateProductsSitemap(supabase: any): Promise<string> {
  const { data: products } = await supabase
    .from("local_products")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("name");

  return generateUrlset(
    products || [],
    (p) => `/products/${p.slug}`,
    "0.7",
    "weekly"
  );
}

async function generateStoriesSitemap(supabase: any): Promise<string> {
  const { data: stories } = await supabase
    .from("cms_stories")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("title");

  const { data: content } = await supabase
    .from("content_items")
    .select("slug, type, updated_at")
    .eq("status", "published")
    .order("title");

  const allItems = [
    ...(stories || []).map((s: any) => ({ ...s, path: `/stories/${s.slug}` })),
    ...(content || []).map((c: any) => ({ ...c, path: `/${c.type}/${c.slug}` })),
  ];

  return generateUrlset(allItems, (i) => i.path, "0.7", "weekly");
}

function generateUrlset(
  items: any[],
  urlFn: (item: any) => string,
  priority: string,
  changefreq: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items
  .map(
    (item) => `  <url>
    <loc>${SITE_URL}${urlFn(item)}</loc>
    <lastmod>${item.updated_at ? new Date(item.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}
