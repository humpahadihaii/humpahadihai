import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import DOMPurify from "dompurify";
import type { Database } from "@/integrations/supabase/types";

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"] & {
  districts?: { name: string; slug: string } | null;
};

interface ContentDetailPageProps {
  contentType: "culture" | "food" | "travel" | "thought";
}

const ContentDetailPage = ({ contentType }: ContentDetailPageProps) => {
  const { slug } = useParams();

  const { data: item, isLoading } = useQuery({
    queryKey: ["content-item", contentType, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*, districts(name, slug)")
        .eq("type", contentType)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data as ContentItem | null;
    },
  });

  // Fetch related content from the same district
  const { data: relatedItems } = useQuery({
    queryKey: ["related-content", contentType, item?.district_id],
    queryFn: async () => {
      if (!item?.district_id) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("id, title, slug, main_image_url")
        .eq("district_id", item.district_id)
        .eq("type", contentType)
        .eq("status", "published")
        .neq("id", item.id)
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!item?.district_id,
  });

  // Fetch districts for "Where This Tradition Is Practiced" section
  const { data: allDistricts } = useQuery({
    queryKey: ["districts-for-linking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, slug, region")
        .eq("status", "published")
        .order("name")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Content Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The content you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to={`/${contentType}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sanitize HTML content to prevent XSS
  const sanitizedBody = DOMPurify.sanitize(item.body || "", {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Image */}
      {item.main_image_url && (
        <section className="relative h-96 overflow-hidden">
          <img
            src={item.main_image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </section>
      )}

      {/* Content */}
      <article className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to={`/${contentType}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </Link>
          </Button>

          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            {item.title}
          </h1>

          {/* District Badge */}
          {item.districts && (
            <Link to={`/districts/${item.districts.slug}`}>
              <Badge 
                variant="outline" 
                className="mb-4 hover:bg-secondary transition-colors cursor-pointer"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Famous in: {item.districts.name}
              </Badge>
            </Link>
          )}

          {item.excerpt && (
            <p className="text-xl text-muted-foreground mb-6 italic">
              {item.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
            {item.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(item.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-secondary hover:prose-a:text-secondary/80"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />

          {/* Related Content from Same District */}
          {relatedItems && relatedItems.length > 0 && item.districts && (
            <div className="mt-16 pt-8 border-t">
              <h3 className="text-2xl font-bold mb-6">
                More from {item.districts.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedItems.map((related) => (
                  <Link key={related.id} to={`/${contentType}/${related.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      {related.main_image_url && (
                        <div className="h-32 overflow-hidden">
                          <img
                            src={related.main_image_url}
                            alt={related.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h4 className="font-semibold line-clamp-2">{related.title}</h4>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Where This Tradition Is Practiced - SEO Internal Linking */}
          {allDistricts && allDistricts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-bold mb-4">Where This Tradition Is Practiced</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Explore the districts of Uttarakhand where you can experience authentic {contentType} traditions:
              </p>
              <div className="flex flex-wrap gap-3">
                {allDistricts.slice(0, 4).map((dist) => (
                  <Link 
                    key={dist.id}
                    to={`/districts/${dist.slug}`}
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {dist.name} District Cultural Practices
                  </Link>
                ))}
              </div>
              
              {/* Gallery Link */}
              <div className="mt-6">
                <Link 
                  to="/gallery" 
                  className="text-primary font-medium hover:text-primary/80 hover:underline"
                >
                  View {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Photo Gallery →
                </Link>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default ContentDetailPage;