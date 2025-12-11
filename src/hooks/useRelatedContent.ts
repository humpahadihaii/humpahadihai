import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RelatedItem, PageType } from "@/lib/seo/generator";

/**
 * Fetch related content for internal linking
 */
export function useRelatedContent(pageType: PageType, districtId?: string, limit = 6) {
  return useQuery({
    queryKey: ['related-content', pageType, districtId, limit],
    queryFn: async (): Promise<Record<string, RelatedItem[]>> => {
      const results: Record<string, RelatedItem[]> = {};

      // Fetch related listings
      const { data: listings } = await supabase
        .from('tourism_listings')
        .select('id, title, image_url, short_description, is_featured')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(limit) as { data: any[] | null };

      results.listings = (listings || []).map((l) => ({
        id: l.id,
        type: 'listing' as PageType,
        name: l.title,
        slug: l.id,
        image: l.image_url,
        description: l.short_description,
        promoted: l.is_featured,
      }));

      // Fetch related travel packages
      const { data: packages } = await supabase
        .from('travel_packages')
        .select('id, title, slug, thumbnail_image_url, short_description, is_featured')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(limit) as { data: any[] | null };

      results.packages = (packages || []).map((p) => ({
        id: p.id,
        type: 'travel_package' as PageType,
        name: p.title,
        slug: p.slug,
        image: p.thumbnail_image_url,
        description: p.short_description,
        promoted: p.is_featured,
      }));

      // Fetch related products
      const { data: products } = await supabase
        .from('local_products')
        .select('id, name, slug, thumbnail_image_url, short_description, is_featured')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(limit) as { data: any[] | null };

      results.products = (products || []).map((p) => ({
        id: p.id,
        type: 'product' as PageType,
        name: p.name,
        slug: p.slug,
        image: p.thumbnail_image_url,
        description: p.short_description,
        promoted: p.is_featured,
      }));

      return results;
    },
    enabled: !!pageType,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch nearby villages based on district
 */
export function useNearbyVillages(districtId?: string, excludeId?: string, limit = 4) {
  return useQuery({
    queryKey: ['nearby-villages', districtId, excludeId, limit],
    queryFn: async (): Promise<RelatedItem[]> => {
      if (!districtId) return [];

      // @ts-ignore - Supabase type instantiation too deep
      const { data, error } = await supabase
        .from('villages')
        .select('id, name, slug, hero_image_url, description')
        .eq('is_active', true)
        .eq('district_id', districtId)
        .limit(limit + 1);

      if (error || !data) return [];

      return (data as any[])
        .filter((v) => v.id !== excludeId)
        .slice(0, limit)
        .map((v) => ({
          id: v.id,
          type: 'village' as PageType,
          name: v.name,
          slug: v.slug,
          image: v.hero_image_url,
          description: v.description?.substring(0, 100),
        }));
    },
    enabled: !!districtId,
    staleTime: 5 * 60 * 1000,
  });
}
