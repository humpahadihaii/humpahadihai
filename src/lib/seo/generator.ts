// SEO Generator Engine for Hum Pahadi Haii
// Handles metadata, schema.org JSON-LD, keywords, and OG tags

export type PageType = 
  | 'homepage' 
  | 'village' 
  | 'district' 
  | 'marketplace_provider' 
  | 'listing' 
  | 'travel_package' 
  | 'product' 
  | 'story' 
  | 'event' 
  | 'static_page' 
  | 'thoughts' 
  | 'festivals'
  | 'culture'
  | 'food'
  | 'travel'
  | 'gallery'
  | 'marketplace'
  | 'shop';

export interface SEOEntity {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  excerpt?: string;
  image?: string;
  district?: string;
  district_name?: string;
  region?: string;
  highlights?: string;
  price?: number;
  duration?: string;
  category?: string;
  location?: string;
  date?: string;
  author?: string;
  rating?: number;
  reviews_count?: number;
  [key: string]: any;
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schema: object | object[];
  noIndex?: boolean;
}

const SITE_NAME = "Hum Pahadi Haii";
const SITE_URL = "https://humpahadihaii.in";
const DEFAULT_IMAGE = "/logo.jpg";
const TITLE_SUFFIX = " | Hum Pahadi Haii";

// Keyword clusters for Uttarakhand tourism
export const KEYWORD_CLUSTERS = {
  village: [
    "{{name}} Uttarakhand",
    "things to do in {{name}}",
    "{{name}} homestays",
    "best time to visit {{name}}",
    "{{name}} travel guide",
    "{{name}} food culture places",
    "{{name}} village tourism",
    "how to reach {{name}}",
  ],
  district: [
    "{{name}} tourism",
    "places to visit in {{name}}",
    "{{name}} top attractions",
    "{{name}} local food",
    "{{name}} festivals",
    "best homestays in {{name}}",
    "{{name}} Uttarakhand travel",
    "{{name}} trekking destinations",
  ],
  marketplace: [
    "homestays in Uttarakhand",
    "budget homestays in {{district}}",
    "local guides in Uttarakhand",
    "trek guides in {{district}}",
    "cab service in {{district}}",
    "local artisans in Uttarakhand",
    "Uttarakhand tourism services",
  ],
  travel_package: [
    "Uttarakhand travel packages",
    "{{name}} tour package",
    "trekking trips in Uttarakhand",
    "family packages Uttarakhand",
    "custom itineraries Uttarakhand",
    "adventure tours Uttarakhand",
  ],
  product: [
    "Uttarakhand traditional products",
    "organic products from Uttarakhand",
    "Pahadi food online",
    "local crafts Uttarakhand",
    "{{name}} buy online",
    "authentic Uttarakhand products",
  ],
  culture: [
    "Pahadi culture",
    "Uttarakhand traditions",
    "Garhwali culture",
    "Kumaoni culture",
    "Jaunsari culture",
    "Uttarakhand folk stories",
    "Himalayan heritage",
  ],
  festivals: [
    "{{name}} Uttarakhand",
    "events in Uttarakhand",
    "Uttarakhand cultural festivals",
    "Pahadi festivals",
    "traditional celebrations Uttarakhand",
  ],
};

// SEO Templates per page type
const TEMPLATES = {
  homepage: {
    title: "Hum Pahadi Haii - Celebrating Uttarakhand's Culture, Tradition & Heritage",
    description: "Discover Uttarakhand's rich culture, traditional food, festivals, handicrafts, and natural beauty. Explore Pahadi traditions from Garhwal, Kumaon, and Jaunsari regions.",
  },
  village: {
    title: "Explore {{name}} Village, Uttarakhand — Culture, Food, Travel & Local Life",
    description: "Discover {{name}}, a beautiful village in {{district}} known for {{highlights}}. Explore local food, culture, homestays, places to visit, festivals and travel tips.",
  },
  district: {
    title: "{{name}} District, Uttarakhand — Tourism, Culture, Places to Visit & Travel Guide",
    description: "Explore {{name}} district in Uttarakhand. Discover top tourist attractions, local food, festivals, homestays, trekking destinations and travel tips for {{name}}.",
  },
  marketplace_provider: {
    title: "{{name}} — Local Tourism Service in {{district}}, Uttarakhand",
    description: "{{name}} offers authentic tourism services in {{district}}, Uttarakhand. Book homestays, guides, treks and local experiences.",
  },
  listing: {
    title: "{{name}} — {{category}} in {{district}}, Uttarakhand | Book Now",
    description: "{{description}} Located in {{district}}, Uttarakhand. Book your stay or experience today.",
  },
  travel_package: {
    title: "{{name}} — Book Uttarakhand Travel Package ({{duration}})",
    description: "{{description}} Explore the best of Uttarakhand with this curated travel package. Book now for an unforgettable Himalayan experience.",
  },
  product: {
    title: "Buy {{name}} — Authentic Uttarakhand Product | {{category}}",
    description: "{{description}} Handcrafted in Uttarakhand. Buy authentic Pahadi products online with doorstep delivery.",
  },
  story: {
    title: "{{title}} — Uttarakhand Stories & Insights",
    description: "{{excerpt}} Read more stories about Uttarakhand's culture, traditions and local life.",
  },
  event: {
    title: "{{name}} — Festival & Event in Uttarakhand",
    description: "{{description}} Join this cultural celebration in Uttarakhand. Dates, venue, and how to participate.",
  },
  thoughts: {
    title: "{{title}} — Thoughts & Reflections from Uttarakhand",
    description: "{{excerpt}} Personal stories and reflections from the mountains of Uttarakhand.",
  },
  festivals: {
    title: "{{name}} — Traditional Festival of Uttarakhand",
    description: "Learn about {{name}}, a traditional festival celebrated in Uttarakhand. History, rituals, dates and significance.",
  },
  culture: {
    title: "Culture & Traditions of Uttarakhand — Pahadi Heritage",
    description: "Explore the rich cultural heritage of Uttarakhand including Garhwali, Kumaoni, and Jaunsari traditions, folk music, dance, and customs.",
  },
  food: {
    title: "Food Trails — Authentic Pahadi Cuisine of Uttarakhand",
    description: "Discover the authentic Pahadi cuisine from mountains to your plate. Traditional recipes, local ingredients, and food culture of Uttarakhand.",
  },
  travel: {
    title: "Travel & Nature — Explore the Himalayas of Uttarakhand",
    description: "From sacred shrines to hidden valleys, explore the natural beauty of Uttarakhand. Trekking, pilgrimages, and adventure destinations.",
  },
  gallery: {
    title: "Photo Gallery — Beautiful Images of Uttarakhand",
    description: "Browse stunning photos of Uttarakhand's landscapes, culture, festivals, and people. A visual journey through the Himalayas.",
  },
  marketplace: {
    title: "Tourism Marketplace — Homestays, Guides & Local Services in Uttarakhand",
    description: "Find and book authentic homestays, local guides, trek services, and tourism experiences across Uttarakhand.",
  },
  shop: {
    title: "Shop Pahadi Products — Authentic Uttarakhand Handicrafts & Food",
    description: "Buy authentic Uttarakhand products online. Traditional handicrafts, organic food, woolen items, and local specialties.",
  },
  static_page: {
    title: "{{title}}",
    description: "{{description}}",
  },
};

// Schema.org templates
const SCHEMA_TEMPLATES = {
  homepage: () => [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: "Celebrating Uttarakhand's Culture, Tradition & Heritage",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}${DEFAULT_IMAGE}`,
      sameAs: [
        "https://instagram.com/humpahadihaii",
        "https://facebook.com/humpahadihaii",
        "https://youtube.com/@humpahadihaii",
      ],
    },
  ],
  village: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: entity.name,
    description: entity.description || entity.excerpt,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/villages/${entity.slug}`,
    address: {
      "@type": "PostalAddress",
      addressRegion: entity.district_name || entity.district,
      addressCountry: "IN",
    },
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Uttarakhand",
    },
  }),
  district: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `${entity.name} District`,
    description: entity.description || entity.overview,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/districts/${entity.slug}`,
    address: {
      "@type": "PostalAddress",
      addressRegion: entity.name,
      addressCountry: "IN",
    },
  }),
  marketplace_provider: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: entity.name,
    description: entity.description,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/marketplace/provider/${entity.slug || entity.id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: entity.location,
      addressRegion: entity.district,
      addressCountry: "IN",
    },
    ...(entity.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: entity.rating,
        reviewCount: entity.reviews_count || 1,
      },
    }),
  }),
  listing: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": entity.category === 'stay' ? "LodgingBusiness" : "TouristAttraction",
    name: entity.name || entity.title,
    description: entity.description,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/marketplace/${entity.slug || entity.id}`,
    address: {
      "@type": "PostalAddress",
      addressRegion: entity.district,
      addressCountry: "IN",
    },
    ...(entity.price && {
      priceRange: `₹${entity.price}`,
    }),
  }),
  travel_package: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: entity.name || entity.title,
    description: entity.description || entity.short_description,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/travel-packages/${entity.slug}`,
    touristType: "Adventure Traveler",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: parseInt(entity.duration) || 1,
    },
    ...(entity.price && {
      offers: {
        "@type": "Offer",
        price: entity.price,
        priceCurrency: "INR",
      },
    }),
  }),
  product: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: entity.name,
    description: entity.description || entity.short_description,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/products/${entity.slug}`,
    brand: {
      "@type": "Brand",
      name: "Hum Pahadi Haii",
    },
    ...(entity.price && {
      offers: {
        "@type": "Offer",
        price: entity.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    }),
  }),
  story: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entity.title,
    description: entity.excerpt,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/stories/${entity.slug}`,
    author: {
      "@type": "Person",
      name: entity.author || "Hum Pahadi Haii",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${DEFAULT_IMAGE}`,
      },
    },
    datePublished: entity.date || entity.published_at,
  }),
  event: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: entity.name || entity.title,
    description: entity.description,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/events/${entity.slug}`,
    startDate: entity.date || entity.event_date,
    location: {
      "@type": "Place",
      name: entity.location || "Uttarakhand",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Uttarakhand",
        addressCountry: "IN",
      },
    },
  }),
  thoughts: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entity.title,
    description: entity.excerpt,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    url: `${SITE_URL}/thoughts/${entity.slug}`,
    author: {
      "@type": "Person",
      name: entity.author || "Hum Pahadi Haii",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    datePublished: entity.date || entity.published_at,
  }),
  festivals: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: entity.name,
    description: entity.description,
    image: entity.image ? `${SITE_URL}${entity.image}` : undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Uttarakhand",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Uttarakhand",
        addressCountry: "IN",
      },
    },
  }),
};

// Helper functions
export function cleanSummary(text: string | undefined, maxLength = 160): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim()
    .substring(0, maxLength)
    .trim();
}

export function canonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] || data[key.toLowerCase()] || '';
  });
}

export function generateKeywords(entity: SEOEntity, pageType: PageType): string {
  const baseKeywords = [
    "Uttarakhand",
    "Pahadi",
    "Himalayan",
    "Garhwal",
    "Kumaon",
  ];

  let clusterKey: keyof typeof KEYWORD_CLUSTERS = 'culture';
  
  if (pageType === 'village' || pageType === 'district') {
    clusterKey = pageType;
  } else if (['marketplace_provider', 'listing', 'marketplace'].includes(pageType)) {
    clusterKey = 'marketplace';
  } else if (pageType === 'travel_package' || pageType === 'travel') {
    clusterKey = 'travel_package';
  } else if (pageType === 'product' || pageType === 'shop') {
    clusterKey = 'product';
  } else if (pageType === 'festivals' || pageType === 'event') {
    clusterKey = 'festivals';
  }

  const cluster = KEYWORD_CLUSTERS[clusterKey] || [];
  const interpolatedKeywords = cluster.map(kw => interpolate(kw, {
    name: entity.name || entity.title || '',
    district: entity.district_name || entity.district || '',
    category: entity.category || '',
  })).filter(kw => kw && !kw.includes('{{'));

  const allKeywords = [...baseKeywords, ...interpolatedKeywords];
  
  if (entity.name) allKeywords.push(entity.name);
  if (entity.district) allKeywords.push(entity.district);
  if (entity.region) allKeywords.push(entity.region);
  if (entity.category) allKeywords.push(entity.category);

  return [...new Set(allKeywords)].slice(0, 15).join(', ');
}

export function generateSchema(pageType: PageType, entity: SEOEntity): object | object[] {
  const schemaGenerator = SCHEMA_TEMPLATES[pageType as keyof typeof SCHEMA_TEMPLATES];
  
  if (schemaGenerator) {
    return typeof schemaGenerator === 'function' 
      ? schemaGenerator(entity) 
      : schemaGenerator;
  }

  // Default Article schema for unknown types
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: entity.title || entity.name,
    description: entity.description || entity.excerpt,
    url: canonicalUrl(`/${pageType}/${entity.slug || ''}`),
  };
}

export function generateOG(entity: SEOEntity, pageType: PageType): {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogUrl: string;
} {
  const template = TEMPLATES[pageType] || TEMPLATES.static_page;
  
  const title = interpolate(template.title, entity);
  const description = cleanSummary(interpolate(template.description, entity), 200);
  
  let ogType = 'website';
  if (['story', 'thoughts'].includes(pageType)) ogType = 'article';
  else if (['product'].includes(pageType)) ogType = 'product';
  else if (['event', 'festivals'].includes(pageType)) ogType = 'event';

  return {
    ogTitle: title,
    ogDescription: description,
    ogImage: entity.image || DEFAULT_IMAGE,
    ogType,
    ogUrl: canonicalUrl(`/${pageType}/${entity.slug || ''}`),
  };
}

export function generateMeta(pageType: PageType, entity: SEOEntity = {}): SEOMeta {
  const template = TEMPLATES[pageType] || TEMPLATES.static_page;
  
  const rawTitle = interpolate(template.title, entity);
  const title = pageType === 'homepage' ? rawTitle : `${rawTitle}${TITLE_SUFFIX}`;
  
  const description = cleanSummary(
    entity.seo_description || interpolate(template.description, {
      ...entity,
      highlights: entity.highlights || 'its natural beauty and cultural heritage',
    }),
    160
  );

  const keywords = entity.seo_keywords || generateKeywords(entity, pageType);
  const canonical = canonicalUrl(entity.slug ? `/${getPathForType(pageType)}/${entity.slug}` : `/${getPathForType(pageType)}`);
  const og = generateOG(entity, pageType);
  const schema = generateSchema(pageType, entity);

  return {
    title: entity.seo_title || title,
    description,
    keywords,
    canonical,
    ...og,
    twitterCard: 'summary_large_image',
    twitterTitle: og.ogTitle,
    twitterDescription: og.ogDescription,
    twitterImage: og.ogImage,
    schema,
    noIndex: entity.noIndex || false,
  };
}

function getPathForType(pageType: PageType): string {
  const paths: Record<PageType, string> = {
    homepage: '',
    village: 'villages',
    district: 'districts',
    marketplace_provider: 'marketplace/provider',
    listing: 'marketplace',
    travel_package: 'travel-packages',
    product: 'products',
    story: 'stories',
    event: 'events',
    static_page: '',
    thoughts: 'thoughts',
    festivals: 'festivals',
    culture: 'culture',
    food: 'food',
    travel: 'travel',
    gallery: 'gallery',
    marketplace: 'marketplace',
    shop: 'shop',
  };
  return paths[pageType] || pageType;
}

// AI Metadata generation prompt builder
export function buildAIMetadataPrompt(pageType: PageType, entity: SEOEntity): string {
  return `Generate SEO metadata for a ${pageType} page about "${entity.name || entity.title}" in Uttarakhand, India.

Context:
- Name: ${entity.name || entity.title}
- Description: ${entity.description || entity.excerpt || 'N/A'}
- District: ${entity.district_name || entity.district || 'Uttarakhand'}
- Category: ${entity.category || 'Tourism'}

Generate:
1. SEO Title (max 60 chars, include main keyword)
2. Meta Description (max 160 chars, include target keywords naturally)
3. Keywords (comma-separated, 8-12 keywords)
4. OG Title (compelling, max 70 chars)
5. OG Description (max 200 chars)
6. SEO Score (1-100) based on keyword relevance and optimization
7. Improvement suggestions (2-3 bullet points)

Target keywords to include where natural:
- Uttarakhand
- ${entity.district_name || entity.district || 'Himalayan'}
- ${entity.name || entity.title}
- tourism, travel, culture

Format as JSON with keys: seo_title, meta_description, keywords, og_title, og_description, seo_score, improvements`;
}
