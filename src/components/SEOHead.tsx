import { Helmet } from "react-helmet";
import { SEOMeta } from "@/lib/seo/generator";

interface SEOHeadProps {
  meta: SEOMeta;
}

export default function SEOHead({ meta }: SEOHeadProps) {
  const schemaScript = Array.isArray(meta.schema) 
    ? meta.schema.map(s => JSON.stringify(s)).join('')
    : JSON.stringify(meta.schema);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={meta.canonical} />

      {/* Indexing */}
      {meta.noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={meta.ogType} />
      <meta property="og:url" content={meta.ogUrl} />
      <meta property="og:title" content={meta.ogTitle} />
      <meta property="og:description" content={meta.ogDescription} />
      <meta property="og:image" content={meta.ogImage} />
      <meta property="og:site_name" content="Hum Pahadi Haii" />

      {/* Twitter */}
      <meta name="twitter:card" content={meta.twitterCard} />
      <meta name="twitter:site" content="@humpahadihaii" />
      <meta name="twitter:title" content={meta.twitterTitle} />
      <meta name="twitter:description" content={meta.twitterDescription} />
      <meta name="twitter:image" content={meta.twitterImage} />

      {/* Structured Data */}
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
