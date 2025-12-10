import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  isLoading: boolean;
  isAuthInitialized: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isLoading: true,
    isAuthInitialized: false,
    isAuthenticated: false,
  });

  // Track if we've already initialized to prevent duplicate init
  const hasInitialized = useRef(false);
  const isInitializing = useRef(false);

  // Fetch user roles from user_roles table
  const fetchUserRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    try {
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching roles:", error);
        return [];
      }

      return normalizeRoles(userRoles?.map((r) => r.role) || []);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, status, role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return profile as UserProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, []);

  // Load profile and roles for a user
  const loadUserData = useCallback(
    async (session: Session) => {
      try {
        const [profile, roles] = await Promise.all([
          fetchProfile(session.user.id),
          fetchUserRoles(session.user.id),
        ]);

        setAuthState({
          user: session.user,
          session,
          profile,
          roles,
          isLoading: false,
          isAuthInitialized: true,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        // Still mark as authenticated and initialized even if profile/roles fail
        setAuthState({
          user: session.user,
          session,
          profile: null,
          roles: [],
          isLoading: false,
          isAuthInitialized: true,
          isAuthenticated: true,
        });
      }
    },
    [fetchProfile, fetchUserRoles]
  );

  // Clear auth state (for logout)
  const clearAuthState = useCallback(() => {
    setAuthState({
      user: null,
      session: null,
      profile: null,
      roles: [],
      isLoading: false,
      isAuthInitialized: true,
      isAuthenticated: false,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Prevent duplicate initialization
      if (isInitializing.current || hasInitialized.current) {
        return;
      }

      isInitializing.current = true;

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        if (!mounted) return;

        if (session) {
          await loadUserData(session);
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          hasInitialized.current = true;
          isInitializing.current = false;
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event);

      // Always set initialized to true on any auth event
      // to prevent infinite loading
      if (event === "SIGNED_OUT") {
        clearAuthState();
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          // Load user data without blocking UI
          // Set basic auth state immediately, then load additional data
          setAuthState((prev) => ({
            ...prev,
            user: session.user,
            session,
            isAuthenticated: true,
            isAuthInitialized: true, // Critical: always set to true
            isLoading: true, // Show we're loading more data
          }));

          // Load profile and roles in background
          loadUserData(session);
        }
      } else if (event === "INITIAL_SESSION") {
        // Initial session is handled by initializeAuth, skip to avoid duplicate
        if (!hasInitialized.current && session) {
          await loadUserData(session);
        } else if (!hasInitialized.current && !session) {
          clearAuthState();
        }
        hasInitialized.current = true;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, clearAuthState]);

  // Compute derived values using centralized helpers
  const isSuperAdmin = useMemo(() => {
    return checkIsSuperAdmin(authState.roles);
  }, [authState.roles]);

  const canAccessAdminPanel = useMemo(() => {
    return hasAdminPanelAccess(authState.roles);
  }, [authState.roles]);

  const hasRoles = useMemo(() => {
    return checkHasAnyRole(authState.roles);
  }, [authState.roles]);

  // isApproved: SUPER_ADMIN or any admin panel role = always approved
  const isApproved = useMemo(() => {
    if (isSuperAdmin) return true;
    if (canAccessAdminPanel) return true;
    if (hasRoles) return true; // Any role means approved
    return false;
  }, [isSuperAdmin, canAccessAdminPanel, hasRoles]);

  const isAdmin = useMemo(() => {
    return (
      authState.roles.includes("super_admin") || authState.roles.includes("admin")
    );
  }, [authState.roles]);

  // Get the highest priority role for display purposes
  const role = useMemo((): AppRole | null => {
    const priorityOrder: AppRole[] = [
      "super_admin",
      "admin",
      "content_manager",
      "content_editor",
      "editor",
      "moderator",
      "author",
      "reviewer",
      "media_manager",
      "seo_manager",
      "support_agent",
      "analytics_viewer",
      "developer",
      "viewer",
      "user",
    ];

    for (const r of priorityOrder) {
      if (authState.roles.includes(r)) return r;
    }
    return null;
  }, [authState.roles]);

  // Check if user has a specific role
  const hasRole = useCallback(
    (requiredRole: AppRole): boolean => {
      return authState.roles.includes(requiredRole);
    },
    [authState.roles]
  );

  // Check if user has any of the required roles (union of roles)
  const hasAnyRole = useCallback(
    (requiredRoles: AppRole[]): boolean => {
      return authState.roles.some((r) => requiredRoles.includes(r));
    },
    [authState.roles]
  );

  // Refresh auth state
  const refetch = useCallback(async () => {
    if (authState.session) {
      await loadUserData(authState.session);
    }
  }, [authState.session, loadUserData]);

  return {
    user: authState.user,
    session: authState.session,
    profile: authState.profile,
    roles: authState.roles,
    role, // Primary role for display
    isLoading: authState.isLoading,
    isAuthInitialized: authState.isAuthInitialized,
    isAuthenticated: authState.isAuthenticated,
    isSuperAdmin,
    isAdmin,
    canAccessAdminPanel,
    isApproved,
    hasRole,
    hasAnyRole,
    refetch,
  };
};

// Re-export for convenience
export { normalizeRoles, isSuperAdmin, hasAdminPanelAccess, routeAfterLogin } from "@/lib/authRoles";
export type { AppRole } from "@/lib/authRoles";
