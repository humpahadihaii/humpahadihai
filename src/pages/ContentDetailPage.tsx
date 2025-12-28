import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Share2, 
  Quote,
  Mountain,
  ChevronRight,
  Info,
} from "lucide-react";
import DOMPurify from "dompurify";
import type { Database } from "@/integrations/supabase/types";

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"] & {
  districts?: { name: string; slug: string } | null;
};

interface ContentDetailPageProps {
  contentType: "culture" | "food" | "travel" | "thought";
}

// Section titles for content parsing
const SECTION_PATTERNS: Record<string, RegExp> = {
  overview: /^(overview|introduction|about)/i,
  festivals: /^(festivals?|celebrations?)/i,
  language: /^(language|dialect|tongue)/i,
  clothing: /^(clothing|attire|dress|costume)/i,
  dance: /^(folk\s*dance|dance|music|folk\s*music)/i,
  lifestyle: /^(lifestyle|way\s*of\s*life|daily\s*life|living)/i,
  cuisine: /^(cuisine|food|cooking|dishes)/i,
  traditions: /^(traditions?|customs?|rituals?)/i,
};

// Get a nice display title for content types
const getContentTypeTitle = (type: string) => {
  const titles: Record<string, string> = {
    culture: "Culture & Traditions",
    food: "Culinary Heritage",
    travel: "Travel & Exploration",
    thought: "Reflections",
  };
  return titles[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

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
        .select("id, title, slug, main_image_url, excerpt")
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-border/40">
          <CardContent className="py-12 text-center">
            <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">Content Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The content you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to={`/${contentType}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {getContentTypeTitle(contentType)}
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

  // Parse content into sections based on headings
  const parseContentSections = (html: string) => {
    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = html;
    
    const sections: { title: string; content: string; type: string }[] = [];
    let currentSection = { title: 'Overview', content: '', type: 'overview' };
    
    container.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        // Check if it's a heading
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          // Save current section if it has content
          if (currentSection.content.trim()) {
            sections.push({ ...currentSection });
          }
          
          // Start new section
          const title = element.textContent || 'Section';
          let sectionType = 'default';
          
          // Try to determine section type
          for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
            if (pattern.test(title)) {
              sectionType = type;
              break;
            }
          }
          
          currentSection = { title, content: '', type: sectionType };
        } else {
          currentSection.content += element.outerHTML;
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        currentSection.content += `<p>${node.textContent}</p>`;
      }
    });
    
    // Add last section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections.length > 0 ? sections : [{ title: 'Content', content: html, type: 'overview' }];
  };

  const contentSections = parseContentSections(sanitizedBody);

  // Extract a cultural insight quote from the excerpt or first section
  const getCulturalInsight = () => {
    if (item.excerpt && item.excerpt.length > 50) {
      return item.excerpt;
    }
    // Extract from first section content
    const firstContent = contentSections[0]?.content || '';
    const textContent = firstContent.replace(/<[^>]+>/g, '').trim();
    const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 50);
    return sentences[0]?.trim() || null;
  };

  const culturalInsight = getCulturalInsight();

  return (
    <div className="min-h-screen bg-background">
      {/* Archival Hero Section */}
      <header className="relative bg-muted/30">
        {/* Background Image with Subtle Overlay */}
        {item.main_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.main_image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
          </div>
        )}
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
          {/* Back Navigation */}
          <nav className="mb-8">
            <Link 
              to={`/${contentType}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {getContentTypeTitle(contentType)}
            </Link>
          </nav>

          {/* Meta Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className="text-muted-foreground border-border/60 text-xs">
              {getContentTypeTitle(contentType)}
            </Badge>
            {item.districts && (
              <Link to={`/districts/${item.districts.slug}`}>
                <Badge 
                  variant="outline" 
                  className="text-muted-foreground border-border/60 text-xs hover:bg-muted transition-colors cursor-pointer"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.districts.name}
                </Badge>
              </Link>
            )}
          </div>

          {/* Title - Authoritative Serif */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-serif font-bold text-foreground mb-5 max-w-4xl leading-[1.15] tracking-tight">
            {item.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {item.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {item.excerpt}
            </p>
          )}

          {/* Meta Info - Muted Date/Location */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
            {item.districts && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {item.districts.name}, Uttarakhand
              </span>
            )}
            {item.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(item.published_at).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Archival Reading Layout */}
      <main className="bg-background">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Main Article - Constrained Width for Readability */}
            <article className="lg:col-span-8 lg:max-w-[800px] space-y-10 md:space-y-14">
              
              {/* Cultural Insight Callout - Editorial Highlight */}
              {culturalInsight && !item.excerpt && (
                <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/60 rounded-r-xl p-6 md:p-8">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                  <p className="text-lg md:text-xl text-foreground/90 leading-relaxed italic font-serif">
                    "{culturalInsight}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">
                    — Cultural Insight
                  </p>
                </div>
              )}

              {/* Content Sections - Structured Blocks */}
              {contentSections.map((section, index) => (
                <ArchivalSection
                  key={index}
                  title={section.title}
                  sectionType={section.type}
                >
                  <div 
                    className="prose prose-lg max-w-none 
                      prose-headings:text-foreground prose-headings:font-semibold
                      prose-p:text-foreground/80 prose-p:leading-[1.85]
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:text-foreground/80 prose-ol:text-foreground/80
                      prose-li:leading-relaxed
                      prose-blockquote:border-l-primary/40 prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                      prose-img:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </ArchivalSection>
              ))}

              {/* Internal Context Links - Editorial Style */}
              <div className="pt-8 border-t border-border/40">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Continue Exploring
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/${contentType}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    More {getContentTypeTitle(contentType)}
                  </Link>
                  {item.districts && (
                    <Link
                      to={`/districts/${item.districts.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {item.districts.name} District
                    </Link>
                  )}
                  <Link
                    to="/gallery"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <Mountain className="h-4 w-4 text-muted-foreground" />
                    Photo Gallery
                  </Link>
                </div>
              </div>
            </article>

            {/* Sidebar - Quick Reference */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Quick Info Card */}
              <Card className="sticky top-24 border-border/40 bg-muted/20">
                <CardHeader className="pb-4 border-b border-border/30">
                  <CardTitle className="text-base flex items-center gap-2.5 font-medium">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    Quick Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  {item.districts && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Location</p>
                      <Link
                        to={`/districts/${item.districts.slug}`}
                        className="font-medium text-primary hover:underline flex items-center gap-1.5 text-sm"
                      >
                        <MapPin className="h-4 w-4" />
                        {item.districts.name}, Uttarakhand
                      </Link>
                    </div>
                  )}

                  {item.published_at && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Published</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(item.published_at).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Share</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: item.title,
                            text: item.excerpt || `Discover ${item.title} - ${getContentTypeTitle(contentType)} from Uttarakhand`,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Page
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Content */}
              {relatedItems && relatedItems.length > 0 && item.districts && (
                <Card className="border-border/40 bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      More from {item.districts.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {relatedItems.map((related) => (
                      <Link
                        key={related.id}
                        to={`/${contentType}/${related.slug}`}
                        className="flex items-center gap-3 p-2.5 -mx-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        {related.main_image_url ? (
                          <img
                            src={related.main_image_url}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Mountain className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {related.title}
                          </p>
                          {related.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {related.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>

        {/* Where This Tradition Is Practiced - Editorial Links */}
        {allDistricts && allDistricts.length > 0 && (
          <div className="container mx-auto px-4 pb-16">
            <section className="border-t border-border/40 pt-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-foreground">
                Where to Experience This Tradition
              </h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-2xl">
                Explore the districts of Uttarakhand where you can experience authentic {contentType} traditions and cultural heritage:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allDistricts.map((dist) => (
                  <Link 
                    key={dist.id}
                    to={`/districts/${dist.slug}`}
                    className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted hover:border-border/50 transition-colors text-center group"
                  >
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                      {dist.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{dist.region}</p>
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                  <Link to="/gallery">
                    View {getContentTypeTitle(contentType)} Photo Gallery
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

// Archival Section Component - Soft content block with accent line
function ArchivalSection({
  title,
  sectionType,
  children,
}: {
  title: string;
  sectionType: string;
  children: React.ReactNode;
}) {
  // Get icon based on section type
  const getIcon = () => {
    const icons: Record<string, React.ReactNode> = {
      overview: <BookOpen className="h-5 w-5" />,
      festivals: <Calendar className="h-5 w-5" />,
      language: <BookOpen className="h-5 w-5" />,
      clothing: <Mountain className="h-5 w-5" />,
      dance: <Mountain className="h-5 w-5" />,
      lifestyle: <Mountain className="h-5 w-5" />,
      cuisine: <Mountain className="h-5 w-5" />,
      traditions: <BookOpen className="h-5 w-5" />,
      default: <BookOpen className="h-5 w-5" />,
    };
    return icons[sectionType] || icons.default;
  };

  return (
    <section 
      className="scroll-mt-24 relative bg-muted/20 border border-border/30 rounded-xl p-6 md:p-8" 
      id={title.toLowerCase().replace(/\s+/g, '-')}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary/40 rounded-full" />
      
      <h2 className="text-lg md:text-xl font-semibold mb-5 flex items-center gap-3 text-foreground pl-4">
        <span className="text-muted-foreground">{getIcon()}</span>
        <span>{title}</span>
      </h2>
      <div className="pl-4">
        {children}
      </div>
    </section>
  );
}

export default ContentDetailPage;
