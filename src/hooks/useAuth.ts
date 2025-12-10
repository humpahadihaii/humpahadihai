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
  isPendingApproval,
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
  // 1. All useState hooks first
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isAuthInitialized: false,
  });

  // 2. All useRef hooks
  const mountedRef = useRef(true);
  const initStartedRef = useRef(false);

  // 3. All useCallback hooks
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
      console.error("[Auth] Error loading profile/roles:", error);
      return { profile: null, roles: [] };
    }
  }, []);

  const signOut = useCallback(async () => {
    // Clear state first
    setAuthState({
      user: null,
      session: null,
      profile: null,
      roles: [],
      isAuthInitialized: true,
    });
    
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.error("[Auth] Sign out error:", e);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (authState.session?.user?.id) {
      const { profile, roles } = await loadProfileAndRoles(authState.session.user.id);
      if (mountedRef.current) {
        setAuthState((prev) => ({ ...prev, profile, roles }));
      }
    }
  }, [authState.session, loadProfileAndRoles]);

  // 4. All useMemo hooks - derived state
  const isSuperAdmin = useMemo(() => checkIsSuperAdmin(authState.roles), [authState.roles]);
  const canAccessAdminPanel = useMemo(() => hasAdminPanelAccess(authState.roles), [authState.roles]);
  const hasRoles = useMemo(() => checkHasAnyRole(authState.roles), [authState.roles]);
  const isAuthenticated = useMemo(() => !!authState.session, [authState.session]);
  const isPending = useMemo(() => isPendingApproval(authState.roles, authState.profile?.status), [authState.roles, authState.profile?.status]);
  const isApproved = useMemo(() => !isPending && (isSuperAdmin || canAccessAdminPanel || hasRoles), [isPending, isSuperAdmin, canAccessAdminPanel, hasRoles]);
  const isAdmin = useMemo(() => authState.roles.includes("super_admin") || authState.roles.includes("admin"), [authState.roles]);
  const role = useMemo((): AppRole | null => getHighestPriorityRole(authState.roles), [authState.roles]);

  // Role checking utilities
  const hasRole = useCallback((requiredRole: AppRole): boolean => authState.roles.includes(requiredRole), [authState.roles]);
  const hasAnyRole = useCallback((requiredRoles: AppRole[]): boolean => authState.roles.some((r) => requiredRoles.includes(r)), [authState.roles]);

  // 5. useEffect for initialization
  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      // Prevent double initialization
      if (initStartedRef.current) return;
      initStartedRef.current = true;

      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !mountedRef.current) {
          if (mountedRef.current) {
            setAuthState(prev => ({ ...prev, isAuthInitialized: true }));
          }
          return;
        }

        const session = data?.session ?? null;

        if (session?.user?.id) {
          // CRITICAL: Load profile/roles FIRST before marking initialized
          const { profile, roles } = await loadProfileAndRoles(session.user.id);
          
          if (mountedRef.current) {
            // Set EVERYTHING at once including isAuthInitialized
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
        console.error("[Auth] Init error:", error);
        if (mountedRef.current) {
          setAuthState(prev => ({ ...prev, isAuthInitialized: true }));
        }
      }
    };

    initAuth();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mountedRef.current) return;

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

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession?.user?.id) {
            // CRITICAL: Load roles BEFORE setting state to prevent race condition
            const userId = newSession.user.id;
            
            // Load profile/roles first
            loadProfileAndRoles(userId).then(({ profile, roles }) => {
              if (!mountedRef.current) return;
              
              // Set ALL state at once including roles
              setAuthState({
                user: newSession.user,
                session: newSession,
                profile,
                roles,
                isAuthInitialized: true,
              });
            }).catch((error) => {
              console.error("[Auth] Error loading roles:", error);
              // Still set session even if roles fail
              if (mountedRef.current) {
                setAuthState(prev => ({
                  ...prev,
                  user: newSession.user,
                  session: newSession,
                  isAuthInitialized: true,
                }));
              }
            });
          }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfileAndRoles]);

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
    isPending,
    hasRole,
    hasAnyRole,
    refetch,
    signOut,
  };
};

// Re-export for convenience
export { normalizeRoles, isSuperAdmin, hasAdminPanelAccess, routeAfterLogin, getHighestPriorityRole, isPendingApproval } from "@/lib/authRoles";
export type { AppRole } from "@/lib/authRoles";
