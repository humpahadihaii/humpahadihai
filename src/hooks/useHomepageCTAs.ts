import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomepageCTA {
  id: string;
  label: string;
  url: string;
  variant: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  icon: string | null;
  position: "hero" | "below_hero" | "mid_page" | "footer_cta";
  display_order: number;
  is_active: boolean;
  background_color: string | null;
  text_color: string | null;
  size: "sm" | "default" | "lg" | "icon";
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

export type CTAPosition = HomepageCTA["position"];
export type CTAVariant = HomepageCTA["variant"];
export type CTASize = HomepageCTA["size"];

export const CTA_POSITIONS: { value: CTAPosition; label: string }[] = [
  { value: "hero", label: "Hero Section" },
  { value: "below_hero", label: "Below Hero" },
  { value: "mid_page", label: "Mid Page Banner" },
  { value: "footer_cta", label: "Footer CTA" },
];

export const CTA_VARIANTS: { value: CTAVariant; label: string }[] = [
  { value: "default", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
  { value: "link", label: "Link" },
];

export const CTA_SIZES: { value: CTASize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "default", label: "Default" },
  { value: "lg", label: "Large" },
];

// Single query for a specific position
export const useHomepageCTAs = (position?: CTAPosition) => {
  return useQuery({
    queryKey: ["homepage-ctas", position],
    queryFn: async () => {
      let query = supabase
        .from("homepage_ctas")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (position) {
        query = query.eq("position", position);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HomepageCTA[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
  });
};

// Optimized: Fetch ALL CTAs at once and group by position
export const useAllHomepageCTAsGrouped = () => {
  return useQuery({
    queryKey: ["homepage-ctas-grouped"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_ctas")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      
      const ctas = data as HomepageCTA[];
      return {
        hero: ctas.filter(c => c.position === "hero"),
        below_hero: ctas.filter(c => c.position === "below_hero"),
        mid_page: ctas.filter(c => c.position === "mid_page"),
        footer_cta: ctas.filter(c => c.position === "footer_cta"),
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 30,
  });
};

export const useAllHomepageCTAs = () => {
  return useQuery({
    queryKey: ["homepage-ctas-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_ctas")
        .select("*")
        .order("position")
        .order("display_order");

      if (error) throw error;
      return data as HomepageCTA[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCTA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cta: Omit<HomepageCTA, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("homepage_ctas")
        .insert(cta)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-ctas"] });
    },
  });
};

export const useUpdateCTA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HomepageCTA> & { id: string }) => {
      const { data, error } = await supabase
        .from("homepage_ctas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-ctas"] });
    },
  });
};

export const useDeleteCTA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("homepage_ctas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-ctas"] });
    },
  });
};
