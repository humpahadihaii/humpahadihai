import { cn } from "@/lib/utils";

interface ContentSkeletonProps {
  variant?: "card" | "list" | "hero" | "text";
  count?: number;
  className?: string;
}

export function ContentSkeleton({
  variant = "card",
  count = 1,
  className,
}: ContentSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
            <div className="h-48 bg-muted skeleton-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4 skeleton-shimmer" />
              <div className="h-4 bg-muted rounded w-full skeleton-shimmer" />
              <div className="h-4 bg-muted rounded w-2/3 skeleton-shimmer" />
            </div>
          </div>
        );

      case "list":
        return (
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card animate-pulse">
            <div className="h-16 w-16 rounded-lg bg-muted skeleton-shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2 skeleton-shimmer" />
              <div className="h-3 bg-muted rounded w-3/4 skeleton-shimmer" />
            </div>
          </div>
        );

      case "hero":
        return (
          <div className="relative h-[60vh] min-h-[400px] bg-muted animate-pulse skeleton-shimmer rounded-lg" />
        );

      case "text":
        return (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-muted rounded w-full skeleton-shimmer" />
            <div className="h-4 bg-muted rounded w-5/6 skeleton-shimmer" />
            <div className="h-4 bg-muted rounded w-4/6 skeleton-shimmer" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ContentSkeleton key={index} variant="card" />
      ))}
    </div>
  );
}
