import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCombinedFeaturedContent, SECTION_LABELS } from "@/hooks/useFeaturedContent";
import { MapPin, Utensils, Mountain, Sparkles, Trees } from "lucide-react";

interface FeaturedContentSectionProps {
  sectionKey: string;
  limit?: number;
  showSectionTitle?: boolean;
  variant?: "card" | "hero" | "compact";
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  cultural_highlight: Sparkles,
  local_food: Utensils,
  spiritual: Mountain,
  nature: Trees,
  districts: MapPin,
};

const SECTION_GRADIENTS: Record<string, string> = {
  cultural_highlight: "from-primary/80 to-accent/60",
  local_food: "from-secondary/80 to-orange-600/60",
  spiritual: "from-purple-600/80 to-indigo-600/60",
  nature: "from-green-600/80 to-emerald-600/60",
  districts: "from-blue-600/80 to-cyan-600/60",
};

export function FeaturedContentSection({ 
  sectionKey, 
  limit = 3, 
  showSectionTitle = true,
  variant = "card" 
}: FeaturedContentSectionProps) {
  const { data: content, isLoading } = useCombinedFeaturedContent(sectionKey, limit);
  
  const Icon = SECTION_ICONS[sectionKey] || Sparkles;
  const gradient = SECTION_GRADIENTS[sectionKey] || "from-primary/80 to-accent/60";
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {showSectionTitle && (
          <Skeleton className="h-8 w-64" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  
  if (!content || content.length === 0) {
    return null;
  }
  
  if (variant === "hero") {
    return (
      <div className="space-y-6">
        {showSectionTitle && (
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
              {SECTION_LABELS[sectionKey] || "Featured Content"}
            </h2>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item, index) => (
            <Link
              key={item.id}
              to={`/districts/${item.district?.slug}/${item.category?.slug}/${item.slug}`}
              className={`relative rounded-2xl overflow-hidden group block ${index === 0 && content.length > 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="aspect-[4/3] relative">
                {item.hero_image ? (
                  <img
                    src={item.hero_image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.district && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.district.name}
                      </Badge>
                    )}
                    {item.category && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                        {item.category.name}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-semibold text-white mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.short_intro && (
                    <p className="text-sm text-white/80 line-clamp-2">
                      {item.short_intro}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {showSectionTitle && (
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              {SECTION_LABELS[sectionKey] || "Featured"}
            </h3>
          </div>
        )}
        
        <div className="space-y-3">
          {content.map((item) => (
            <Link
              key={item.id}
              to={`/districts/${item.district?.slug}/${item.category?.slug}/${item.slug}`}
              className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {item.hero_image && (
                <img
                  src={item.hero_image}
                  alt={item.title}
                  loading="lazy"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h4>
                {item.short_intro && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.short_intro}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  // Default card variant
  return (
    <div className="space-y-6">
      {showSectionTitle && (
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            {SECTION_LABELS[sectionKey] || "Featured Content"}
          </h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <Card
            key={item.id}
            className="group card-interactive overflow-hidden"
          >
            <Link to={`/districts/${item.district?.slug}/${item.category?.slug}/${item.slug}`}>
              <div className="aspect-[16/10] relative overflow-hidden">
                {item.hero_image ? (
                  <img
                    src={item.hero_image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.district && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {item.district.name}
                    </Badge>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.short_intro && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {item.short_intro}
                  </p>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FeaturedContentSection;
