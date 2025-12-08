import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/roles";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
    isSuperAdmin: false,
    isAdmin: false,
  });

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole | null> => {
    try {
      // Check for super_admin first
      const { data: isSuperAdmin } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "super_admin",
      });

      if (isSuperAdmin) return "super_admin";

      // Check for admin
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (isAdmin) return "admin";

      // Check for other roles in priority order
      const rolesToCheck: UserRole[] = [
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

      for (const role of rolesToCheck) {
        const { data: hasRole } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: role,
        });
        if (hasRole) return role;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(async (user: User | null) => {
    if (!user) {
      setAuthState({
        user: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
        isSuperAdmin: false,
        isAdmin: false,
      });
      return;
    }

    const role = await fetchUserRole(user.id);
    
    setAuthState({
      user,
      role,
      isLoading: false,
      isAuthenticated: true,
      isSuperAdmin: role === "super_admin",
      isAdmin: role === "super_admin" || role === "admin",
    });
  }, [fetchUserRole]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        updateAuthState(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [updateAuthState]);

  const hasRole = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!authState.role) return false;
      return authState.role === requiredRole;
    },
    [authState.role]
  );

  const hasAnyRole = useCallback(
    (requiredRoles: UserRole[]): boolean => {
      if (!authState.role) return false;
      return requiredRoles.includes(authState.role);
    },
    [authState.role]
  );

  return {
    ...authState,
    hasRole,
    hasAnyRole,
    refetch: () => updateAuthState(authState.user),
  };
};
