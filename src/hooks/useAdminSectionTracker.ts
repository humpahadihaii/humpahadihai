import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to track which admin sections are visited by authenticated users.
 * Only tracks /admin/* routes and logs to admin_section_visits table.
 */
export function useAdminSectionTracker() {
  const location = useLocation();
  const { user, profile, isAuthenticated } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track admin routes for authenticated users
    if (!isAuthenticated || !user?.id || !location.pathname.startsWith('/admin')) {
      return;
    }

    // Don't track the same path twice in a row
    if (lastTrackedPath.current === location.pathname) {
      return;
    }

    lastTrackedPath.current = location.pathname;

    // Extract section from path
    const pathParts = location.pathname.split('/').filter(Boolean);
    const section = pathParts.length > 1 ? pathParts.slice(1).join('/') : 'dashboard';

    // Insert the visit record
    const trackVisit = async () => {
      try {
        await supabase.from('admin_section_visits').insert({
          user_id: user.id,
          user_email: profile?.email || user.email || 'unknown',
          section
        });
      } catch (error) {
        // Silently fail - analytics should never break the app
        console.debug('Failed to track admin section visit:', error);
      }
    };

    trackVisit();
  }, [location.pathname, isAuthenticated, user, profile]);
}
