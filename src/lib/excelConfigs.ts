import type { ExcelConfig } from "@/hooks/useExcelOperations";

// Content Sections
export const contentSectionsExcelConfig: ExcelConfig = {
  tableName: "cms_content_sections",
  sheetName: "ContentSections",
  columns: [
    { key: "id", header: "ID" },
    { key: "slug", header: "Slug", required: true },
    { key: "title", header: "Title", required: true },
    { key: "subtitle", header: "Subtitle" },
    { key: "body", header: "Body" },
    { key: "section_image", header: "Image URL" },
    { key: "display_order", header: "Order", type: "number" },
    { key: "is_published", header: "Published", type: "boolean" },
  ],
};

// Stories
export const storiesExcelConfig: ExcelConfig = {
  tableName: "cms_stories",
  sheetName: "Stories",
  columns: [
    { key: "id", header: "ID" },
    { key: "title", header: "Title", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "excerpt", header: "Excerpt" },
    { key: "body", header: "Body" },
    { key: "cover_image_url", header: "Cover Image URL" },
    { key: "category", header: "Category", required: true },
    { key: "author_name", header: "Author Name" },
    { key: "status", header: "Status" },
  ],
};

// Events
export const eventsExcelConfig: ExcelConfig = {
  tableName: "cms_events",
  sheetName: "Events",
  columns: [
    { key: "id", header: "ID" },
    { key: "title", header: "Title", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "description", header: "Description" },
    { key: "location", header: "Location" },
    { key: "event_date", header: "Event Date", type: "date" },
    { key: "banner_image_url", header: "Banner Image URL" },
    { key: "is_featured", header: "Featured", type: "boolean" },
    { key: "status", header: "Status" },
  ],
};

// Pages
export const pagesExcelConfig: ExcelConfig = {
  tableName: "cms_pages",
  sheetName: "Pages",
  columns: [
    { key: "id", header: "ID" },
    { key: "title", header: "Title", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "body", header: "Body" },
    { key: "meta_title", header: "Meta Title" },
    { key: "meta_description", header: "Meta Description" },
    { key: "status", header: "Status" },
  ],
};

// Footer Links
export const footerLinksExcelConfig: ExcelConfig = {
  tableName: "cms_footer_links",
  sheetName: "FooterLinks",
  columns: [
    { key: "id", header: "ID" },
    { key: "label", header: "Label", required: true },
    { key: "page_slug", header: "Page Slug" },
    { key: "url", header: "External URL" },
    { key: "display_order", header: "Order", type: "number" },
    { key: "is_external", header: "Is External", type: "boolean" },
  ],
};

// Districts
export const districtsExcelConfig: ExcelConfig = {
  tableName: "districts",
  sheetName: "Districts",
  columns: [
    { key: "id", header: "ID" },
    { key: "name", header: "Name", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "overview", header: "Overview", required: true },
    { key: "region", header: "Region" },
    { key: "geography", header: "Geography" },
    { key: "population", header: "Population" },
    { key: "cultural_identity", header: "Cultural Identity" },
    { key: "famous_specialties", header: "Famous Specialties" },
    { key: "local_languages", header: "Local Languages" },
    { key: "connectivity", header: "Connectivity" },
    { key: "best_time_to_visit", header: "Best Time to Visit" },
    { key: "latitude", header: "Latitude", type: "number" },
    { key: "longitude", header: "Longitude", type: "number" },
    { key: "image_url", header: "Image URL" },
    { key: "banner_image", header: "Banner Image" },
    { key: "status", header: "Status" },
    { key: "sort_order", header: "Sort Order", type: "number" },
  ],
};

// District Places
export const districtPlacesExcelConfig: ExcelConfig = {
  tableName: "district_places",
  sheetName: "DistrictPlaces",
  columns: [
    { key: "id", header: "ID" },
    { key: "district_id", header: "District ID" },
    { key: "name", header: "Name", required: true },
    { key: "short_description", header: "Short Description" },
    { key: "full_description", header: "Full Description" },
    { key: "image_url", header: "Image URL" },
    { key: "google_maps_url", header: "Google Maps URL" },
    { key: "map_lat", header: "Latitude", type: "number" },
    { key: "map_lng", header: "Longitude", type: "number" },
    { key: "is_highlighted", header: "Highlighted", type: "boolean" },
    { key: "is_active", header: "Active", type: "boolean" },
    { key: "sort_order", header: "Sort Order", type: "number" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
};

// District Foods
export const districtFoodsExcelConfig: ExcelConfig = {
  tableName: "district_foods",
  sheetName: "DistrictFoods",
  columns: [
    { key: "id", header: "ID" },
    { key: "district_id", header: "District ID" },
    { key: "name", header: "Name", required: true },
    { key: "description", header: "Description" },
    { key: "image_url", header: "Image URL" },
    { key: "is_active", header: "Active", type: "boolean" },
    { key: "sort_order", header: "Sort Order", type: "number" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
};

// District Festivals
export const districtFestivalsExcelConfig: ExcelConfig = {
  tableName: "district_festivals",
  sheetName: "DistrictFestivals",
  columns: [
    { key: "id", header: "ID" },
    { key: "district_id", header: "District ID" },
    { key: "name", header: "Name", required: true },
    { key: "month", header: "Month" },
    { key: "description", header: "Description" },
    { key: "image_url", header: "Image URL" },
    { key: "is_active", header: "Active", type: "boolean" },
    { key: "sort_order", header: "Sort Order", type: "number" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
};

// Villages
export const villagesExcelConfig: ExcelConfig = {
  tableName: "villages",
  sheetName: "Villages",
  columns: [
    { key: "id", header: "ID" },
    { key: "district_id", header: "District ID" },
    { key: "name", header: "Name", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "introduction", header: "Introduction", required: true },
    { key: "history", header: "History" },
    { key: "traditions", header: "Traditions" },
    { key: "festivals", header: "Festivals" },
    { key: "foods", header: "Foods" },
    { key: "handicrafts", header: "Handicrafts" },
    { key: "tehsil", header: "Tehsil" },
    { key: "population", header: "Population", type: "number" },
    { key: "latitude", header: "Latitude", type: "number" },
    { key: "longitude", header: "Longitude", type: "number" },
    { key: "thumbnail_url", header: "Thumbnail URL" },
    { key: "status", header: "Status" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
};

// District Hotels
export const districtHotelsExcelConfig: ExcelConfig = {
  tableName: "district_hotels",
  sheetName: "Hotels",
  columns: [
    { key: "id", header: "ID" },
    { key: "district_id", header: "District ID" },
    { key: "name", header: "Name", required: true },
    { key: "description", header: "Description" },
    { key: "category", header: "Category", required: true },
    { key: "location", header: "Location" },
    { key: "contact_info", header: "Contact Info" },
    { key: "website", header: "Website" },
    { key: "price_range", header: "Price Range" },
    { key: "rating", header: "Rating", type: "number" },
    { key: "image_url", header: "Image URL" },
    { key: "latitude", header: "Latitude", type: "number" },
    { key: "longitude", header: "Longitude", type: "number" },
    { key: "status", header: "Status" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
};

// Tourism Providers
export const tourismProvidersExcelConfig: ExcelConfig = {
  tableName: "tourism_providers",
  sheetName: "TourismProviders",
  columns: [
    { key: "id", header: "ID" },
    { key: "district_id", header: "District ID" },
    { key: "village_id", header: "Village ID" },
    { key: "name", header: "Name", required: true },
    { key: "type", header: "Type", required: true },
    { key: "contact_name", header: "Contact Name" },
    { key: "phone", header: "Phone" },
    { key: "whatsapp", header: "WhatsApp" },
    { key: "email", header: "Email" },
    { key: "website_url", header: "Website URL" },
    { key: "description", header: "Description" },
    { key: "image_url", header: "Image URL" },
    { key: "rating", header: "Rating", type: "number" },
    { key: "is_verified", header: "Verified", type: "boolean" },
    { key: "is_active", header: "Active", type: "boolean" },
    { key: "is_sample", header: "Sample", type: "boolean" },
    { key: "source", header: "Source" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
    { key: "village_id", nameKey: "village_name", table: "villages", nameField: "name" },
  ],
};

// Tourism Listings
export const tourismListingsExcelConfig: ExcelConfig = {
  tableName: "tourism_listings",
  sheetName: "TourismListings",
  columns: [
    { key: "id", header: "ID" },
    { key: "provider_id", header: "Provider ID" },
    { key: "district_id", header: "District ID" },
    { key: "title", header: "Title", required: true },
    { key: "short_description", header: "Short Description" },
    { key: "full_description", header: "Full Description" },
    { key: "category", header: "Category", required: true },
    { key: "base_price", header: "Base Price", type: "number" },
    { key: "price_unit", header: "Price Unit" },
    { key: "image_url", header: "Image URL" },
    { key: "is_featured", header: "Featured", type: "boolean" },
    { key: "is_active", header: "Active", type: "boolean" },
    { key: "sort_order", header: "Sort Order", type: "number" },
    { key: "is_sample", header: "Sample", type: "boolean" },
  ],
  lookups: [
    { key: "provider_id", nameKey: "provider_name", table: "tourism_providers", nameField: "name" },
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
};

// Product Categories
export const productCategoriesExcelConfig: ExcelConfig = {
  tableName: "local_product_categories",
  sheetName: "ProductCategories",
  columns: [
    { key: "id", header: "ID" },
    { key: "name", header: "Name", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "description", header: "Description" },
    { key: "is_active", header: "Active", type: "boolean" },
    { key: "sort_order", header: "Sort Order", type: "number" },
  ],
};

// Products
export const productsExcelConfig: ExcelConfig = {
  tableName: "local_products",
  sheetName: "Products",
  columns: [
    { key: "id", header: "ID" },
    { key: "category_id", header: "Category ID" },
    { key: "name", header: "Name", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "short_description", header: "Short Description" },
    { key: "full_description", header: "Full Description" },
    { key: "price", header: "Price", type: "number" },
    { key: "price_currency", header: "Currency" },
    { key: "unit_label", header: "Unit Label" },
    { key: "stock_status", header: "Stock Status" },
    { key: "thumbnail_image_url", header: "Thumbnail URL" },
    { key: "is_featured", header: "Featured", type: "boolean" },
    { key: "is_active", header: "Active", type: "boolean" },
  ],
  lookups: [
    { key: "category_id", nameKey: "category_name", table: "local_product_categories", nameField: "name" },
  ],
};

// Promotion Packages
export const promotionPackagesExcelConfig: ExcelConfig = {
  tableName: "promotion_packages",
  sheetName: "PromotionPackages",
  columns: [
    { key: "id", header: "ID" },
    { key: "name", header: "Name", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "type", header: "Type", required: true },
    { key: "description", header: "Description" },
    { key: "deliverables", header: "Deliverables" },
    { key: "price", header: "Price", type: "number" },
    { key: "price_currency", header: "Currency" },
    { key: "duration_days", header: "Duration Days", type: "number" },
    { key: "is_active", header: "Active", type: "boolean" },
    { key: "sort_order", header: "Sort Order", type: "number" },
  ],
};

// Travel Packages
export const travelPackagesExcelConfig: ExcelConfig = {
  tableName: "travel_packages",
  sheetName: "TravelPackages",
  columns: [
    { key: "id", header: "ID" },
    { key: "title", header: "Title", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "short_description", header: "Short Description" },
    { key: "full_description", header: "Full Description" },
    { key: "destination", header: "Destination" },
    { key: "region", header: "Region" },
    { key: "duration_days", header: "Duration Days", type: "number" },
    { key: "difficulty_level", header: "Difficulty Level" },
    { key: "best_season", header: "Best Season" },
    { key: "starting_point", header: "Starting Point" },
    { key: "ending_point", header: "Ending Point" },
    { key: "price_per_person", header: "Price Per Person", type: "number" },
    { key: "price_currency", header: "Currency" },
    { key: "inclusions", header: "Inclusions" },
    { key: "exclusions", header: "Exclusions" },
    { key: "itinerary", header: "Itinerary" },
    { key: "thumbnail_image_url", header: "Thumbnail URL" },
    { key: "is_featured", header: "Featured", type: "boolean" },
    { key: "is_active", header: "Active", type: "boolean" },
  ],
};

// Gallery Items
export const galleryExcelConfig: ExcelConfig = {
  tableName: "gallery_items",
  sheetName: "Gallery",
  columns: [
    { key: "id", header: "ID" },
    { key: "title", header: "Title", required: true },
    { key: "description", header: "Description" },
    { key: "image_url", header: "Image URL", required: true },
    { key: "category", header: "Category", required: true },
    { key: "location", header: "Location" },
    { key: "taken_at", header: "Taken At", type: "date" },
    { key: "is_featured", header: "Featured", type: "boolean" },
  ],
};

// Content Items (Culture, Food, Travel, Thoughts)
export const contentItemsExcelConfig: ExcelConfig = {
  tableName: "content_items",
  sheetName: "ContentItems",
  columns: [
    { key: "id", header: "ID" },
    { key: "type", header: "Type", required: true },
    { key: "title", header: "Title", required: true },
    { key: "slug", header: "Slug", required: true },
    { key: "excerpt", header: "Excerpt" },
    { key: "body", header: "Body" },
    { key: "main_image_url", header: "Main Image URL" },
    { key: "district_id", header: "District ID" },
    { key: "status", header: "Status" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
};

// Festivals (global)
export const festivalsExcelConfig: ExcelConfig = {
  tableName: "festivals",
  sheetName: "Festivals",
  columns: [
    { key: "id", header: "ID" },
    { key: "name", header: "Name", required: true },
    { key: "description", header: "Description", required: true },
    { key: "month", header: "Month", type: "number" },
    { key: "region", header: "Region" },
    { key: "image_url", header: "Image URL" },
  ],
};

// Site Images
export const siteImagesExcelConfig: ExcelConfig = {
  tableName: "site_images",
  sheetName: "SiteImages",
  columns: [
    { key: "id", header: "ID" },
    { key: "key", header: "Key", required: true },
    { key: "title", header: "Title", required: true },
    { key: "description", header: "Description" },
    { key: "image_url", header: "Image URL", required: true },
    { key: "category", header: "Category", required: true },
  ],
};

// Thoughts
export const thoughtsExcelConfig: ExcelConfig = {
  tableName: "thoughts",
  sheetName: "Thoughts",
  columns: [
    { key: "id", header: "ID" },
    { key: "name", header: "Name", required: true },
    { key: "location", header: "Location", required: true },
    { key: "thought", header: "Thought", required: true },
    { key: "photo_url", header: "Photo URL" },
    { key: "sentiment", header: "Sentiment" },
    { key: "status", header: "Status" },
    { key: "likes_count", header: "Likes", type: "number" },
  ],
};

// Featured Highlights
export const featuredHighlightsExcelConfig: ExcelConfig = {
  tableName: "featured_highlights",
  sheetName: "FeaturedHighlights",
  columns: [
    { key: "id", header: "ID" },
    { key: "title", header: "Title", required: true },
    { key: "description", header: "Description", required: true },
    { key: "image_url", header: "Image URL", required: true },
    { key: "button_text", header: "Button Text", required: true },
    { key: "button_link", header: "Button Link", required: true },
    { key: "gradient_color", header: "Gradient Color", required: true },
    { key: "order_position", header: "Order", type: "number" },
    { key: "status", header: "Status" },
  ],
};

// Aliases for compatibility
export const hotelsExcelConfig = districtHotelsExcelConfig;
export const highlightsExcelConfig = {
  tableName: "district_highlights",
  sheetName: "DistrictHighlights",
  columns: [
    { key: "id", header: "ID" },
    { key: "district_id", header: "District ID" },
    { key: "name", header: "Name", required: true },
    { key: "type", header: "Type", required: true },
    { key: "description", header: "Description" },
    { key: "image_url", header: "Image URL" },
    { key: "status", header: "Status" },
  ],
  lookups: [
    { key: "district_id", nameKey: "district_name", table: "districts", nameField: "name" },
  ],
} as ExcelConfig;
