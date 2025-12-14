import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlaceGuideDetail {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  about_the_place: string | null;
  how_to_reach: {
    by_air?: string;
    by_rail?: string;
    by_road?: string;
  } | null;
  routes_transport: string | null;
  weather_info: string | null;
  things_to_do: string[] | null;
  local_tips: string | null;
  emergency_info: {
    police?: string;
    hospital?: string;
    fire?: string;
    ambulance?: string;
  } | null;
  cover_image: string | null;
  gallery_images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  has_full_guide: boolean;
  district: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function usePlaceGuide(placeSlug: string | undefined) {
  return useQuery({
    queryKey: ["place-guide", placeSlug],
    queryFn: async () => {
      if (!placeSlug) return null;

      const { data, error } = await supabase
        .from("place_guides")
        .select(`
          *,
          districts (id, name, slug)
        `)
        .eq("slug", placeSlug)
        .eq("status", "published")
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return {
        ...data,
        district: data.districts,
      } as PlaceGuideDetail;
    },
    enabled: !!placeSlug,
    staleTime: 1000 * 60 * 15,
  });
}

export function usePlaceGuideByDistrict(districtSlug: string | undefined, placeSlug: string | undefined) {
  return useQuery({
    queryKey: ["place-guide-by-district", districtSlug, placeSlug],
    queryFn: async () => {
      if (!districtSlug || !placeSlug) return null;

      // First get the district
      const { data: district, error: districtError } = await supabase
        .from("districts")
        .select("id, name, slug")
        .eq("slug", districtSlug)
        .single();

      if (districtError || !district) return null;

      // Then get the place guide
      const { data, error } = await supabase
        .from("place_guides")
        .select("*")
        .eq("district_id", district.id)
        .eq("slug", placeSlug)
        .eq("status", "published")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Try fallback to district_places
          const { data: place } = await supabase
            .from("district_places")
            .select("*")
            .eq("district_id", district.id)
            .eq("is_active", true)
            .ilike("name", placeSlug.replace(/-/g, " "))
            .single();

          if (place) {
            return {
              id: place.id,
              name: place.name,
              slug: place.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
              category: "attraction",
              short_description: place.short_description,
              about_the_place: place.full_description,
              how_to_reach: null,
              routes_transport: null,
              weather_info: null,
              things_to_do: null,
              local_tips: null,
              emergency_info: null,
              cover_image: place.image_url,
              gallery_images: null,
              latitude: place.map_lat,
              longitude: place.map_lng,
              google_maps_url: place.google_maps_url,
              has_full_guide: false,
              district,
            } as PlaceGuideDetail;
          }
          return null;
        }
        throw error;
      }

      return {
        ...data,
        district,
      } as PlaceGuideDetail;
    },
    enabled: !!districtSlug && !!placeSlug,
    staleTime: 1000 * 60 * 15,
  });
}
