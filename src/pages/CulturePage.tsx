import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import ContentListPage from "./ContentListPage";
import { useSiteImages } from "@/hooks/useSiteImages";
import { supabase } from "@/integrations/supabase/client";
import { StoryBlock } from "@/components/StoryBlock";

export default function CulturePage() {
  const { getImage } = useSiteImages();
  const queryClient = useQueryClient();
  
  // Try both possible keys for backwards compatibility
  const heroImage = getImage("culture_hero") || getImage("culture_section_image");
  
  // Prefetch culture content data on mount - only if not already cached
  useEffect(() => {
    const existingData = queryClient.getQueryData(["content-items", "culture"]);
    if (!existingData) {
      queryClient.prefetchQuery({
        queryKey: ["content-items", "culture"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("content_items")
            .select("id, title, slug, excerpt, main_image_url, published_at")
            .eq("type", "culture")
            .eq("status", "published")
            .order("published_at", { ascending: false });
          if (error) throw error;
          return data;
        },
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [queryClient]);
  
  
  return (
    <div>
      <ContentListPage
        contentType="culture"
        title="Culture & Traditions"
        description="Discover the timeless heritage of Garhwal and Kumaon"
        heroGradient="from-primary/70 to-secondary/70"
        heroImage={heroImage !== "/placeholder.svg" ? heroImage : undefined}
      />
      
      {/* Story Block - Cultural Connection */}
      <section className="py-10 md:py-14 px-4 bg-muted/20">
        <div className="container mx-auto max-w-3xl">
          <StoryBlock theme="culture" variant="default" />
        </div>
      </section>
      
      {/* History Link Section */}
      <section className="py-12 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Link 
              to="/history"
              className="group inline-flex flex-col items-center gap-3 p-6 rounded-xl bg-background border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  History of Uttarakhand
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore the journey from ancient Vedic times to modern statehood
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn More
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}