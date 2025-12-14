import { useState, useCallback, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  aspectRatio?: string;
  width?: number;
  height?: number;
}

/**
 * FastImage - Optimized image component with instant loading feel
 * Uses native lazy loading, decoding async, and smooth fade-in
 * Priority images are eager-loaded with high fetchPriority
 */
export const FastImage = memo(function FastImage({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  aspectRatio,
  width,
  height,
  ...props
}: FastImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if already cached on mount
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // Calculate container styles to prevent layout shift
  const containerStyle: React.CSSProperties = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(width && height ? { width, height } : {}),
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/30",
        containerClassName
      )}
      style={containerStyle}
    >
      {/* Skeleton placeholder - reserves layout space */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-muted skeleton-shimmer"
          aria-hidden="true"
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          <span>Image unavailable</span>
        </div>
      )}

      {/* Image with native optimizations */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-200",
          isLoaded && !hasError ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
});

/**
 * CardImage - Image optimized for cards with fixed aspect ratio to prevent CLS
 */
export const CardImage = memo(function CardImage({
  src,
  alt,
  className,
  aspectRatio = "16/9",
  priority = false,
  ...props
}: FastImageProps) {
  return (
    <FastImage
      src={src}
      alt={alt}
      aspectRatio={aspectRatio}
      priority={priority}
      className={cn("w-full h-full object-cover", className)}
      containerClassName="w-full"
      {...props}
    />
  );
});

/**
 * HeroImage - High priority image for above-the-fold hero sections
 * Always eager loaded with high priority
 */
export const HeroImage = memo(function HeroImage({
  src,
  alt,
  className,
  overlay = true,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Skeleton background for instant visual */}
      <div 
        className={cn(
          "absolute inset-0 bg-primary/20 transition-opacity duration-300",
          isLoaded ? "opacity-0" : "opacity-100"
        )} 
      />
      
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      
      {overlay && (
        <div className="absolute inset-0 hero-overlay" aria-hidden="true" />
      )}
      
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
});

/**
 * ThumbnailImage - Small optimized image with fixed dimensions
 */
export const ThumbnailImage = memo(function ThumbnailImage({
  src,
  alt,
  size = 64,
  className,
  ...props
}: FastImageProps & { size?: number }) {
  return (
    <FastImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("w-full h-full object-cover rounded", className)}
      containerClassName="rounded flex-shrink-0"
      style={{ width: size, height: size }}
      {...props}
    />
  );
});
