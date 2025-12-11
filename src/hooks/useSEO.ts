import { useMemo } from "react";
import { generateMeta, PageType, SEOEntity, SEOMeta } from "@/lib/seo/generator";

export type { PageType, SEOEntity, SEOMeta };

export function useSEO(pageType: PageType, entity: SEOEntity = {}): SEOMeta {
  return useMemo(() => generateMeta(pageType, entity), [pageType, entity]);
}

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
