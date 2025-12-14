import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/internalTracker';
import { useConsent } from '@/components/cookie';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation();
  const initialized = useRef(false);
  const previousPath = useRef<string | null>(null);
  const { hasConsent, isLoading } = useConsent();

  // Check if analytics consent is given
  const analyticsAllowed = hasConsent('analytics');

  // Initialize analytics on mount - with delay to avoid blocking render
  useEffect(() => {
    if (initialized.current || isLoading || !analyticsAllowed) return;
    initialized.current = true;
    previousPath.current = location.pathname;

    // Defer analytics initialization to not block the main thread
    const timeoutId = setTimeout(() => {
      try {
        trackPageView(window.location.href);
      } catch (e) {
        console.debug('Internal tracking failed:', e);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, isLoading, analyticsAllowed]);

  // Track page views on route change (SPA support)
  useEffect(() => {
    if (!initialized.current || previousPath.current === null || !analyticsAllowed) return;
    if (previousPath.current === location.pathname) return;

    const timeoutId = setTimeout(() => {
      try {
        trackPageView(window.location.href);
      } catch (e) {
        console.debug('Page view tracking failed:', e);
      }
      previousPath.current = location.pathname;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, analyticsAllowed]);

  return <>{children}</>;
}
