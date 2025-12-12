import { Helmet } from "react-helmet";
import { SEOMeta, BreadcrumbItem } from "@/lib/seo/generator";

interface SEOHeadProps {
  meta: SEOMeta;
  // Optional overrides from admin share preview settings
  sharePreview?: {
    title?: string;
    description?: string;
    image?: string;
    ogType?: string;
    twitterCard?: string;
    twitterSite?: string;
  };
}

export default function SEOHead({ meta, sharePreview }: SEOHeadProps) {
  // Merge share preview overrides with SEO meta
  const ogTitle = sharePreview?.title || meta.ogTitle;
  const ogDescription = sharePreview?.description || meta.ogDescription;
  const ogImage = sharePreview?.image || meta.ogImage;
  const ogType = sharePreview?.ogType || meta.ogType;
  const twitterCard = sharePreview?.twitterCard || meta.twitterCard;
  const twitterSite = sharePreview?.twitterSite || '@humpahadihaii';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={meta.canonical} />

      {/* Indexing Rules */}
      {meta.noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={meta.ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogTitle} />
      <meta property="og:site_name" content="Hum Pahadi Haii" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterSite} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogTitle} />

      {/* Additional SEO Tags */}
      <meta name="author" content="Hum Pahadi Haii" />
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
      ) : (
        <script type="application/ld+json">
          {JSON.stringify(meta.schema)}
        </script>
      )}
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