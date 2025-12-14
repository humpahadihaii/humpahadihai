import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FeaturedCard {
  id: string;
  slug: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  cta_label: Record<string, string>;
  cta_url: Record<string, string>;
  image_url: string | null;
  image_alt: Record<string, string> | null;
  icon_name: string | null;
  gradient_color: string | null;
  order_index: number;
  is_published: boolean;
  visible_on_homepage: boolean;
  start_at: string | null;
  end_at: string | null;
  is_sample: boolean;
  ab_test_tag: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type FeaturedCardInsert = Omit<FeaturedCard, 'id' | 'created_at' | 'updated_at'>;
export type FeaturedCardUpdate = Partial<FeaturedCardInsert>;

// Get localized text with fallback
export const getLocalizedText = (
  obj: Record<string, string> | null | undefined,
  locale: string = 'en',
  fallbackLocale: string = 'en'
): string => {
  if (!obj) return '';
  return obj[locale] || obj[fallbackLocale] || Object.values(obj)[0] || '';
};

// Public hook - fetches only published cards visible on homepage
export function usePublicFeaturedCards(locale: string = 'en') {
  return useQuery({
    queryKey: ["public-featured-cards", locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_cards")
        .select("id, slug, title, subtitle, cta_label, cta_url, image_url, image_alt, icon_name, gradient_color, order_index")
        .eq("is_published", true)
        .eq("visible_on_homepage", true)
        .order("order_index", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data as FeaturedCard[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (reduced for faster updates)
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
  });
}

// Admin hook - fetches all cards
export function useAdminFeaturedCards() {
  return useQuery({
    queryKey: ["admin-featured-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_cards")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as FeaturedCard[];
    },
  });
}

// Get single card by slug
export function useFeaturedCardBySlug(slug: string) {
  return useQuery({
    queryKey: ["featured-card", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_cards")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as FeaturedCard;
    },
    enabled: !!slug,
  });
}

// Mutations for admin
export function useFeaturedCardMutations() {
  const queryClient = useQueryClient();

  const createCard = useMutation({
    mutationFn: async (card: FeaturedCardInsert) => {
      const { data, error } = await supabase
        .from("featured_cards")
        .insert(card as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-cards"] });
      queryClient.invalidateQueries({ queryKey: ["public-featured-cards"] });
      toast.success("Featured card created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create card: ${error.message}`);
    },
  });

  const updateCard = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FeaturedCardUpdate }) => {
      const { data, error } = await supabase
        .from("featured_cards")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-cards"] });
      queryClient.invalidateQueries({ queryKey: ["public-featured-cards"] });
      queryClient.invalidateQueries({ queryKey: ["featured-card"] });
      toast.success("Featured card updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update card: ${error.message}`);
    },
  });

  const deleteCard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("featured_cards")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-cards"] });
      queryClient.invalidateQueries({ queryKey: ["public-featured-cards"] });
      toast.success("Featured card deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete card: ${error.message}`);
    },
  });

  return { createCard, updateCard, deleteCard };
}
