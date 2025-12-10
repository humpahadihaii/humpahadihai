import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { trackPageView, initInternalTracker } from '@/lib/internalTracker';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation();
  const initialized = useRef(false);
  const previousPath = useRef<string | null>(null);

  // Initialize analytics on mount
  useEffect(() => {
    if (!initialized.current) {
      // Initialize internal tracker (always runs)
      initInternalTracker();
      
      // Initialize GA4 if enabled
      analytics.loadSettings().then(({ enabled }) => {
        if (enabled) {
          analytics.init();
          
          // Track initial page view with GA
          analytics.pageView({
            page_path: location.pathname,
            page_title: document.title,
          });
        }
      });
      
      initialized.current = true;
      previousPath.current = location.pathname;
    }
  }, []);

  // Track page views on route change (SPA support)
  useEffect(() => {
    if (initialized.current && previousPath.current !== location.pathname) {
      // Small delay to allow page title to update
      const timeoutId = setTimeout(() => {
        // Track with internal tracker (always)
        trackPageView(window.location.href);
        
        // Track with GA4 if enabled
        analytics.pageView({
          page_path: location.pathname,
          page_title: document.title,
        });
        
        previousPath.current = location.pathname;
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);

  return <>{children}</>;
}