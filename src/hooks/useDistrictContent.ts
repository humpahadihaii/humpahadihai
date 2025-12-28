import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook for fetching hotels/stays linked to a district
export const useDistrictHotels = (districtId: string | undefined) => {
  return useQuery({
    queryKey: ["district-hotels", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      const { data, error } = await supabase
        .from("district_hotels")
        .select("id, name, description, category, image_url, rating, price_range, location")
        .eq("district_id", districtId)
        .eq("status", "published")
        .order("rating", { ascending: false })
        .order("name")
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching marketplace listings/providers for a district
export const useDistrictMarketplace = (districtId: string | undefined) => {
  const providersQuery = useQuery({
    queryKey: ["district-providers", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      const { data, error } = await supabase
        .from("tourism_providers")
        .select("id, name, type, is_verified, rating, image_url")
        .eq("district_id", districtId)
        .eq("is_active", true)
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const listingsQuery = useQuery({
    queryKey: ["district-listings", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      const { data, error } = await supabase
        .from("tourism_listings")
        .select(`
          id, title, category, short_description, image_url, base_price, is_featured,
          provider:tourism_providers(id, name, type, is_verified)
        `)
        .eq("district_id", districtId)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    providers: providersQuery.data || [],
    listings: listingsQuery.data || [],
    isLoading: providersQuery.isLoading || listingsQuery.isLoading,
  };
};

// Hook for travel packages that include this district
export const useDistrictTravelPackages = (districtId: string | undefined) => {
  return useQuery({
    queryKey: ["district-travel-packages", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      
      const { data, error } = await supabase
        .from("travel_packages")
        .select("id, title, slug, short_description, thumbnail_image_url, price_per_person, duration_days, is_featured")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook for local products in this district
export const useDistrictProducts = (districtId: string | undefined) => {
  return useQuery({
    queryKey: ["district-products", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      
      const { data, error } = await supabase
        .from("local_products")
        .select("id, name, slug, thumbnail_image_url, price, is_featured")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook for other districts (visitors also viewed)
export const useOtherDistricts = (currentDistrictId: string | undefined, region?: string | null) => {
  return useQuery({
    queryKey: ["other-districts", currentDistrictId, region],
    queryFn: async () => {
      if (!currentDistrictId) return [];
      
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, slug, image_url, region")
        .neq("id", currentDistrictId)
        .eq("status", "published")
        .order("sort_order")
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentDistrictId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook for nearby villages
export const useNearbyVillages = (currentVillageId: string | undefined, districtId: string | undefined) => {
  return useQuery({
    queryKey: ["nearby-villages", currentVillageId, districtId],
    queryFn: async () => {
      if (!currentVillageId || !districtId) return [];
      
      const { data, error } = await supabase
        .from("villages")
        .select("id, name, slug, thumbnail_url, introduction")
        .eq("district_id", districtId)
        .neq("id", currentVillageId)
        .eq("status", "published")
        .order("name")
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentVillageId && !!districtId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
