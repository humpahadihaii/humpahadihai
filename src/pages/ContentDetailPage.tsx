import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];

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
        .select("*")
        .eq("type", contentType)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data as ContentItem | null;
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
            dangerouslySetInnerHTML={{ __html: item.body || "" }}
          />
        </div>
      </article>
    </div>
  );
};

export default ContentDetailPage;
