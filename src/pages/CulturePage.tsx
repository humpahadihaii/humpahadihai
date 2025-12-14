import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ContentListPage from "./ContentListPage";
import { useSiteImages } from "@/hooks/useSiteImages";
import { supabase } from "@/integrations/supabase/client";

export default function CulturePage() {
  const { getImage } = useSiteImages();
  const queryClient = useQueryClient();
  
  // Try both possible keys for backwards compatibility
  const heroImage = getImage("culture_hero") || getImage("culture_section_image");
  
  // Prefetch culture content data on mount
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["content-items", "culture"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("content_items")
          .select("*")
          .eq("type", "culture")
          .eq("status", "published")
          .order("published_at", { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
  
  
  return (
    <ContentListPage
      contentType="culture"
      title="Culture & Traditions"
      description="Discover the timeless heritage of Garhwal and Kumaon"
      heroGradient="from-primary/70 to-secondary/70"
      heroImage={heroImage !== "/placeholder.svg" ? heroImage : undefined}
    />
  );
}
