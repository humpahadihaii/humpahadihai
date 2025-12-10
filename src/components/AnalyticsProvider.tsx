import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

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
      analytics.loadSettings().then(({ enabled }) => {
        if (enabled) {
          analytics.init();
          initialized.current = true;
          
          // Track initial page view
          analytics.pageView({
            page_path: location.pathname,
            page_title: document.title,
          });
          previousPath.current = location.pathname;
        }
      });
    }
  }, []);

  // Track page views on route change (SPA support)
  useEffect(() => {
    if (initialized.current && previousPath.current !== location.pathname) {
      // Small delay to allow page title to update
      const timeoutId = setTimeout(() => {
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
