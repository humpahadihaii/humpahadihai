// SEO Generator Engine for Hum Pahadi Haii
// Handles metadata, schema.org JSON-LD, keywords, and OG tags

export type PageType = 
  | 'homepage' 
  | 'village' 
  | 'district' 
  | 'marketplace_provider' 
  | 'marketplace_listing'
  | 'listing' 
  | 'travel_package' 
  | 'product' 
  | 'story' 
  | 'event' 
  | 'static_page' 
  | 'thoughts'
  | 'thought'
  | 'festivals'
  | 'culture'
  | 'food'
  | 'travel'
  | 'gallery'
  | 'marketplace'
  | 'shop'
  | 'category'
  | 'tag';

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
  latitude?: number;
  longitude?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  noIndex?: boolean;
  page?: number;
  isFiltered?: boolean;
  isSearch?: boolean;
  isAdmin?: boolean;
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
  breadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface RelatedItem {
  id: string;
  type: PageType;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  priority?: number;
  promoted?: boolean;
}

const SITE_NAME = "Hum Pahadi Haii";
const SITE_URL = "https://humpahadihaii.in";
const DEFAULT_IMAGE = "/logo.jpg";
const DEFAULT_OG_IMAGE = "https://humpahadihaii.in/logo.jpg";
const TITLE_SUFFIX = " | Hum Pahadi Haii";
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;
const MAX_KEYWORDS = 15;

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
  category: [
    "{{name}} in Uttarakhand",
    "{{name}} tourism",
    "best {{name}} Uttarakhand",
  ],
  tag: [
    "{{name}} Uttarakhand",
    "{{name}} Pahadi",
  ],
};

// SEO Templates per page type
const TEMPLATES: Record<string, { title: string; description: string }> = {
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
  marketplace_listing: {
    title: "{{name}} — {{category}} in {{district}}, Uttarakhand | Book Now",
    description: "{{description}} Located in {{district}}, Uttarakhand. Book your stay or experience today.",
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
  thought: {
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
  category: {
    title: "{{name}} — Browse {{category}} in Uttarakhand",
    description: "Explore {{name}} category. Find the best {{category}} options in Uttarakhand for your travel and cultural needs.",
  },
  tag: {
    title: "{{name}} — Tagged Content from Uttarakhand",
    description: "Browse all content tagged with {{name}}. Discover stories, places, and experiences related to {{name}} in Uttarakhand.",
  },
};

// ============= HELPER FUNCTIONS =============

/**
 * Strip all HTML tags from text
 */
export function stripHTML(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string | undefined | null, maxLength: number): string {
  if (!text) return "";
  const clean = stripHTML(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Clean and normalize summary text
 */
export function cleanSummary(text: string | undefined, maxLength = MAX_DESCRIPTION_LENGTH): string {
  if (!text) return "";
  return stripHTML(text)
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?'-]/g, '') // Remove special chars except basic punctuation
    .trim()
    .substring(0, maxLength)
    .trim();
}

/**
 * Generate canonical URL with proper formatting
 */
export function canonicalUrl(path: string): string {
  let cleanPath = path.toLowerCase().replace(/\/+$/, ''); // Remove trailing slashes
  if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
  if (cleanPath === '/') return SITE_URL;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Fallback title when entity title is missing
 */
export function fallbackTitle(entity: SEOEntity, pageType: PageType): string {
  const name = entity.name || entity.title || '';
  if (name) return truncate(name, MAX_TITLE_LENGTH - TITLE_SUFFIX.length);
  
  const typeLabels: Record<string, string> = {
    village: 'Village in Uttarakhand',
    district: 'District of Uttarakhand',
    marketplace_provider: 'Tourism Service Provider',
    marketplace_listing: 'Tourism Listing',
    listing: 'Tourism Listing',
    travel_package: 'Travel Package',
    product: 'Pahadi Product',
    story: 'Story from Uttarakhand',
    event: 'Event in Uttarakhand',
    thoughts: 'Thoughts from Uttarakhand',
    thought: 'Thought from Uttarakhand',
    festivals: 'Festival of Uttarakhand',
  };
  
  return typeLabels[pageType] || 'Hum Pahadi Haii';
}

/**
 * Fallback description when entity description is missing
 */
export function fallbackDescription(entity: SEOEntity, pageType: PageType): string {
  const template = TEMPLATES[pageType];
  if (template) {
    return cleanSummary(interpolate(template.description, {
      ...entity,
      highlights: entity.highlights || 'its natural beauty and cultural heritage',
      description: entity.description || 'Explore this destination in Uttarakhand.',
      excerpt: entity.excerpt || 'Discover more about Uttarakhand.',
    }), MAX_DESCRIPTION_LENGTH);
  }
  return "Discover the beauty and culture of Uttarakhand with Hum Pahadi Haii.";
}

/**
 * Get fallback OG image with proper formatting
 */
export function fallbackOGImage(entity: SEOEntity): string {
  if (entity.image) {
    // Ensure HTTPS and absolute URL
    if (entity.image.startsWith('http')) return entity.image;
    return `${SITE_URL}${entity.image.startsWith('/') ? '' : '/'}${entity.image}`;
  }
  return DEFAULT_OG_IMAGE;
}

/**
 * Validate JSON-LD schema for common issues
 */
export function validateSchema(schema: object | object[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const checkSchema = (s: any) => {
    if (!s['@context']) errors.push('Missing @context');
    if (!s['@type']) errors.push('Missing @type');
    if (s.name === undefined && s.headline === undefined) errors.push('Missing name or headline');
    if (s.url && !s.url.startsWith('http')) errors.push('URL must be absolute');
    if (s.image && typeof s.image === 'string' && !s.image.startsWith('http')) {
      errors.push('Image URL must be absolute');
    }
    // Check for empty required fields
    if (s.description === '') errors.push('Description should not be empty');
  };
  
  if (Array.isArray(schema)) {
    schema.forEach(checkSchema);
  } else {
    checkSchema(schema);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Determine if page should be noindex
 */
export function shouldNoIndex(entity: SEOEntity, pageType: PageType): boolean {
  // Explicit noIndex flag
  if (entity.noIndex) return true;
  
  // Admin pages
  if (entity.isAdmin) return true;
  
  // Search results
  if (entity.isSearch) return true;
  
  // Paginated pages (page > 1)
  if (entity.page && entity.page > 1) return true;
  
  // Filtered results
  if (entity.isFiltered) return true;
  
  // Draft/unpublished content
  if (entity.status === 'draft' || entity.status === 'unpublished') return true;
  
  return false;
}

// Template interpolation helper
function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key] || data[key.toLowerCase()] || '';
    return stripHTML(String(value));
  });
}

// ============= SCHEMA GENERATORS =============

function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function generateGeoCoordinates(entity: SEOEntity): object | undefined {
  if (entity.latitude && entity.longitude) {
    return {
      "@type": "GeoCoordinates",
      latitude: entity.latitude,
      longitude: entity.longitude,
    };
  }
  return undefined;
}

// Schema.org templates
const SCHEMA_TEMPLATES: Record<string, (entity: SEOEntity) => object | object[]> = {
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
      logo: DEFAULT_OG_IMAGE,
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
    name: entity.name || fallbackTitle(entity, 'village'),
    description: cleanSummary(entity.description || entity.excerpt, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/villages/${entity.slug}`),
    address: {
      "@type": "PostalAddress",
      addressRegion: entity.district_name || entity.district || "Uttarakhand",
      addressCountry: "IN",
    },
    geo: generateGeoCoordinates(entity),
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Uttarakhand",
    },
  }),
  district: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `${entity.name} District`,
    description: cleanSummary(entity.description || entity.overview, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/districts/${entity.slug}`),
    address: {
      "@type": "PostalAddress",
      addressRegion: entity.name,
      addressCountry: "IN",
    },
    geo: generateGeoCoordinates(entity),
  }),
  marketplace_provider: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": entity.type === 'homestay' || entity.type === 'hotel' ? "LodgingBusiness" : "LocalBusiness",
    name: entity.name || fallbackTitle(entity, 'marketplace_provider'),
    description: cleanSummary(entity.description, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/marketplace/provider/${entity.slug || entity.id}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: entity.location,
      addressRegion: entity.district || "Uttarakhand",
      addressCountry: "IN",
    },
    geo: generateGeoCoordinates(entity),
    ...(entity.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: entity.rating,
        bestRating: 5,
        worstRating: 1,
        reviewCount: entity.reviews_count || 1,
      },
    }),
    ...(entity.price && {
      priceRange: `₹${entity.price}`,
    }),
  }),
  marketplace_listing: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": entity.category === 'stay' ? "LodgingBusiness" : "TouristTrip",
    name: entity.name || entity.title || fallbackTitle(entity, 'marketplace_listing'),
    description: cleanSummary(entity.description, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/marketplace/${entity.slug || entity.id}`),
    address: {
      "@type": "PostalAddress",
      addressRegion: entity.district || "Uttarakhand",
      addressCountry: "IN",
    },
    geo: generateGeoCoordinates(entity),
    ...(entity.price && {
      offers: {
        "@type": "Offer",
        price: entity.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    }),
  }),
  listing: (entity: SEOEntity) => SCHEMA_TEMPLATES.marketplace_listing(entity),
  travel_package: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: entity.name || entity.title || fallbackTitle(entity, 'travel_package'),
    description: cleanSummary(entity.description || entity.short_description, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/travel-packages/${entity.slug}`),
    touristType: ["Adventure Traveler", "Nature Lover", "Cultural Tourist"],
    ...(entity.duration && {
      itinerary: {
        "@type": "ItemList",
        numberOfItems: parseInt(entity.duration) || 1,
        description: `${entity.duration} days tour`,
      },
    }),
    ...(entity.price && {
      offers: {
        "@type": "Offer",
        price: entity.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    }),
  }),
  product: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: entity.name || fallbackTitle(entity, 'product'),
    description: cleanSummary(entity.description || entity.short_description, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/products/${entity.slug}`),
    brand: {
      "@type": "Brand",
      name: "Hum Pahadi Haii",
    },
    ...(entity.category && {
      category: entity.category,
    }),
    ...(entity.price && {
      offers: {
        "@type": "Offer",
        price: entity.price,
        priceCurrency: "INR",
        availability: entity.stock_status === 'out_of_stock' 
          ? "https://schema.org/OutOfStock" 
          : "https://schema.org/InStock",
      },
    }),
    ...(entity.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: entity.rating,
        bestRating: 5,
        reviewCount: entity.reviews_count || 1,
      },
    }),
  }),
  story: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: truncate(entity.title, 110),
    description: cleanSummary(entity.excerpt, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/stories/${entity.slug}`),
    author: {
      "@type": "Person",
      name: entity.author || entity.author_name || "Hum Pahadi Haii",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
    datePublished: entity.date || entity.published_at || new Date().toISOString(),
    dateModified: entity.updated_at || entity.date || new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl(`/stories/${entity.slug}`),
    },
  }),
  event: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: entity.name || entity.title || fallbackTitle(entity, 'event'),
    description: cleanSummary(entity.description, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/events/${entity.slug}`),
    startDate: entity.date || entity.event_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: entity.location || "Uttarakhand",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Uttarakhand",
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }),
  thoughts: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: truncate(entity.title, 110),
    description: cleanSummary(entity.excerpt, 300),
    image: fallbackOGImage(entity),
    url: canonicalUrl(`/thoughts/${entity.slug}`),
    author: {
      "@type": "Person",
      name: entity.author || entity.author_name || "Hum Pahadi Haii",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
    datePublished: entity.date || entity.published_at || new Date().toISOString(),
    mainEntityOfPage: canonicalUrl(`/thoughts/${entity.slug}`),
  }),
  thought: (entity: SEOEntity) => SCHEMA_TEMPLATES.thoughts(entity),
  festivals: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: entity.name || fallbackTitle(entity, 'festivals'),
    description: cleanSummary(entity.description, 300),
    image: fallbackOGImage(entity),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
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
  category: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: entity.name,
    description: cleanSummary(entity.description, 300),
    url: canonicalUrl(`/category/${entity.slug}`),
  }),
  tag: (entity: SEOEntity) => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: entity.name,
    description: cleanSummary(entity.description, 300),
    url: canonicalUrl(`/tag/${entity.slug}`),
  }),
};

// ============= MAIN GENERATORS =============

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
  } else if (['marketplace_provider', 'marketplace_listing', 'listing', 'marketplace'].includes(pageType)) {
    clusterKey = 'marketplace';
  } else if (pageType === 'travel_package' || pageType === 'travel') {
    clusterKey = 'travel_package';
  } else if (pageType === 'product' || pageType === 'shop') {
    clusterKey = 'product';
  } else if (pageType === 'festivals' || pageType === 'event') {
    clusterKey = 'festivals';
  } else if (pageType === 'category') {
    clusterKey = 'category';
  } else if (pageType === 'tag') {
    clusterKey = 'tag';
  }

  const cluster = KEYWORD_CLUSTERS[clusterKey] || [];
  const interpolatedKeywords = cluster.map(kw => interpolate(kw, {
    name: entity.name || entity.title || '',
    district: entity.district_name || entity.district || '',
    category: entity.category || '',
  })).filter(kw => kw && !kw.includes('{{'));

  const allKeywords = [...baseKeywords, ...interpolatedKeywords];
  
  if (entity.name) allKeywords.push(entity.name);
  if (entity.title && entity.title !== entity.name) allKeywords.push(entity.title);
  if (entity.district) allKeywords.push(entity.district);
  if (entity.district_name && entity.district_name !== entity.district) allKeywords.push(entity.district_name);
  if (entity.region) allKeywords.push(entity.region);
  if (entity.category) allKeywords.push(entity.category);

  // Dedupe and limit
  const unique = [...new Set(allKeywords.map(k => k.toLowerCase()))];
  return unique.slice(0, MAX_KEYWORDS).join(', ');
}

export function generateSchema(pageType: PageType, entity: SEOEntity): object | object[] {
  const schemaGenerator = SCHEMA_TEMPLATES[pageType];
  
  if (schemaGenerator) {
    return schemaGenerator(entity);
  }

  // Default WebPage schema for unknown types
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: entity.title || entity.name || fallbackTitle(entity, pageType),
    description: cleanSummary(entity.description || entity.excerpt, 300),
    url: canonicalUrl(`/${getPathForType(pageType)}/${entity.slug || ''}`),
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
  
  const title = truncate(interpolate(template.title, entity), 70);
  const description = cleanSummary(interpolate(template.description, entity), 200);
  
  let ogType = 'website';
  if (['story', 'thoughts', 'thought'].includes(pageType)) ogType = 'article';
  else if (['product'].includes(pageType)) ogType = 'product';
  else if (['event', 'festivals'].includes(pageType)) ogType = 'event';
  else if (['village', 'district'].includes(pageType)) ogType = 'place';

  return {
    ogTitle: title,
    ogDescription: description,
    ogImage: fallbackOGImage(entity),
    ogType,
    ogUrl: canonicalUrl(`/${getPathForType(pageType)}/${entity.slug || ''}`),
  };
}

export function generateBreadcrumbs(pageType: PageType, entity: SEOEntity): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: SITE_URL },
  ];

  const pathMap: Partial<Record<PageType, { name: string; path: string }>> = {
    village: { name: 'Villages', path: '/villages' },
    district: { name: 'Districts', path: '/districts' },
    marketplace_provider: { name: 'Marketplace', path: '/marketplace' },
    marketplace_listing: { name: 'Marketplace', path: '/marketplace' },
    listing: { name: 'Marketplace', path: '/marketplace' },
    travel_package: { name: 'Travel Packages', path: '/travel-packages' },
    product: { name: 'Shop', path: '/shop' },
    story: { name: 'Stories', path: '/stories' },
    event: { name: 'Events', path: '/events' },
    thoughts: { name: 'Thoughts', path: '/thoughts' },
    thought: { name: 'Thoughts', path: '/thoughts' },
    festivals: { name: 'Festivals', path: '/festivals' },
    culture: { name: 'Culture', path: '/culture' },
    food: { name: 'Food', path: '/food' },
    travel: { name: 'Travel', path: '/travel' },
    gallery: { name: 'Gallery', path: '/gallery' },
    shop: { name: 'Shop', path: '/shop' },
    marketplace: { name: 'Marketplace', path: '/marketplace' },
  };

  const section = pathMap[pageType];
  if (section) {
    breadcrumbs.push({ name: section.name, url: canonicalUrl(section.path) });
  }

  // Add district breadcrumb for villages
  if (pageType === 'village' && entity.district_name) {
    breadcrumbs.push({
      name: entity.district_name,
      url: canonicalUrl(`/districts/${entity.district_slug || entity.district_name.toLowerCase()}`),
    });
  }

  // Add current page
  if (entity.name || entity.title) {
    breadcrumbs.push({
      name: entity.name || entity.title || '',
      url: canonicalUrl(`/${getPathForType(pageType)}/${entity.slug || ''}`),
    });
  }

  return breadcrumbs;
}

export function generateMeta(pageType: PageType, entity: SEOEntity = {}): SEOMeta {
  const template = TEMPLATES[pageType] || TEMPLATES.static_page;
  
  // Generate title with fallbacks
  let rawTitle = entity.seo_title || interpolate(template.title, entity);
  if (!rawTitle || rawTitle.includes('{{')) {
    rawTitle = fallbackTitle(entity, pageType);
  }
  const title = pageType === 'homepage' 
    ? truncate(rawTitle, MAX_TITLE_LENGTH)
    : truncate(rawTitle, MAX_TITLE_LENGTH - TITLE_SUFFIX.length) + TITLE_SUFFIX;
  
  // Generate description with fallbacks
  let description = entity.seo_description || interpolate(template.description, {
    ...entity,
    highlights: entity.highlights || 'its natural beauty and cultural heritage',
    description: entity.description || '',
    excerpt: entity.excerpt || '',
  });
  if (!description || description.includes('{{')) {
    description = fallbackDescription(entity, pageType);
  }
  description = cleanSummary(description, MAX_DESCRIPTION_LENGTH);

  const keywords = entity.seo_keywords || generateKeywords(entity, pageType);
  const canonical = canonicalUrl(
    entity.slug 
      ? `/${getPathForType(pageType)}/${entity.slug}` 
      : `/${getPathForType(pageType)}`
  );
  const og = generateOG(entity, pageType);
  const schema = generateSchema(pageType, entity);
  const breadcrumbs = generateBreadcrumbs(pageType, entity);
  const noIndex = shouldNoIndex(entity, pageType);

  // Combine schema with breadcrumbs
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const combinedSchema = Array.isArray(schema) 
    ? [...schema, breadcrumbSchema] 
    : [schema, breadcrumbSchema];

  return {
    title,
    description,
    keywords,
    canonical,
    ...og,
    twitterCard: 'summary_large_image',
    twitterTitle: og.ogTitle,
    twitterDescription: og.ogDescription,
    twitterImage: og.ogImage,
    schema: combinedSchema,
    noIndex,
    breadcrumbs,
  };
}

function getPathForType(pageType: PageType): string {
  const paths: Record<PageType, string> = {
    homepage: '',
    village: 'villages',
    district: 'districts',
    marketplace_provider: 'marketplace/provider',
    marketplace_listing: 'marketplace',
    listing: 'marketplace',
    travel_package: 'travel-packages',
    product: 'products',
    story: 'stories',
    event: 'events',
    static_page: '',
    thoughts: 'thoughts',
    thought: 'thoughts',
    festivals: 'festivals',
    culture: 'culture',
    food: 'food',
    travel: 'travel',
    gallery: 'gallery',
    marketplace: 'marketplace',
    shop: 'shop',
    category: 'category',
    tag: 'tag',
  };
  return paths[pageType] || pageType;
}

// ============= AI METADATA GENERATION =============

export function buildAIMetadataPrompt(pageType: PageType, entity: SEOEntity): string {
  return `Generate SEO metadata for a ${pageType} page about "${entity.name || entity.title}" in Uttarakhand, India.

Context:
- Name: ${entity.name || entity.title}
- Description: ${stripHTML(entity.description || entity.excerpt || 'N/A').substring(0, 500)}
- District: ${entity.district_name || entity.district || 'Uttarakhand'}
- Category: ${entity.category || 'Tourism'}
- Region: ${entity.region || 'Uttarakhand'}

Generate:
1. SEO Title (max 60 chars, include main keyword, no special characters)
2. Meta Description (max 160 chars, include target keywords naturally, compelling call-to-action)
3. Keywords (comma-separated, 8-12 keywords, include location-based terms)
4. OG Title (compelling, max 70 chars)
5. OG Description (max 200 chars, social media optimized)
6. SEO Score (1-100) based on keyword relevance and optimization
7. Improvement suggestions (2-3 bullet points)

Target keywords to include where natural:
- Uttarakhand
- ${entity.district_name || entity.district || 'Himalayan'}
- ${entity.name || entity.title}
- tourism, travel, culture, Pahadi

Format as JSON with keys: seo_title, meta_description, keywords, og_title, og_description, seo_score, improvements`;
}

// ============= INTERNAL LINKING ENGINE =============

export interface InternalLinkingConfig {
  maxRelatedItems: number;
  prioritizePromoted: boolean;
  includeTypes: PageType[];
}

export const DEFAULT_LINKING_CONFIG: InternalLinkingConfig = {
  maxRelatedItems: 6,
  prioritizePromoted: true,
  includeTypes: ['village', 'listing', 'travel_package', 'product', 'story'],
};

/**
 * Get related items configuration for a page type
 */
export function getRelatedItemsConfig(pageType: PageType): {
  sections: Array<{ type: PageType; label: string; limit: number }>;
} {
  const configs: Partial<Record<PageType, { sections: Array<{ type: PageType; label: string; limit: number }> }>> = {
    village: {
      sections: [
        { type: 'village', label: 'Nearby Villages', limit: 4 },
        { type: 'listing', label: 'Local Stays & Experiences', limit: 6 },
        { type: 'travel_package', label: 'Travel Packages', limit: 4 },
        { type: 'product', label: 'Local Products', limit: 4 },
        { type: 'story', label: 'Related Stories', limit: 3 },
      ],
    },
    travel_package: {
      sections: [
        { type: 'village', label: 'Villages Included', limit: 6 },
        { type: 'listing', label: 'Recommended Stays', limit: 4 },
        { type: 'product', label: 'Local Products', limit: 4 },
      ],
    },
    product: {
      sections: [
        { type: 'village', label: 'From This Village', limit: 3 },
        { type: 'product', label: 'Similar Products', limit: 6 },
        { type: 'listing', label: 'Local Artisans', limit: 3 },
      ],
    },
    listing: {
      sections: [
        { type: 'village', label: 'Nearby Villages', limit: 4 },
        { type: 'travel_package', label: 'Related Packages', limit: 4 },
        { type: 'listing', label: 'Similar Listings', limit: 4 },
      ],
    },
    district: {
      sections: [
        { type: 'village', label: 'Popular Villages', limit: 6 },
        { type: 'listing', label: 'Top Stays', limit: 6 },
        { type: 'travel_package', label: 'Travel Packages', limit: 4 },
        { type: 'story', label: 'Stories from ' + 'District', limit: 3 },
      ],
    },
  };

  return configs[pageType] || { sections: [] };
}

/**
 * Sort related items by priority and promotion status
 */
export function sortRelatedItems(items: RelatedItem[], prioritizePromoted = true): RelatedItem[] {
  return [...items].sort((a, b) => {
    if (prioritizePromoted) {
      if (a.promoted && !b.promoted) return -1;
      if (!a.promoted && b.promoted) return 1;
    }
    return (b.priority || 0) - (a.priority || 0);
  });
}
