import { Helmet } from "react-helmet";
import { SEOMeta, BreadcrumbItem } from "@/lib/seo/generator";

interface SEOHeadProps {
  meta: SEOMeta;
  // Optional overrides from admin share preview settings or entity SEO fields
  sharePreview?: {
    title?: string;
    description?: string;
    image?: string;
    ogType?: string;
    twitterCard?: string;
    twitterSite?: string;
    siteName?: string;
    locale?: string;
  };
}

// Ensure URL is absolute
function ensureAbsoluteUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://humpahadihaii.in';
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function SEOHead({ meta, sharePreview }: SEOHeadProps) {
  // Merge share preview overrides with SEO meta
  const ogTitle = sharePreview?.title || meta.ogTitle;
  const ogDescription = sharePreview?.description || meta.ogDescription;
  const ogImage = ensureAbsoluteUrl(sharePreview?.image || meta.ogImage);
  const ogType = sharePreview?.ogType || meta.ogType;
  const twitterCard = sharePreview?.twitterCard || meta.twitterCard;
  const twitterSite = sharePreview?.twitterSite || '@humpahadihaii';
  const siteName = sharePreview?.siteName || 'Hum Pahadi Haii';
  const locale = sharePreview?.locale || 'en_IN';
  const canonical = ensureAbsoluteUrl(meta.canonical);
  const ogUrl = ensureAbsoluteUrl(meta.ogUrl);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={canonical} />

      {/* Indexing Rules */}
      {meta.noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      {ogImage && <meta property="og:image:alt" content={ogTitle} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterSite} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image:alt" content={ogTitle} />}

      {/* Additional SEO Tags */}
      <meta name="author" content={siteName} />
      <meta name="geo.region" content="IN-UK" />
      <meta name="geo.placename" content="Uttarakhand" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Structured Data - JSON-LD */}
      {Array.isArray(meta.schema) ? (
        meta.schema.map((s, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(s)}
          </script>
        ))
      ) : meta.schema ? (
        <script type="application/ld+json">
          {JSON.stringify(meta.schema)}
        </script>
      ) : null}
    </Helmet>
  );
}

// Breadcrumb UI Component
interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className = "" }: BreadcrumbNavProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-muted-foreground/50">/</span>}
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {item.name}
              </span>
            ) : (
              <a 
                href={item.url} 
                className="hover:text-primary transition-colors truncate max-w-[150px]"
              >
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}