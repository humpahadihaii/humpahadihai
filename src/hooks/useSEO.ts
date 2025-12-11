import { useMemo } from "react";
import { 
  generateMeta, 
  PageType, 
  SEOEntity, 
  SEOMeta,
  getRelatedItemsConfig,
  RelatedItem,
  sortRelatedItems,
  InternalLinkingConfig,
  DEFAULT_LINKING_CONFIG,
  shouldNoIndex,
} from "@/lib/seo/generator";

export type { PageType, SEOEntity, SEOMeta, RelatedItem, InternalLinkingConfig };

/**
 * Basic SEO hook for generating page metadata
 */
export function useSEO(pageType: PageType, entity: SEOEntity = {}): SEOMeta {
  return useMemo(() => generateMeta(pageType, entity), [pageType, entity]);
}

/**
 * Enhanced SEO hook with data loading support
 */
export function usePageSEO(
  pageType: PageType,
  data: SEOEntity | null | undefined,
  fallback: SEOEntity = {}
): SEOMeta {
  return useMemo(() => {
    const entity = data || fallback;
    return generateMeta(pageType, entity);
  }, [pageType, data, fallback]);
}

/**
 * Hook for pagination-aware SEO (handles noindex for page > 1)
 */
export function usePaginatedSEO(
  pageType: PageType,
  entity: SEOEntity,
  currentPage: number
): SEOMeta {
  return useMemo(() => {
    const paginatedEntity: SEOEntity = {
      ...entity,
      page: currentPage,
      noIndex: currentPage > 1,
    };
    return generateMeta(pageType, paginatedEntity);
  }, [pageType, entity, currentPage]);
}

/**
 * Hook for filtered/search results (always noindex)
 */
export function useFilteredSEO(
  pageType: PageType,
  entity: SEOEntity,
  hasFilters: boolean
): SEOMeta {
  return useMemo(() => {
    const filteredEntity: SEOEntity = {
      ...entity,
      isFiltered: hasFilters,
      noIndex: hasFilters,
    };
    return generateMeta(pageType, filteredEntity);
  }, [pageType, entity, hasFilters]);
}

/**
 * Hook to get internal linking configuration for a page type
 */
export function useRelatedItemsConfig(pageType: PageType) {
  return useMemo(() => getRelatedItemsConfig(pageType), [pageType]);
}

/**
 * Hook to sort and limit related items
 */
export function useSortedRelatedItems(
  items: RelatedItem[],
  limit: number = DEFAULT_LINKING_CONFIG.maxRelatedItems,
  prioritizePromoted: boolean = DEFAULT_LINKING_CONFIG.prioritizePromoted
): RelatedItem[] {
  return useMemo(() => {
    const sorted = sortRelatedItems(items, prioritizePromoted);
    return sorted.slice(0, limit);
  }, [items, limit, prioritizePromoted]);
}

/**
 * Determine if current page should be noindexed
 */
export function useNoIndexCheck(entity: SEOEntity, pageType: PageType): boolean {
  return useMemo(() => shouldNoIndex(entity, pageType), [entity, pageType]);
}
