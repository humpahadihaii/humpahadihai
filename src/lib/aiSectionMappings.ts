// AI Output to Section Mapping Configuration
// Maps AI-generated content to correct database fields for each section

export type SectionKey =
  | "district_foods"
  | "district_festivals"
  | "district_places"
  | "district_content"
  | "travel_packages"
  | "tourism_listings"
  | "tourism_providers"
  | "local_products"
  | "cms_stories"
  | "thoughts"
  | "gallery_items"
  | "featured_highlights"
  | "cms_pages"
  | "promotion_packages";

export interface AIOutputSchema {
  title?: string;
  subtitle?: string;
  content?: string;
  short_description?: string;
  long_description?: string;
  tags?: string[];
  district?: string;
  district_id?: string;
  category?: string;
  images?: string[];
  price?: number;
  name?: string;
  location?: string;
  sentiment?: string;
  duration?: string;
  difficulty?: string;
  best_season?: string;
  inclusions?: string;
  exclusions?: string;
  itinerary?: string;
  destination?: string;
  [key: string]: any; // Allow additional properties
}

export interface SectionMapping {
  key: SectionKey;
  label: string;
  table: string;
  requiredFields: string[];
  fieldMapping: Record<string, string>; // AI field -> DB field
  defaultValues?: Record<string, any>;
}

export const SECTION_MAPPINGS: SectionMapping[] = [
  {
    key: "district_foods",
    label: "District Foods",
    table: "district_foods",
    requiredFields: ["name", "district_id"],
    fieldMapping: {
      title: "name",
      name: "name",
      long_description: "description",
      content: "description",
      short_description: "description",
    },
    defaultValues: {
      is_active: true,
      sort_order: 0,
    },
  },
  {
    key: "district_festivals",
    label: "District Festivals",
    table: "district_festivals",
    requiredFields: ["name", "district_id"],
    fieldMapping: {
      title: "name",
      name: "name",
      long_description: "description",
      content: "description",
      short_description: "description",
    },
    defaultValues: {
      is_active: true,
      sort_order: 0,
    },
  },
  {
    key: "district_places",
    label: "District Places",
    table: "district_places",
    requiredFields: ["name", "district_id"],
    fieldMapping: {
      title: "name",
      name: "name",
      short_description: "short_description",
      long_description: "full_description",
      content: "full_description",
    },
    defaultValues: {
      is_active: true,
      is_highlighted: false,
      sort_order: 0,
    },
  },
  {
    key: "district_content",
    label: "District Content",
    table: "district_content",
    requiredFields: ["title", "description", "district_id", "category"],
    fieldMapping: {
      title: "title",
      name: "title",
      long_description: "description",
      content: "description",
      short_description: "description",
      category: "category",
    },
    defaultValues: {},
  },
  {
    key: "travel_packages",
    label: "Travel Packages",
    table: "travel_packages",
    requiredFields: ["title"],
    fieldMapping: {
      title: "title",
      name: "title",
      short_description: "short_description",
      long_description: "full_description",
      content: "full_description",
      destination: "destination",
      difficulty: "difficulty_level",
      best_season: "best_season",
      inclusions: "inclusions",
      exclusions: "exclusions",
      itinerary: "itinerary",
      price: "price_per_person",
    },
    defaultValues: {
      is_active: true,
      is_featured: false,
      price_per_person: 0,
      price_currency: "INR",
    },
  },
  {
    key: "tourism_listings",
    label: "Marketplace Listings",
    table: "tourism_listings",
    requiredFields: ["title"],
    fieldMapping: {
      title: "title",
      name: "title",
      short_description: "short_description",
      long_description: "full_description",
      content: "full_description",
      category: "category",
      price: "price_per_night",
    },
    defaultValues: {
      is_active: true,
      is_featured: false,
      category: "stay",
    },
  },
  {
    key: "tourism_providers",
    label: "Marketplace Providers",
    table: "tourism_providers",
    requiredFields: ["name"],
    fieldMapping: {
      title: "name",
      name: "name",
      long_description: "description",
      content: "description",
      short_description: "description",
    },
    defaultValues: {
      is_active: true,
      is_verified: false,
      is_sample: false,
      type: "other",
      source: "ai_generated",
    },
  },
  {
    key: "local_products",
    label: "Shop Products",
    table: "local_products",
    requiredFields: ["name"],
    fieldMapping: {
      title: "name",
      name: "name",
      short_description: "short_description",
      long_description: "full_description",
      content: "full_description",
      tags: "tags",
      price: "price",
    },
    defaultValues: {
      is_active: true,
      is_featured: false,
      price: 0,
      price_currency: "INR",
      stock_status: "in_stock",
    },
  },
  {
    key: "cms_stories",
    label: "Stories",
    table: "cms_stories",
    requiredFields: ["title"],
    fieldMapping: {
      title: "title",
      name: "title",
      short_description: "excerpt",
      long_description: "body",
      content: "body",
      category: "category",
    },
    defaultValues: {
      status: "draft",
      category: "Culture",
    },
  },
  {
    key: "thoughts",
    label: "Thoughts",
    table: "thoughts",
    requiredFields: ["name", "thought", "location"],
    fieldMapping: {
      title: "name",
      name: "name",
      content: "thought",
      long_description: "thought",
      short_description: "thought",
      location: "location",
      sentiment: "sentiment",
    },
    defaultValues: {
      status: "pending",
      likes_count: 0,
    },
  },
  {
    key: "gallery_items",
    label: "Gallery",
    table: "gallery_items",
    requiredFields: ["title", "image_url", "category"],
    fieldMapping: {
      title: "title",
      name: "title",
      long_description: "description",
      content: "description",
      short_description: "description",
      category: "category",
      location: "location",
      tags: "tags",
    },
    defaultValues: {
      is_featured: false,
    },
  },
  {
    key: "featured_highlights",
    label: "Featured Highlights",
    table: "featured_highlights",
    requiredFields: ["title", "description", "image_url"],
    fieldMapping: {
      title: "title",
      name: "title",
      long_description: "description",
      content: "description",
      short_description: "description",
    },
    defaultValues: {
      status: "draft",
      order_position: 0,
      gradient_color: "from-orange-500 to-red-500",
      button_text: "Explore",
      button_link: "/",
    },
  },
  {
    key: "cms_pages",
    label: "CMS Pages",
    table: "cms_pages",
    requiredFields: ["title"],
    fieldMapping: {
      title: "title",
      name: "title",
      long_description: "body",
      content: "body",
      short_description: "meta_description",
    },
    defaultValues: {
      status: "draft",
    },
  },
  {
    key: "promotion_packages",
    label: "Promotion Packages",
    table: "promotion_packages",
    requiredFields: ["name"],
    fieldMapping: {
      title: "name",
      name: "name",
      long_description: "description",
      content: "description",
      short_description: "description",
      price: "price",
    },
    defaultValues: {
      is_active: true,
      price: 0,
      price_currency: "INR",
      type: "website",
      sort_order: 0,
    },
  },
];

export const getSectionMapping = (key: SectionKey): SectionMapping | undefined => {
  return SECTION_MAPPINGS.find((m) => m.key === key);
};

export const mapAIOutputToSection = (
  aiOutput: AIOutputSchema,
  sectionKey: SectionKey
): Record<string, any> | null => {
  const mapping = getSectionMapping(sectionKey);
  if (!mapping) return null;

  const result: Record<string, any> = { ...mapping.defaultValues };

  // Map AI fields to DB fields
  for (const [aiField, dbField] of Object.entries(mapping.fieldMapping)) {
    const value = aiOutput[aiField as keyof AIOutputSchema];
    if (value !== undefined && value !== null && value !== "") {
      result[dbField] = value;
    }
  }

  // Handle special cases
  if (aiOutput.district_id) {
    result.district_id = aiOutput.district_id;
  }

  // Handle tags array
  if (aiOutput.tags && Array.isArray(aiOutput.tags)) {
    if (mapping.fieldMapping.tags) {
      result[mapping.fieldMapping.tags] = aiOutput.tags;
    }
  }

  // Generate slug if needed
  if (result.title || result.name) {
    const slugBase = result.title || result.name;
    result.slug = slugBase
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 100) + "-" + Date.now().toString(36);
  }

  return result;
};

export const getMissingRequiredFields = (
  data: Record<string, any>,
  sectionKey: SectionKey
): string[] => {
  const mapping = getSectionMapping(sectionKey);
  if (!mapping) return [];

  return mapping.requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });
};

// Group sections for better UX
export const SECTION_GROUPS = [
  {
    label: "Districts",
    sections: ["district_foods", "district_festivals", "district_places", "district_content"],
  },
  {
    label: "Travel & Tourism",
    sections: ["travel_packages", "tourism_listings", "tourism_providers"],
  },
  {
    label: "Content",
    sections: ["cms_stories", "thoughts", "gallery_items"],
  },
  {
    label: "Commerce",
    sections: ["local_products", "promotion_packages"],
  },
  {
    label: "Site Content",
    sections: ["featured_highlights", "cms_pages"],
  },
];
