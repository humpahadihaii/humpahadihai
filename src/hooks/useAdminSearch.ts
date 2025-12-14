import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RBACRole, isSuperAdmin, canAccessSection } from "@/lib/rbac";
import { useDebounce } from "@/hooks/useDebounce";

export interface AdminSearchResult {
  id: string;
  title: string;
  type: "district" | "village" | "category" | "subcategory" | "content" | "story" | "event" | "page" | "provider" | "listing" | "package" | "product" | "admin-page";
  typeLabel: string;
  parentInfo?: string;
  status?: string;
  route: string;
  matchContext?: string;
}

interface AdminPageConfig {
  id: string;
  title: string;
  keywords: string[];
  route: string;
  requiredSection: string;
}

const ADMIN_PAGES: AdminPageConfig[] = [
  { id: "cookie-consent", title: "Cookie Consent Settings", keywords: ["cookie", "consent", "gdpr", "privacy", "banner"], route: "/admin/cookie-consent", requiredSection: "/admin/cookie-consent" },
  { id: "site-settings", title: "Site Settings", keywords: ["site", "settings", "configuration", "config"], route: "/admin/site-settings", requiredSection: "/admin/site-settings" },
  { id: "homepage-ctas", title: "Homepage CTAs", keywords: ["cta", "call to action", "homepage", "buttons"], route: "/admin/homepage-ctas", requiredSection: "/admin/homepage-ctas" },
  { id: "analytics", title: "Analytics Dashboard", keywords: ["analytics", "stats", "statistics", "visitors", "traffic"], route: "/admin/analytics", requiredSection: "/admin/analytics" },
  { id: "user-management", title: "User Management", keywords: ["users", "user", "management", "roles", "permissions"], route: "/admin/users", requiredSection: "/admin/users" },
  { id: "map-settings", title: "Map Settings", keywords: ["map", "maps", "location", "coordinates"], route: "/admin/map-settings", requiredSection: "/admin/map-settings" },
  { id: "share-settings", title: "Share Settings", keywords: ["share", "social", "preview", "og", "opengraph"], route: "/admin/share-settings", requiredSection: "/admin/share-settings" },
  { id: "ai-settings", title: "AI Settings", keywords: ["ai", "artificial intelligence", "gemini", "api key"], route: "/admin/ai-settings", requiredSection: "/admin/ai-settings" },
  { id: "notify-settings", title: "Notification Settings", keywords: ["notify", "notification", "whatsapp", "email", "booking"], route: "/admin/notify-settings", requiredSection: "/admin/notify-settings" },
];

interface SearchConfig {
  table: string;
  titleField: string;
  type: AdminSearchResult["type"];
  typeLabel: string;
  routePrefix: string;
  parentField?: string;
  statusField?: string;
  searchFields: string[];
  requiredSection: string;
}

const SEARCH_CONFIGS: SearchConfig[] = [
  {
    table: "districts",
    titleField: "name",
    type: "district",
    typeLabel: "District",
    routePrefix: "/admin/districts",
    statusField: "status",
    searchFields: ["name", "description", "short_description"],
    requiredSection: "/admin/districts",
  },
  {
    table: "villages",
    titleField: "name",
    type: "village",
    typeLabel: "Village",
    routePrefix: "/admin/villages",
    statusField: "status",
    searchFields: ["name", "tagline", "description"],
    requiredSection: "/admin/villages",
  },
  {
    table: "content_categories",
    titleField: "name",
    type: "category",
    typeLabel: "Category",
    routePrefix: "/admin/cultural-categories",
    statusField: "status",
    searchFields: ["name", "description"],
    requiredSection: "/admin/content/culture",
  },
  {
    table: "content_subcategories",
    titleField: "name",
    type: "subcategory",
    typeLabel: "Subcategory",
    routePrefix: "/admin/cultural-subcategories",
    statusField: "status",
    searchFields: ["name", "description"],
    requiredSection: "/admin/content/culture",
  },
  {
    table: "cultural_content",
    titleField: "title",
    type: "content",
    typeLabel: "Cultural Content",
    routePrefix: "/admin/cultural-content",
    statusField: "status",
    searchFields: ["title", "short_intro", "cultural_significance", "origin_history"],
    requiredSection: "/admin/content/culture",
  },
  {
    table: "cms_stories",
    titleField: "title",
    type: "story",
    typeLabel: "Story",
    routePrefix: "/admin/stories",
    statusField: "status",
    searchFields: ["title", "excerpt", "body"],
    requiredSection: "/admin/stories",
  },
  {
    table: "cms_events",
    titleField: "title",
    type: "event",
    typeLabel: "Event",
    routePrefix: "/admin/events",
    statusField: "status",
    searchFields: ["title", "description", "location"],
    requiredSection: "/admin/events",
  },
  {
    table: "cms_pages",
    titleField: "title",
    type: "page",
    typeLabel: "Page",
    routePrefix: "/admin/pages",
    statusField: "status",
    searchFields: ["title", "body", "meta_title"],
    requiredSection: "/admin/pages",
  },
  {
    table: "tourism_providers",
    titleField: "name",
    type: "provider",
    typeLabel: "Provider",
    routePrefix: "/admin/tourism-providers",
    searchFields: ["name", "description", "address"],
    requiredSection: "/admin/tourism-providers",
  },
  {
    table: "tourism_listings",
    titleField: "title",
    type: "listing",
    typeLabel: "Listing",
    routePrefix: "/admin/tourism-listings",
    searchFields: ["title", "short_description", "full_description"],
    requiredSection: "/admin/tourism-listings",
  },
  {
    table: "travel_packages",
    titleField: "title",
    type: "package",
    typeLabel: "Travel Package",
    routePrefix: "/admin/travel-packages",
    searchFields: ["title", "short_description", "destination"],
    requiredSection: "/admin/travel-packages",
  },
  {
    table: "local_products",
    titleField: "name",
    type: "product",
    typeLabel: "Product",
    routePrefix: "/admin/products",
    searchFields: ["name", "short_description", "full_description"],
    requiredSection: "/admin/products",
  },
];

export function useAdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { roles } = useAuth();

  const debouncedQuery = useDebounce(query, 300);

  // Filter configs based on user's role permissions
  const accessibleConfigs = useMemo(() => {
    if (isSuperAdmin(roles as RBACRole[])) {
      return SEARCH_CONFIGS;
    }
    return SEARCH_CONFIGS.filter(config => 
      canAccessSection(roles as RBACRole[], config.requiredSection)
    );
  }, [roles]);

  // Filter admin pages based on user's role permissions
  const accessibleAdminPages = useMemo(() => {
    if (isSuperAdmin(roles as RBACRole[])) {
      return ADMIN_PAGES;
    }
    return ADMIN_PAGES.filter(page => 
      canAccessSection(roles as RBACRole[], page.requiredSection)
    );
  }, [roles]);

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const allResults: AdminSearchResult[] = [];

    try {
      // Search each accessible table in parallel
      const searchPromises = accessibleConfigs.map(async (config) => {
        try {
          // Use OR filter for multiple fields
          const orConditions = config.searchFields
            .map(field => `${field}.ilike.%${searchTerm}%`)
            .join(",");

          // Use type assertion to handle dynamic table names
          const { data, error } = await (supabase
            .from(config.table as any)
            .select("*")
            .or(orConditions)
            .limit(10) as any);

          if (error) {
            console.error(`Search error for ${config.table}:`, error);
            return [];
          }

          return (data || []).map((item: any) => ({
            id: item.id,
            title: item[config.titleField] || "Untitled",
            type: config.type,
            typeLabel: config.typeLabel,
            status: config.statusField ? item[config.statusField] : undefined,
            route: `${config.routePrefix}?edit=${item.id}`,
          }));
        } catch (err) {
          console.error(`Search error for ${config.table}:`, err);
          return [];
        }
      });

      const resultsArrays = await Promise.all(searchPromises);
      
      // Flatten and dedupe results
      resultsArrays.forEach(arr => allResults.push(...arr));

      // Add matching admin pages
      const lowerSearchTerm = searchTerm.toLowerCase();
      accessibleAdminPages.forEach(page => {
        const matchesTitle = page.title.toLowerCase().includes(lowerSearchTerm);
        const matchesKeyword = page.keywords.some(kw => kw.toLowerCase().includes(lowerSearchTerm));
        if (matchesTitle || matchesKeyword) {
          allResults.push({
            id: page.id,
            title: page.title,
            type: "admin-page",
            typeLabel: "Settings",
            route: page.route,
          });
        }
      });

      // Sort by relevance (exact match first, then partial)
      const lowerQuery = searchTerm.toLowerCase();
      allResults.sort((a, b) => {
        const aExact = a.title.toLowerCase() === lowerQuery;
        const bExact = b.title.toLowerCase() === lowerQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = a.title.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.title.toLowerCase().startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return a.title.localeCompare(b.title);
      });

      setResults(allResults.slice(0, 25)); // Limit to top 25 results
    } catch (error) {
      console.error("Admin search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [accessibleConfigs]);

  // Trigger search when debounced query changes
  useMemo(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, search]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
    hasResults: results.length > 0,
  };
}
