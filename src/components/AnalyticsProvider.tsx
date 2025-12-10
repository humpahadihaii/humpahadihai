import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { trackPageView } from '@/lib/internalTracker';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation();
  const initialized = useRef(false);
  const previousPath = useRef<string | null>(null);

  // Initialize analytics on mount - with delay to avoid blocking render
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    previousPath.current = location.pathname;

    // Defer all analytics initialization to not block the main thread
    const timeoutId = setTimeout(() => {
      // Track initial page view with internal tracker
      try {
        trackPageView(window.location.href);
      } catch (e) {
        console.debug('Internal tracking failed:', e);
      }

      // Initialize GA4 if enabled (async, non-blocking)
      analytics.loadSettings().then(({ enabled }) => {
        if (enabled) {
          analytics.init();
          analytics.pageView({
            page_path: location.pathname,
            page_title: document.title,
          });
        }
      }).catch(() => {
        // Silently fail - analytics should never break the app
      });
    }, 500); // Delay to ensure auth and other critical code runs first

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // Track page views on route change (SPA support)
  useEffect(() => {
    // Skip initial render
    if (!initialized.current || previousPath.current === null) return;
    if (previousPath.current === location.pathname) return;

    // Small delay to allow page title to update
    const timeoutId = setTimeout(() => {
      try {
        // Track with internal tracker
        trackPageView(window.location.href);

        // Track with GA4 if enabled
        analytics.pageView({
          page_path: location.pathname,
          page_title: document.title,
        });
      } catch (e) {
        console.debug('Page view tracking failed:', e);
      }

      previousPath.current = location.pathname;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return <>{children}</>;
}