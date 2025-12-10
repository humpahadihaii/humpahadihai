import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  AppRole,
  normalizeRoles,
  isSuperAdmin as checkIsSuperAdmin,
  hasAdminPanelAccess,
  hasAnyRole as checkHasAnyRole,
  getHighestPriorityRole,
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
  isRolesLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isAuthInitialized: false,
    isRolesLoading: false,
  });

  // Use ref to track mount status and prevent state updates after unmount
  const mountedRef = useRef(true);
  const initCompletedRef = useRef(false);

  // Load profile and roles for a user - defined outside useEffect to be stable
  const loadProfileAndRoles = useCallback(async (userId: string): Promise<{
    profile: UserProfile | null;
    roles: AppRole[];
  }> => {
    console.log("[Auth] Loading profile and roles for user:", userId);
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

      console.log("[Auth] Loaded profile:", profile?.email, "roles:", roles);
      return { profile, roles };
    } catch (error) {
      console.error("[Auth] Error loading profile/roles:", error);
      return { profile: null, roles: [] };
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    initCompletedRef.current = false;

    // Initialize auth on mount
    const initAuth = async () => {
      // Skip if already completed (handles StrictMode double-invoke)
      if (initCompletedRef.current) {
        console.log("[Auth] Init already completed, skipping");
        return;
      }

      console.log("[Auth] Starting initialization...");
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[Auth] Error getting session:", error);
        }

        if (!mountedRef.current) return;

        const session = data?.session ?? null;
        console.log("[Auth] Session check complete, user:", session?.user?.email || "none");

        initCompletedRef.current = true;

        if (session?.user?.id) {
          // Set initialized with session immediately
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session,
            isAuthInitialized: true,
            isRolesLoading: true,
          }));

          // Load profile/roles
          const { profile, roles } = await loadProfileAndRoles(session.user.id);
          if (mountedRef.current) {
            console.log("[Auth] Init complete with roles:", roles);
            setAuthState(prev => ({
              ...prev,
              profile,
              roles,
              isRolesLoading: false,
            }));
          }
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            roles: [],
            isAuthInitialized: true,
            isRolesLoading: false,
          });
        }
      } catch (error) {
        console.error("[Auth] Error initializing auth:", error);
        if (mountedRef.current) {
          setAuthState(prev => ({
            ...prev,
            isAuthInitialized: true,
            isRolesLoading: false,
          }));
        }
      }
    };

    initAuth();

    // Subscribe to auth changes - MUST NOT be async function
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mountedRef.current) return;

        console.log("[Auth] Auth event:", event, "user:", newSession?.user?.email || "none");

        if (event === "SIGNED_OUT" || !newSession) {
          console.log("[Auth] User signed out, clearing state");
          setAuthState({
            user: null,
            session: null,
            profile: null,
            roles: [],
            isAuthInitialized: true,
            isRolesLoading: false,
          });
          return;
        }

        // For auth events, update session immediately then load data via setTimeout
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession?.user?.id) {
            console.log("[Auth] Updating session for", event);
            
            // Update session state immediately
            setAuthState(prev => ({
              ...prev,
              user: newSession.user,
              session: newSession,
              isAuthInitialized: true,
              isRolesLoading: true,
            }));

            // Load profile/roles in next tick to avoid Supabase deadlock
            const userId = newSession.user.id;
            setTimeout(async () => {
              if (!mountedRef.current) return;
              try {
                const { profile, roles } = await loadProfileAndRoles(userId);
                if (mountedRef.current) {
                  console.log("[Auth] Roles loaded after", event, ":", roles);
                  setAuthState(prev => ({
                    ...prev,
                    profile,
                    roles,
                    isRolesLoading: false,
                  }));
                }
              } catch (error) {
                console.error("[Auth] Error loading roles after auth event:", error);
                if (mountedRef.current) {
                  setAuthState(prev => ({
                    ...prev,
                    isRolesLoading: false,
                  }));
                }
              }
            }, 0);
          }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  // Compute derived values
  const isSuperAdmin = useMemo(() => checkIsSuperAdmin(authState.roles), [authState.roles]);
  const canAccessAdminPanel = useMemo(() => hasAdminPanelAccess(authState.roles), [authState.roles]);
  const hasRoles = useMemo(() => checkHasAnyRole(authState.roles), [authState.roles]);
  const isAuthenticated = useMemo(() => !!authState.session, [authState.session]);
  const isApproved = useMemo(() => isSuperAdmin || canAccessAdminPanel || hasRoles, [isSuperAdmin, canAccessAdminPanel, hasRoles]);
  const isAdmin = useMemo(() => authState.roles.includes("super_admin") || authState.roles.includes("admin"), [authState.roles]);

  // Get highest priority role for display
  const role = useMemo((): AppRole | null => {
    return getHighestPriorityRole(authState.roles);
  }, [authState.roles]);

  const hasRole = useCallback((requiredRole: AppRole): boolean => authState.roles.includes(requiredRole), [authState.roles]);
  const hasAnyRole = useCallback((requiredRoles: AppRole[]): boolean => authState.roles.some((r) => requiredRoles.includes(r)), [authState.roles]);

  const refetch = useCallback(async () => {
    if (authState.session?.user?.id) {
      console.log("[Auth] Refetching profile and roles");
      setAuthState(prev => ({ ...prev, isRolesLoading: true }));
      const { profile, roles } = await loadProfileAndRoles(authState.session.user.id);
      setAuthState((prev) => ({ ...prev, profile, roles, isRolesLoading: false }));
    }
  }, [authState.session, loadProfileAndRoles]);

  // Sign out function - guaranteed to complete and navigate
  const signOut = useCallback(async () => {
    console.log("[Auth] Starting sign out...");
    try {
      // Clear state first to prevent any UI issues
      setAuthState({
        user: null,
        session: null,
        profile: null,
        roles: [],
        isAuthInitialized: true,
        isRolesLoading: false,
      });
      
      // Then sign out from Supabase
      await supabase.auth.signOut({ scope: 'local' });
      console.log("[Auth] Sign out complete");
    } catch (e) {
      console.error("[Auth] Sign out error:", e);
      // Even on error, state is already cleared so user can proceed
    }
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    profile: authState.profile,
    roles: authState.roles,
    role,
    isAuthInitialized: authState.isAuthInitialized,
    isRolesLoading: authState.isRolesLoading,
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
export { normalizeRoles, isSuperAdmin, hasAdminPanelAccess, routeAfterLogin, getHighestPriorityRole } from "@/lib/authRoles";
export type { AppRole } from "@/lib/authRoles";
