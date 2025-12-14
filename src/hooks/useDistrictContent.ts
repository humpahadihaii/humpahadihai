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
        .select("*")
        .eq("district_id", districtId)
        .eq("status", "published")
        .order("rating", { ascending: false })
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
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
        .select("*")
        .eq("district_id", districtId)
        .eq("is_active", true)
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
  });

  const listingsQuery = useQuery({
    queryKey: ["district-listings", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      const { data, error } = await supabase
        .from("tourism_listings")
        .select(`
          *,
          provider:tourism_providers(id, name, type, is_verified, rating)
        `)
        .eq("district_id", districtId)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
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
      
      // First get villages in this district
      const { data: villages } = await supabase
        .from("villages")
        .select("id")
        .eq("district_id", districtId);
      
      const villageIds = villages?.map(v => v.id) || [];
      
      // Get packages linked to these villages OR packages with region matching district
      const { data, error } = await supabase
        .from("travel_packages")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
  });
};

// Hook for local products in this district
export const useDistrictProducts = (districtId: string | undefined) => {
  return useQuery({
    queryKey: ["district-products", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      
      // Get villages in this district
      const { data: villages } = await supabase
        .from("villages")
        .select("id")
        .eq("district_id", districtId);
      
      const villageIds = villages?.map(v => v.id) || [];
      
      if (villageIds.length === 0) return [];
      
      // Get products linked to these villages
      const { data, error } = await supabase
        .from("local_products")
        .select("*")
        .in("village_id", villageIds)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!districtId,
  });
};

// Hook for other districts (visitors also viewed)
export const useOtherDistricts = (currentDistrictId: string | undefined, region?: string | null) => {
  return useQuery({
    queryKey: ["other-districts", currentDistrictId, region],
    queryFn: async () => {
      if (!currentDistrictId) return [];
      
      let query = supabase
        .from("districts")
        .select("id, name, slug, overview, image_url, region")
        .neq("id", currentDistrictId)
        .eq("status", "published")
        .order("sort_order")
        .limit(6);
      
      // Optionally prefer same region
      if (region) {
        query = query.order("region", { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentDistrictId,
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
        .select("id, name, slug, thumbnail_url, introduction, tehsil")
        .eq("district_id", districtId)
        .neq("id", currentVillageId)
        .eq("status", "published")
        .order("name")
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentVillageId && !!districtId,
  });
};
