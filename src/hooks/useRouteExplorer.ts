import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RouteCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  cover_image: string | null;
  route_type: string;
  sort_order: number;
}

export interface RouteDistrict {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  overview: string | null;
  image_url: string | null;
  place_count?: number;
}

export interface PlaceGuide {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  cover_image: string | null;
  has_full_guide: boolean;
  district_id: string | null;
}

export function useRouteCategories() {
  return useQuery({
    queryKey: ["route-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("route_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as RouteCategory[];
    },
    staleTime: 1000 * 60 * 15, // 15 min cache
  });
}

export function useRouteCategoryDistricts(categoryId: string | null) {
  return useQuery({
    queryKey: ["route-category-districts", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];

      // First try to get linked districts
      const { data: linkedData, error: linkedError } = await supabase
        .from("route_category_districts")
        .select(`
          district_id,
          districts (
            id, name, slug, region, overview, image_url
          )
        `)
        .eq("route_category_id", categoryId)
        .order("sort_order", { ascending: true });

      if (linkedError) throw linkedError;

      // If we have linked districts, use them
      if (linkedData && linkedData.length > 0) {
        return linkedData
          .filter(d => d.districts)
          .map(d => d.districts as unknown as RouteDistrict);
      }

      // Fallback: get category to determine region type
      const { data: category } = await supabase
        .from("route_categories")
        .select("slug, route_type")
        .eq("id", categoryId)
        .single();

      if (!category) return [];

      // Get districts based on category type
      let query = supabase
        .from("districts")
        .select("id, name, slug, region, overview, image_url")
        .eq("status", "published")
        .order("name", { ascending: true });

      if (category.slug === "kumaon-region") {
        query = query.eq("region", "Kumaon");
      } else if (category.slug === "garhwal-region") {
        query = query.eq("region", "Garhwal");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RouteDistrict[];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 15,
  });
}

export function useDistrictPlaces(districtId: string | null) {
  return useQuery({
    queryKey: ["district-places-guides", districtId],
    queryFn: async () => {
      if (!districtId) return [];

      // First check place_guides table
      const { data: guides, error: guidesError } = await supabase
        .from("place_guides")
        .select("id, name, slug, category, short_description, cover_image, has_full_guide, district_id")
        .eq("district_id", districtId)
        .eq("status", "published")
        .order("name", { ascending: true });

      if (guidesError) throw guidesError;

      if (guides && guides.length > 0) {
        return guides as PlaceGuide[];
      }

      // Fallback to district_places
      const { data: places, error: placesError } = await supabase
        .from("district_places")
        .select("id, name, short_description, image_url")
        .eq("district_id", districtId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (placesError) throw placesError;

      // Transform to PlaceGuide format
      return (places || []).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        category: "attraction",
        short_description: p.short_description,
        cover_image: p.image_url,
        has_full_guide: false,
        district_id: districtId,
      })) as PlaceGuide[];
    },
    enabled: !!districtId,
    staleTime: 1000 * 60 * 10,
  });
}
