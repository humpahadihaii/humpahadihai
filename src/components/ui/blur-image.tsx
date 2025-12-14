import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

/**
 * BlurImage component with blur-up loading effect
 * Shows a blurred placeholder while the full image loads
 */
export function BlurImage({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  ...props
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Check if image is already cached
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        containerClassName
      )}
    >
      {/* Placeholder skeleton */}
      <div
        className={cn(
          "absolute inset-0 bg-muted animate-pulse transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />

      {/* Blurred background (shows during load) */}
      {!isLoaded && isInView && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/5 animate-pulse"
          style={{
            backdropFilter: "blur(20px)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          className={cn(
            "transition-all duration-500 ease-out",
            isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-105",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * Hero image with blur-up effect and overlay support
 */
export function HeroImage({
  src,
  alt,
  overlay = true,
  className,
  children,
}: {
  src: string;
  alt: string;
  overlay?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      <BlurImage
        src={src}
        alt={alt}
        priority
        className="absolute inset-0 w-full h-full object-cover"
        containerClassName="absolute inset-0"
      />
      {overlay && (
        <div className="absolute inset-0 hero-overlay" aria-hidden="true" />
      )}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
