import { Link } from "react-router-dom";
import { RelatedItem, PageType } from "@/lib/seo/generator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Star } from "lucide-react";

interface RelatedItemsProps {
  title: string;
  items: RelatedItem[];
  type: PageType;
  viewAllLink?: string;
  className?: string;
}

const typeToPath: Record<string, string> = {
  village: '/villages',
  district: '/districts',
  listing: '/marketplace',
  marketplace_listing: '/marketplace',
  travel_package: '/travel-packages',
  product: '/products',
  story: '/stories',
  thoughts: '/thoughts',
  event: '/events',
};

export function RelatedItems({ 
  title, 
  items, 
  type, 
  viewAllLink,
  className = "" 
}: RelatedItemsProps) {
  if (!items || items.length === 0) return null;

  const basePath = typeToPath[type] || `/${type}`;

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {viewAllLink && (
          <Link 
            to={viewAllLink}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <RelatedItemCard 
            key={item.id} 
            item={item} 
            basePath={basePath}
          />
        ))}
      </div>
    </section>
  );
}

interface RelatedItemCardProps {
  item: RelatedItem;
  basePath: string;
}

function RelatedItemCard({ item, basePath }: RelatedItemCardProps) {
  return (
    <Link to={`${basePath}/${item.slug}`}>
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-200 h-full">
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <MapPin className="h-8 w-8 text-primary/30" />
            </div>
          )}
          {item.promoted && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 text-xs bg-primary/90 text-primary-foreground"
            >
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </h4>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {item.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact horizontal list variant
interface RelatedItemsCompactProps {
  title: string;
  items: RelatedItem[];
  type: PageType;
  className?: string;
}

export function RelatedItemsCompact({ 
  title, 
  items, 
  type,
  className = "" 
}: RelatedItemsCompactProps) {
  if (!items || items.length === 0) return null;

  const basePath = typeToPath[type] || `/${type}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`${basePath}/${item.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
          >
            {item.image && (
              <img 
                src={item.image} 
                alt="" 
                className="w-4 h-4 rounded-full object-cover"
              />
            )}
            <span className="text-foreground">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Sidebar variant for detail pages
interface RelatedSidebarProps {
  sections: Array<{
    title: string;
    items: RelatedItem[];
    type: PageType;
    viewAllLink?: string;
  }>;
  className?: string;
}

export function RelatedSidebar({ sections, className = "" }: RelatedSidebarProps) {
  const nonEmptySections = sections.filter(s => s.items && s.items.length > 0);
  
  if (nonEmptySections.length === 0) return null;

  return (
    <aside className={`space-y-6 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
        Related Content
      </h3>
      {nonEmptySections.map((section, index) => (
        <div key={index} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {section.title}
            </h4>
            {section.viewAllLink && (
              <Link 
                to={section.viewAllLink}
                className="text-xs text-primary hover:underline"
              >
                See all
              </Link>
            )}
          </div>
          <ul className="space-y-2">
            {section.items.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  to={`${typeToPath[section.type] || `/${section.type}`}/${item.slug}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                >
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt=""
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
