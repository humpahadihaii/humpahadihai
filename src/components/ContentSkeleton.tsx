import { cn } from "@/lib/utils";

interface ContentSkeletonProps {
  variant?: "card" | "list" | "hero" | "text" | "image";
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
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted skeleton-shimmer" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-muted rounded-md w-3/4 skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-md w-full skeleton-shimmer" />
                <div className="h-4 bg-muted rounded-md w-5/6 skeleton-shimmer" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-8 bg-muted rounded-md w-24 skeleton-shimmer" />
                <div className="h-6 bg-muted rounded-full w-16 skeleton-shimmer" />
              </div>
            </div>
          </div>
        );

      case "list":
        return (
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card animate-pulse">
            <div className="h-16 w-16 rounded-lg bg-muted skeleton-shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-muted rounded-md w-2/3 skeleton-shimmer" />
              <div className="h-3 bg-muted rounded-md w-full skeleton-shimmer" />
              <div className="h-3 bg-muted rounded-md w-1/2 skeleton-shimmer" />
            </div>
          </div>
        );

      case "hero":
        return (
          <div className="relative h-[60vh] min-h-[400px] bg-muted animate-pulse skeleton-shimmer rounded-xl overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
              <div className="h-10 bg-muted-foreground/10 rounded-lg w-3/4 max-w-lg skeleton-shimmer" />
              <div className="h-6 bg-muted-foreground/10 rounded-md w-1/2 max-w-sm skeleton-shimmer" />
              <div className="flex gap-3 mt-4">
                <div className="h-11 bg-muted-foreground/10 rounded-lg w-32 skeleton-shimmer" />
                <div className="h-11 bg-muted-foreground/10 rounded-lg w-32 skeleton-shimmer" />
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded-md w-full skeleton-shimmer" />
            <div className="h-4 bg-muted rounded-md w-11/12 skeleton-shimmer" />
            <div className="h-4 bg-muted rounded-md w-4/5 skeleton-shimmer" />
            <div className="h-4 bg-muted rounded-md w-3/4 skeleton-shimmer" />
          </div>
        );

      case "image":
        return (
          <div className="aspect-video bg-muted rounded-xl animate-pulse skeleton-shimmer" />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ContentSkeleton key={index} variant="card" />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <ContentSkeleton key={index} variant="list" />
      ))}
    </div>
  );
}
