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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <SEOHead meta={seoMeta} />
      
      {/* Hero Section */}
      <section 
        className={`relative py-20 px-4 bg-gradient-to-r ${heroGradient}`}
        style={heroImage ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.7), hsl(var(--secondary) / 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow mb-6">
            {description}
          </p>
          {showSubmitButton && (
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
              <Link to={submitButtonUrl}>
                <PenLine className="mr-2 h-5 w-5" />
                {submitButtonLabel}
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : items && items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg mb-4">No content available yet.</p>
                <p className="mb-6">Check back soon for new articles and stories!</p>
                {showSubmitButton && (
                  <Button asChild>
                    <Link to={submitButtonUrl}>
                      <PenLine className="mr-2 h-4 w-4" />
                      {submitButtonLabel}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items?.map((item) => (
                <Link key={item.id} to={`/${contentType}/${item.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                    {item.main_image_url && (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={item.main_image_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                      {item.excerpt && (
                        <CardDescription className="line-clamp-2">
                          {item.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {item.published_at && (
                        <p className="text-sm text-muted-foreground">
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
        </div>
      </section>
    </div>
  );
};

export default ContentListPage;
