import { useState, useCallback, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  aspectRatio?: string;
}

/**
 * FastImage - Optimized image component with instant loading feel
 * Uses native lazy loading, decoding async, and smooth fade-in
 */
export const FastImage = memo(function FastImage({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  aspectRatio,
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

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/50",
        containerClassName
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Lightweight skeleton - no animation until needed */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
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
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded && !hasError ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
});

/**
 * CardImage - Image optimized for cards with aspect ratio
 */
export const CardImage = memo(function CardImage({
  src,
  alt,
  className,
  aspectRatio = "16/9",
  ...props
}: FastImageProps) {
  return (
    <FastImage
      src={src}
      alt={alt}
      aspectRatio={aspectRatio}
      className={cn("w-full h-full object-cover", className)}
      containerClassName="w-full"
      {...props}
    />
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
      containerClassName={`w-[${size}px] h-[${size}px] rounded flex-shrink-0`}
      style={{ width: size, height: size }}
      {...props}
    />
  );
});
