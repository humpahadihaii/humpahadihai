import { useEffect, useRef, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageLoadState {
  progress: number;
  isComplete: boolean;
  isVisible: boolean;
}

/**
 * Hook for tracking page load progress with hybrid approach
 * Combines time-based progression with real signals from:
 * - Route navigation lifecycle
 * - React Query data fetching
 * - Image onLoad events
 */
export function usePageLoadProgress(options?: {
  dataLoading?: boolean;
  imageCount?: number;
  loadedImages?: number;
}) {
  const { dataLoading = false, imageCount = 0, loadedImages = 0 } = options || {};
  
  const [state, setState] = useState<PageLoadState>({
    progress: 5,
    isComplete: false,
    isVisible: true,
  });
  
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);
  const prevLocationRef = useRef(location.pathname);

  // Reset on route change
  useEffect(() => {
    if (location.pathname !== prevLocationRef.current) {
      prevLocationRef.current = location.pathname;
      startTimeRef.current = Date.now();
      setState({
        progress: 5,
        isComplete: false,
        isVisible: true,
      });
    }
  }, [location.pathname]);

  // Calculate target progress based on signals
  const calculateTarget = useCallback(() => {
    let target = 10; // Base progress
    
    // Route is ready (always true since we're rendered)
    target += 20;
    
    // Data loading status
    if (!dataLoading) {
      target += 40;
    }
    
    // Image loading status
    if (imageCount > 0 && loadedImages > 0) {
      const imageProgress = Math.min((loadedImages / imageCount) * 25, 25);
      target += imageProgress;
    } else if (imageCount === 0) {
      target += 25; // No images to wait for
    }
    
    // Time-based fallback (ensures progress never stalls)
    const elapsed = Date.now() - startTimeRef.current;
    const timeBasedMin = Math.min(10 + elapsed / 80, 88);
    
    // Use whichever is higher
    target = Math.max(target, timeBasedMin);
    
    // Cap at 95% until everything is ready
    const allReady = !dataLoading && (imageCount === 0 || loadedImages >= imageCount);
    
    return allReady ? 100 : Math.min(target, 95);
  }, [dataLoading, imageCount, loadedImages]);

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      const target = calculateTarget();
      
      setState(prev => {
        if (prev.isComplete) return prev;
        
        const remaining = target - prev.progress;
        
        // Smooth easing - faster initially, slower near target
        const step = Math.max(0.3, remaining * 0.06);
        const newProgress = Math.min(prev.progress + step, target);
        
        // Check for completion
        if (newProgress >= 100) {
          return {
            progress: 100,
            isComplete: true,
            isVisible: true,
          };
        }
        
        return {
          ...prev,
          progress: newProgress,
        };
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [calculateTarget]);

  // Fade out after completion
  useEffect(() => {
    if (state.isComplete) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, isVisible: false }));
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [state.isComplete]);

  // Fallback: force completion after 10 seconds
  useEffect(() => {
    const fallback = setTimeout(() => {
      setState({
        progress: 100,
        isComplete: true,
        isVisible: true,
      });
    }, 10000);
    
    return () => clearTimeout(fallback);
  }, [location.pathname]);

  return {
    progress: Math.round(state.progress),
    isComplete: state.isComplete,
    isVisible: state.isVisible,
    isLoading: !state.isComplete,
  };
}

/**
 * Hook for tracking above-the-fold image loading
 */
export function useImageLoadTracker(imageRefs: React.RefObject<HTMLImageElement>[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  
  useEffect(() => {
    const handlers: Array<() => void> = [];
    
    imageRefs.forEach((ref) => {
      if (ref.current) {
        if (ref.current.complete) {
          setLoadedCount(prev => prev + 1);
        } else {
          const handler = () => setLoadedCount(prev => prev + 1);
          ref.current.addEventListener("load", handler);
          handlers.push(() => ref.current?.removeEventListener("load", handler));
        }
      }
    });
    
    return () => handlers.forEach(cleanup => cleanup());
  }, [imageRefs]);
  
  return {
    loadedCount,
    totalCount: imageRefs.length,
    allLoaded: loadedCount >= imageRefs.length,
  };
}

export default usePageLoadProgress;
