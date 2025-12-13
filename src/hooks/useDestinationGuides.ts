import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface DestinationGuide {
  id: string;
  name: string;
  slug: string;
  short_introduction: string | null;
  hero_image: string | null;
  temperature_info: {
    summer?: string;
    winter?: string;
    monsoon?: string;
  } | null;
  local_people_culture: string | null;
  local_customs_etiquette: string | null;
  best_time_to_visit: string | null;
  ideal_duration: string | null;
  region: string | null;
  district_id: string | null;
  latitude: number | null;
  longitude: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  seo_schema: Record<string, unknown> | null;
  share_templates: Record<string, unknown> | null;
  status: "draft" | "published";
  sort_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DestinationPlace {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  category: "Temple" | "Nature" | "Market" | "Experience" | "Wildlife" | "Historical" | "Adventure";
  short_summary: string | null;
  how_to_reach: {
    by_road?: string;
    by_foot?: string;
    distance_from_destination?: string;
  } | null;
  things_to_do: string[] | null;
  local_customs_rituals: string | null;
  historical_significance: string | null;
  spiritual_significance: string | null;
  best_visiting_time: string | null;
  approx_duration: string | null;
  entry_fee: string | null;
  timings: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  main_image: string | null;
  image_gallery: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  seo_schema: Record<string, unknown> | null;
  share_templates: Record<string, unknown> | null;
  status: "draft" | "published";
  sort_order: number;
  is_highlighted: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch all destinations (for admin)
export function useDestinationGuides(onlyPublished = false) {
  return useQuery({
    queryKey: ["destination-guides", onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from("destination_guides")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (onlyPublished) {
        query = query.eq("status", "published");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DestinationGuide[];
    },
  });
}

// Fetch single destination by slug
export function useDestinationGuide(slug: string | undefined) {
  return useQuery({
    queryKey: ["destination-guide", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("destination_guides")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as DestinationGuide;
    },
    enabled: !!slug,
  });
}

// Fetch places for a destination
export function useDestinationPlaces(destinationId: string | undefined, onlyPublished = false) {
  return useQuery({
    queryKey: ["destination-places", destinationId, onlyPublished],
    queryFn: async () => {
      if (!destinationId) return [];
      let query = supabase
        .from("destination_places")
        .select("*")
        .eq("destination_id", destinationId)
        .order("sort_order", { ascending: true });
      
      if (onlyPublished) {
        query = query.eq("status", "published");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DestinationPlace[];
    },
    enabled: !!destinationId,
  });
}

// Fetch single place by slug
export function useDestinationPlace(destinationSlug: string | undefined, placeSlug: string | undefined) {
  return useQuery({
    queryKey: ["destination-place", destinationSlug, placeSlug],
    queryFn: async () => {
      if (!destinationSlug || !placeSlug) return null;
      
      // First get destination
      const { data: destination, error: destError } = await supabase
        .from("destination_guides")
        .select("id, name, slug")
        .eq("slug", destinationSlug)
        .single();
      
      if (destError) throw destError;
      
      // Then get place
      const { data: place, error: placeError } = await supabase
        .from("destination_places")
        .select("*")
        .eq("destination_id", destination.id)
        .eq("slug", placeSlug)
        .single();
      
      if (placeError) throw placeError;
      
      return { place: place as DestinationPlace, destination };
    },
    enabled: !!destinationSlug && !!placeSlug,
  });
}

// Mutations for destinations
export function useDestinationGuideMutations() {
  const queryClient = useQueryClient();

  const createDestination = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("destination_guides")
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-guides"] });
      toast.success("Destination created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create destination: ${error.message}`);
    },
  });

  const updateDestination = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from("destination_guides")
        .update(data as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-guides"] });
      toast.success("Destination updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update destination: ${error.message}`);
    },
  });

  const deleteDestination = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("destination_guides")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-guides"] });
      toast.success("Destination deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete destination: ${error.message}`);
    },
  });

  return { createDestination, updateDestination, deleteDestination };
}

// Mutations for places
export function useDestinationPlaceMutations() {
  const queryClient = useQueryClient();

  const createPlace = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("destination_places")
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-places"] });
      toast.success("Place created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create place: ${error.message}`);
    },
  });

  const updatePlace = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from("destination_places")
        .update(data as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-places"] });
      toast.success("Place updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update place: ${error.message}`);
    },
  });

  const deletePlace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("destination_places")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-places"] });
      toast.success("Place deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete place: ${error.message}`);
    },
  });

  const reorderPlaces = useMutation({
    mutationFn: async (places: { id: string; sort_order: number }[]) => {
      const updates = places.map(({ id, sort_order }) =>
        supabase.from("destination_places").update({ sort_order }).eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-places"] });
    },
  });

  return { createPlace, updatePlace, deletePlace, reorderPlaces };
}
