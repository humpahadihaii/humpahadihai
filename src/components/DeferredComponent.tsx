import { lazy, Suspense, useState, useEffect, ComponentType, memo } from "react";

/**
 * Defers loading and rendering of non-critical components until:
 * 1. After first paint (requestAnimationFrame)
 * 2. During idle time (requestIdleCallback) when available
 * 3. Or after a timeout fallback
 * 
 * Perfect for: analytics, share buttons, toolbars, widgets
 */

interface DeferredOptions {
  /** Delay in ms before starting load (default: 0) */
  delay?: number;
  /** Use requestIdleCallback if available (default: true) */
  useIdle?: boolean;
  /** Timeout for idle callback (default: 2000ms) */
  idleTimeout?: number;
}

/**
 * Creates a deferred lazy component that loads after first paint
 */
export function createDeferredComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DeferredOptions = {}
): ComponentType<React.ComponentProps<T>> {
  const { delay = 0, useIdle = true, idleTimeout = 2000 } = options;
  
  const LazyComponent = lazy(importFn);
  
  return memo(function DeferredWrapper(props: React.ComponentProps<T>) {
    const [shouldRender, setShouldRender] = useState(false);
    
    useEffect(() => {
      let mounted = true;
      
      const startLoad = () => {
        if (!mounted) return;
        
        // Wait for next frame to not block first paint
        requestAnimationFrame(() => {
          if (!mounted) return;
          
          if (useIdle && "requestIdleCallback" in window) {
            // Use idle callback for best performance
            (window as any).requestIdleCallback(
              () => { if (mounted) setShouldRender(true); },
              { timeout: idleTimeout }
            );
          } else {
            // Fallback: use setTimeout
            setTimeout(() => { if (mounted) setShouldRender(true); }, 100);
          }
        });
      };
      
      if (delay > 0) {
        const timer = setTimeout(startLoad, delay);
        return () => { mounted = false; clearTimeout(timer); };
      } else {
        startLoad();
        return () => { mounted = false; };
      }
    }, []);
    
    if (!shouldRender) return null;
    
    return (
      <Suspense fallback={null}>
        <LazyComponent {...props} />
      </Suspense>
    );
  });
}

/**
 * Hook to defer execution until browser is idle
 */
export function useIdleCallback(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    let handle: number;
    
    if ("requestIdleCallback" in window) {
      handle = (window as any).requestIdleCallback(callback, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(callback, 100);
      return () => clearTimeout(timer);
    }
  }, deps);
}

/**
 * Component wrapper for deferring children until idle
 */
export const DeferredRender = memo(function DeferredRender({
  children,
  delay = 0,
  fallback = null,
}: {
  children: React.ReactNode;
  delay?: number;
  fallback?: React.ReactNode;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const startRender = () => {
      requestAnimationFrame(() => {
        if (!mounted) return;
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback(
            () => { if (mounted) setShouldRender(true); },
            { timeout: 2000 }
          );
        } else {
          setTimeout(() => { if (mounted) setShouldRender(true); }, 100);
        }
      });
    };
    
    if (delay > 0) {
      const timer = setTimeout(startRender, delay);
      return () => { mounted = false; clearTimeout(timer); };
    } else {
      startRender();
      return () => { mounted = false; };
    }
  }, [delay]);
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
});
