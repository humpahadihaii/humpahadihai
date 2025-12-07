import { useParams } from "react-router-dom";
import { useCMSPage } from "@/hooks/useCMSSettings";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import { useEffect } from "react";

const CMSPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useCMSPage(slug || "");

  // Update document title when page loads
  useEffect(() => {
    if (page?.meta_title) {
      document.title = page.meta_title;
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-2/3 mb-4" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </div>
      </div>
    );
  }

  const sanitizedBody = page.body ? DOMPurify.sanitize(page.body) : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary/80 to-secondary/70">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {page.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div 
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-secondary"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        </div>
      </section>
    </div>
  );
};

export default CMSPageView;
