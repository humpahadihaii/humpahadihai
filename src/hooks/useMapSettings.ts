import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MapSettings {
  id: string;
  maps_enabled: boolean;
  show_on_homepage: boolean;
  show_on_districts: boolean;
  show_on_villages: boolean;
  show_on_marketplace: boolean;
  show_on_travel_packages: boolean;
  show_on_hotels: boolean;
  default_zoom: number;
  default_lat: number;
  default_lng: number;
  map_style: string;
  enable_clustering: boolean;
  enable_street_view: boolean;
  api_key_status: string;
  last_api_test: string | null;
}

export const useMapSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["map-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("map_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as MapSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<MapSettings>) => {
      const { data, error } = await supabase
        .from("map_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("singleton_flag", true)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["map-settings"] });
      toast.success("Map settings updated");
    },
    onError: (error) => {
      toast.error("Failed to update settings: " + error.message);
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};

export const useGeocode = () => {
  const geocodeAddress = async (address: string) => {
    const { data, error } = await supabase.functions.invoke("maps-geocode", {
      body: { address, action: "geocode" },
    });
    
    if (error) throw error;
    return data;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    const { data, error } = await supabase.functions.invoke("maps-geocode", {
      body: { lat, lng, action: "reverse" },
    });
    
    if (error) throw error;
    return data;
  };

  return { geocodeAddress, reverseGeocode };
};
