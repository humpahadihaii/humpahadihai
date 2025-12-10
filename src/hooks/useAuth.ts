import { useState, useEffect, useCallback, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  AppRole,
  normalizeRoles,
  isSuperAdmin as checkIsSuperAdmin,
  hasAdminPanelAccess,
  hasAnyRole as checkHasAnyRole,
} from "@/lib/authRoles";

export type UserStatus = "pending" | "active" | "disabled";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  status: UserStatus | null;
  role: AppRole | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: AppRole[];
  isAuthInitialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isAuthInitialized: false,
  });

  // Load profile and roles for a user - NEVER THROWS
  const loadProfileAndRoles = useCallback(async (userId: string): Promise<{
    profile: UserProfile | null;
    roles: AppRole[];
  }> => {
    try {
      const [profileResult, rolesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, full_name, status, role")
          .eq("id", userId)
          .single(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId),
      ]);

      const profile = profileResult.error ? null : (profileResult.data as UserProfile);
      const roles = rolesResult.error ? [] : normalizeRoles(rolesResult.data?.map((r) => r.role) || []);

      return { profile, roles };
    } catch (error) {
      console.error("Error loading profile/roles:", error);
      return { profile: null, roles: [] };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initialize auth on mount
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }

        if (!mounted) return;

        const session = data?.session ?? null;

        if (session?.user?.id) {
          const { profile, roles } = await loadProfileAndRoles(session.user.id);
          if (mounted) {
            setAuthState({
              user: session.user,
              session,
              profile,
              roles,
              isAuthInitialized: true,
            });
          }
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            roles: [],
            isAuthInitialized: true,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            roles: [],
            isAuthInitialized: true, // ALWAYS set to true, even on error
          });
        }
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log("Auth event:", event);

        if (event === "SIGNED_OUT" || !newSession) {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            roles: [],
            isAuthInitialized: true,
          });
          return;
        }

        // For any sign-in or token refresh, load user data
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
          if (newSession?.user?.id) {
            const { profile, roles } = await loadProfileAndRoles(newSession.user.id);
            if (mounted) {
              setAuthState({
                user: newSession.user,
                session: newSession,
                profile,
                roles,
                isAuthInitialized: true,
              });
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfileAndRoles]);

  // Compute derived values
  const isSuperAdmin = useMemo(() => checkIsSuperAdmin(authState.roles), [authState.roles]);
  const canAccessAdminPanel = useMemo(() => hasAdminPanelAccess(authState.roles), [authState.roles]);
  const hasRoles = useMemo(() => checkHasAnyRole(authState.roles), [authState.roles]);
  const isAuthenticated = useMemo(() => !!authState.session, [authState.session]);
  const isApproved = useMemo(() => isSuperAdmin || canAccessAdminPanel || hasRoles, [isSuperAdmin, canAccessAdminPanel, hasRoles]);
  const isAdmin = useMemo(() => authState.roles.includes("super_admin") || authState.roles.includes("admin"), [authState.roles]);

  // Get highest priority role for display
  const role = useMemo((): AppRole | null => {
    const priorityOrder: AppRole[] = [
      "super_admin", "admin", "content_manager", "content_editor", "editor",
      "moderator", "author", "reviewer", "media_manager", "seo_manager",
      "support_agent", "analytics_viewer", "developer", "viewer", "user",
    ];
    for (const r of priorityOrder) {
      if (authState.roles.includes(r)) return r;
    }
    return null;
  }, [authState.roles]);

  const hasRole = useCallback((requiredRole: AppRole): boolean => authState.roles.includes(requiredRole), [authState.roles]);
  const hasAnyRole = useCallback((requiredRoles: AppRole[]): boolean => authState.roles.some((r) => requiredRoles.includes(r)), [authState.roles]);

  const refetch = useCallback(async () => {
    if (authState.session?.user?.id) {
      const { profile, roles } = await loadProfileAndRoles(authState.session.user.id);
      setAuthState((prev) => ({ ...prev, profile, roles }));
    }
  }, [authState.session, loadProfileAndRoles]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    setAuthState({
      user: null,
      session: null,
      profile: null,
      roles: [],
      isAuthInitialized: true,
    });
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    profile: authState.profile,
    roles: authState.roles,
    role,
    isAuthInitialized: authState.isAuthInitialized,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    canAccessAdminPanel,
    isApproved,
    hasRole,
    hasAnyRole,
    refetch,
    signOut,
  };
};

// Re-export for convenience
export { normalizeRoles, isSuperAdmin, hasAdminPanelAccess, routeAfterLogin } from "@/lib/authRoles";
export type { AppRole } from "@/lib/authRoles";
