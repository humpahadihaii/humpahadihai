import { Link } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import { useRecentlyViewed, RecentlyViewedItem } from "@/hooks/useLocalPreferences";
import { cn } from "@/lib/utils";

interface RecentlyViewedProps {
  className?: string;
  maxItems?: number;
  variant?: "horizontal" | "vertical";
  title?: string;
}

function getItemPath(item: RecentlyViewedItem): string {
  switch (item.type) {
    case "district":
      return `/districts/${item.slug}`;
    case "village":
      return `/villages/${item.slug}`;
    case "culture":
      return `/culture/${item.slug}`;
    case "food":
      return `/food/${item.slug}`;
    case "travel":
      return `/travel/${item.slug}`;
    case "package":
      return `/travel-packages/${item.slug}`;
    case "product":
      return `/products/${item.slug}`;
    case "provider":
      return `/providers/${item.slug}`;
    case "event":
      return `/events/${item.slug}`;
    default:
      return `/${item.type}/${item.slug}`;
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function RecentlyViewed({
  className,
  maxItems = 5,
  variant = "horizontal",
  title = "Recently Viewed",
}: RecentlyViewedProps) {
  const { items } = useRecentlyViewed();
  
  if (items.length === 0) return null;

  const displayItems = items.slice(0, maxItems);

  if (variant === "vertical") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <div className="space-y-2">
          {displayItems.map((item) => (
            <Link
              key={item.slug}
              to={getItemPath(item)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-150 group"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover bg-muted"
                  loading="lazy"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {item.type} • {formatTimeAgo(item.viewedAt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
        <Clock className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {displayItems.map((item) => (
          <Link
            key={item.slug}
            to={getItemPath(item)}
            className="flex-shrink-0 w-28 group"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {item.title}
            </p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {item.type}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
