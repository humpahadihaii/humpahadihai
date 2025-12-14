import { ReactNode, Suspense, lazy, ComponentType } from "react";
import { useInViewport } from "@/hooks/useInViewport";
import { Skeleton } from "@/components/ui/skeleton";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  rootMargin?: string;
  minHeight?: string;
}

/**
 * LazySection - Only renders children when section enters viewport
 * Perfect for below-the-fold content to improve initial load
 */
export function LazySection({
  children,
  fallback,
  className = "",
  rootMargin = "200px",
  minHeight = "200px",
}: LazySectionProps) {
  const [ref, isInViewport] = useInViewport<HTMLDivElement>({
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={className} style={{ minHeight: isInViewport ? "auto" : minHeight }}>
      {isInViewport ? (
        <Suspense fallback={fallback || <SectionSkeleton />}>
          {children}
        </Suspense>
      ) : (
        fallback || <SectionSkeleton />
      )}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Create a lazy-loaded component that only loads when in viewport
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(importFn);
}
