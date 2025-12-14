import { TrendingUp, Eye, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopularityIndicatorProps {
  type?: "trending" | "popular" | "views" | "rating";
  value?: number | string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

const INDICATOR_CONFIG = {
  trending: {
    icon: TrendingUp,
    label: "Trending",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  popular: {
    icon: Users,
    label: "Popular",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  views: {
    icon: Eye,
    label: "Views",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  rating: {
    icon: Star,
    label: "Rating",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
};

export function PopularityIndicator({
  type = "popular",
  value,
  label,
  className,
  size = "sm",
}: PopularityIndicatorProps) {
  const config = INDICATOR_CONFIG[type];
  const Icon = config.icon;

  const formattedValue = typeof value === "number"
    ? value >= 1000
      ? `${(value / 1000).toFixed(1)}k`
      : value.toString()
    : value;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bg,
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {formattedValue && <span>{formattedValue}</span>}
      {label && <span>{label}</span>}
      {!formattedValue && !label && <span>{config.label}</span>}
    </div>
  );
}

/**
 * Subtle view count indicator (non-intrusive)
 */
export function ViewCount({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count < 10) return null; // Don't show for very low counts

  const formatted = count >= 1000 
    ? `${(count / 1000).toFixed(1)}k` 
    : count.toString();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
      title={`${count.toLocaleString()} views`}
    >
      <Eye className="h-3 w-3" />
      {formatted}
    </span>
  );
}

/**
 * Rating display with stars
 */
export function RatingDisplay({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
