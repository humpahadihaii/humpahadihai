import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import SEOHead from "@/components/SEOHead";
import { useSEO, PageType } from "@/hooks/useSEO";

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];

interface ContentListPageProps {
  contentType: "culture" | "food" | "travel" | "thought";
  title: string;
  description: string;
  heroGradient?: string;
  heroImage?: string;
  showSubmitButton?: boolean;
  submitButtonLabel?: string;
  submitButtonUrl?: string;
}

const ContentListPage = ({ 
  contentType, 
  title, 
  description, 
  heroGradient = "from-primary/70 to-secondary/70",
  heroImage,
  showSubmitButton = false,
  submitButtonLabel = "Submit",
  submitButtonUrl = "#"
}: ContentListPageProps) => {
  // SEO
  const seoMeta = useSEO(contentType as PageType, { name: title, description });

  const { data: items, isLoading } = useQuery({
    queryKey: ["content-items", contentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", contentType)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as ContentItem[];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 no-overflow-x">
      <SEOHead meta={seoMeta} />
      
      {/* Hero Section */}
      <section 
        className={`relative responsive-hero bg-gradient-to-r ${heroGradient}`}
        style={heroImage ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.7), hsl(var(--secondary) / 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="responsive-container max-w-7xl text-center">
          <h1 className="responsive-heading-xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
            {title}
          </h1>
          <p className="responsive-text-lg text-white/95 max-w-3xl mx-auto drop-shadow mb-4 sm:mb-6 px-2">
            {description}
          </p>
          {showSubmitButton && (
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto">
              <Link to={submitButtonUrl}>
                <PenLine className="mr-2 h-5 w-5" />
                {submitButtonLabel}
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Content Grid */}
      <section className="responsive-section px-4 sm:px-6 lg:px-8">
        <div className="responsive-container max-w-7xl">
          {isLoading ? (
            <div className="responsive-grid">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="responsive-card">
                  <Skeleton className="h-40 sm:h-48 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : items && items.length === 0 ? (
            <Card className="responsive-card">
              <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
                <p className="responsive-text-lg mb-4">No content available yet.</p>
                <p className="mb-6 text-sm sm:text-base">Check back soon for new articles and stories!</p>
                {showSubmitButton && (
                  <Button asChild className="w-full sm:w-auto">
                    <Link to={submitButtonUrl}>
                      <PenLine className="mr-2 h-4 w-4" />
                      {submitButtonLabel}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="responsive-grid">
              {items?.map((item) => (
                <Link key={item.id} to={`/${contentType}/${item.slug}`} className="block">
                  <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer responsive-card">
                    {item.main_image_url && (
                      <div className="h-40 sm:h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={item.main_image_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="line-clamp-2 text-base sm:text-lg">{item.title}</CardTitle>
                      {item.excerpt && (
                        <CardDescription className="line-clamp-2 text-sm">
                          {item.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0">
                      {item.published_at && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(item.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Internal Links - SEO */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border/50">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Explore More</h3>
            <div className="responsive-flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2">
              <Link to="/districts/almora" className="text-primary hover:text-primary/80 hover:underline text-xs sm:text-sm">
                Almora District Cultural Practices
              </Link>
              <Link to="/districts/pithoragarh" className="text-primary hover:text-primary/80 hover:underline text-xs sm:text-sm">
                Pithoragarh Traditional Lifestyle
              </Link>
              <Link to="/districts/chamoli" className="text-primary hover:text-primary/80 hover:underline text-xs sm:text-sm">
                Chamoli Folk Traditions
              </Link>
              <Link to="/gallery" className="text-primary hover:text-primary/80 hover:underline text-xs sm:text-sm">
                View {title} Photo Gallery →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContentListPage;
