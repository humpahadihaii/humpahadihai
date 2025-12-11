import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback, useMemo } from "react";

export interface MapPOI {
  id: string;
  type: "village" | "provider" | "listing" | "package" | "place" | "event" | "district";
  title: string;
  slug?: string;
  excerpt?: string;
  image?: string;
  category?: string;
  district?: string;
  village?: string;
  price?: number;
  rating?: number;
  featured?: boolean;
  tags?: string[];
  lat: number;
  lng: number;
  [key: string]: any;
}

export interface MapCluster {
  lat: number;
  lng: number;
  count: number;
  types: Record<string, number>;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

export interface MapHighlight {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  image_url?: string;
  highlight_type: string;
  geometry_type: string;
  coordinates: number[][];
  center_lat?: number;
  center_lng?: number;
  radius_meters?: number;
  stroke_color: string;
  fill_color: string;
  stroke_width: number;
  is_featured: boolean;
}

export interface MapFilters {
  types: string[];
  categories: string[];
  district?: string;
  featured: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
}

export interface MapBounds {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

const DEFAULT_CENTER = { lat: 30.0668, lng: 79.0193 }; // Uttarakhand center
const DEFAULT_ZOOM = 8;

export const useDiscoveryMap = () => {
  const queryClient = useQueryClient();
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [filters, setFilters] = useState<MapFilters>({
    types: ["village", "provider", "listing", "package", "place", "event"],
    categories: [],
    featured: false,
  });
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch POIs
  const { data: poisData, isLoading: poisLoading, refetch: refetchPOIs } = useQuery({
    queryKey: ["map-pois", bounds, filters, zoom],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (bounds) {
        params.set("bbox", `${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}`);
      }
      
      if (filters.types.length > 0) {
        params.set("types", filters.types.join(","));
      }
      
      if (filters.categories.length > 0) {
        params.set("categories", filters.categories.join(","));
      }
      
      if (filters.district) {
        params.set("district", filters.district);
      }
      
      if (filters.featured) {
        params.set("featured", "true");
      }
      
      if (filters.minPrice !== undefined) {
        params.set("minPrice", filters.minPrice.toString());
      }
      
      if (filters.maxPrice !== undefined) {
        params.set("maxPrice", filters.maxPrice.toString());
      }
      
      if (filters.minRating !== undefined) {
        params.set("minRating", filters.minRating.toString());
      }
      
      if (filters.search) {
        params.set("search", filters.search);
      }

      // Enable clustering at low zoom levels
      if (zoom < 10) {
        params.set("cluster", "true");
        params.set("zoom", zoom.toString());
      }

      params.set("limit", "300");

      const { data, error } = await supabase.functions.invoke("map-pois", {
        body: null,
        method: "GET",
      });

      // Fallback to direct query if edge function not available
      if (error) {
        console.warn("Edge function not available, using direct query");
        return fetchPOIsDirectly(bounds, filters);
      }

      return data;
    },
    enabled: true,
    staleTime: 60000, // Cache for 1 minute
  });

  // Fetch highlights
  const { data: highlights, isLoading: highlightsLoading } = useQuery({
    queryKey: ["map-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("map_highlights")
        .select("*")
        .eq("is_active", true)
        .eq("status", "published")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as MapHighlight[];
    },
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch districts for boundaries/labels
  const { data: districts } = useQuery({
    queryKey: ["map-districts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, slug, latitude, longitude, overview, image_url")
        .eq("status", "published")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("name");

      if (error) throw error;
      return data;
    },
    staleTime: 600000, // Cache for 10 minutes
  });

  // Search POIs
  const searchPOIs = useCallback(async (query: string, type?: string) => {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
      .from("map_poi_cache")
      .select("entity_id, entity_type, title, slug, excerpt, lat, lng, district_name, category, image_url")
      .eq("is_active", true)
      .ilike("title", `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      return [];
    }

    return data.map(item => ({
      id: item.entity_id,
      type: item.entity_type,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      lat: item.lat,
      lng: item.lng,
      district: item.district_name,
      category: item.category,
      image: item.image_url,
    }));
  }, []);

  // Get user location
  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Calculate distance from user location
  const getDistanceFromUser = useCallback(
    (lat: number, lng: number): number | null => {
      if (!userLocation) return null;
      
      const R = 6371; // Earth's radius in km
      const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
      const dLng = ((lng - userLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.lat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [userLocation]
  );

  // Process POIs from GeoJSON
  const pois = useMemo(() => {
    if (!poisData?.features) return [];
    
    return poisData.features.map((f: any) => ({
      ...f.properties,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      isCluster: f.properties?.cluster || false,
      clusterCount: f.properties?.point_count,
    })) as (MapPOI | MapCluster)[];
  }, [poisData]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<MapFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      types: ["village", "provider", "listing", "package", "place", "event"],
      categories: [],
      featured: false,
    });
  }, []);

  // Navigate to POI
  const navigateToPOI = useCallback((poi: MapPOI) => {
    setCenter({ lat: poi.lat, lng: poi.lng });
    setZoom(14);
    setSelectedPOI(poi);
  }, []);

  // Fit bounds to all POIs
  const fitToPOIs = useCallback(() => {
    if (!pois.length) return;
    
    const bounds = pois.reduce(
      (acc, poi) => ({
        minLat: Math.min(acc.minLat, poi.lat),
        maxLat: Math.max(acc.maxLat, poi.lat),
        minLng: Math.min(acc.minLng, poi.lng),
        maxLng: Math.max(acc.maxLng, poi.lng),
      }),
      { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
    );
    
    setCenter({
      lat: (bounds.minLat + bounds.maxLat) / 2,
      lng: (bounds.minLng + bounds.maxLng) / 2,
    });
  }, [pois]);

  return {
    // State
    pois,
    highlights,
    districts,
    bounds,
    zoom,
    center,
    filters,
    selectedPOI,
    userLocation,
    
    // Loading states
    isLoading: poisLoading || highlightsLoading,
    
    // Setters
    setBounds,
    setZoom,
    setCenter,
    setSelectedPOI,
    
    // Actions
    updateFilters,
    resetFilters,
    searchPOIs,
    navigateToPOI,
    fitToPOIs,
    requestUserLocation,
    getDistanceFromUser,
    refetchPOIs,
  };
};

// Fallback direct query if edge function not available
async function fetchPOIsDirectly(bounds: MapBounds | null, filters: MapFilters) {
  let query = supabase
    .from("map_poi_cache")
    .select("*")
    .eq("is_active", true);

  if (filters.types.length > 0) {
    query = query.in("entity_type", filters.types);
  }

  if (bounds) {
    query = query
      .gte("lat", bounds.minLat)
      .lte("lat", bounds.maxLat)
      .gte("lng", bounds.minLng)
      .lte("lng", bounds.maxLng);
  }

  if (filters.district) {
    query = query.eq("district_id", filters.district);
  }

  if (filters.featured) {
    query = query.eq("is_featured", true);
  }

  if (filters.categories.length > 0) {
    query = query.in("category", filters.categories);
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  query = query
    .order("is_featured", { ascending: false })
    .order("title", { ascending: true })
    .limit(300);

  const { data, error } = await query;

  if (error) throw error;

  return {
    type: "FeatureCollection",
    features: (data || []).map((poi: any) => ({
      type: "Feature",
      id: poi.entity_id,
      geometry: {
        type: "Point",
        coordinates: [poi.lng, poi.lat],
      },
      properties: {
        id: poi.entity_id,
        type: poi.entity_type,
        title: poi.title,
        slug: poi.slug,
        excerpt: poi.excerpt,
        image: poi.image_url,
        category: poi.category,
        district: poi.district_name,
        village: poi.village_name,
        price: poi.price_min,
        rating: poi.rating,
        featured: poi.is_featured,
        tags: poi.tags,
        ...poi.properties,
      },
    })),
  };
}

export const useMapAdmin = () => {
  const queryClient = useQueryClient();

  // Refresh POI cache
  const refreshCache = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("refresh_map_poi_cache");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["map-pois"] });
    },
  });

  // Fetch all highlights (including unpublished for admin)
  const { data: allHighlights, isLoading: highlightsLoading, refetch: refetchHighlights } = useQuery({
    queryKey: ["admin-map-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("map_highlights")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create highlight
  const createHighlight = useMutation({
    mutationFn: async (highlight: Partial<MapHighlight>) => {
      const { data, error } = await supabase
        .from("map_highlights")
        .insert([highlight as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetchHighlights();
    },
  });

  // Update highlight
  const updateHighlight = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MapHighlight>) => {
      const { data, error } = await supabase
        .from("map_highlights")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetchHighlights();
    },
  });

  // Delete highlight
  const deleteHighlight = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("map_highlights")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      refetchHighlights();
    },
  });

  return {
    highlights: allHighlights,
    highlightsLoading,
    refreshCache,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    refetchHighlights,
  };
};
