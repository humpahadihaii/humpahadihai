import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RBACRole, normalizeRoles } from "@/lib/rbac";

interface ImpersonatedUser {
  id: string;
  email: string;
  fullName: string | null;
  roles: string[];
}

interface ImpersonationState {
  isImpersonating: boolean;
  impersonatedUser: ImpersonatedUser | null;
  sessionToken: string | null;
  impersonationId: string | null;
}

const STORAGE_KEY = "admin_impersonation_state";

export function useImpersonation() {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    impersonatedUser: null,
    sessionToken: null,
    impersonationId: null,
  });
  const [loading, setLoading] = useState(false);

  // Load state from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch (e) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist state to sessionStorage
  const persistState = useCallback((newState: ImpersonationState) => {
    if (newState.isImpersonating) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setState(newState);
  }, []);

  const startImpersonation = useCallback(async (targetUserId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: "Not authenticated" };
      }

      const response = await supabase.functions.invoke("impersonate-user", {
        body: {
          action: "start",
          targetUserId,
          reason,
        },
      });

      if (response.error) {
        console.error("Impersonation error:", response.error);
        return { success: false, error: response.error.message || "Failed to start impersonation" };
      }

      const data = response.data;
      if (!data.success) {
        return { success: false, error: data.error || "Failed to start impersonation" };
      }

      const newState: ImpersonationState = {
        isImpersonating: true,
        impersonatedUser: data.targetUser,
        sessionToken: data.sessionToken,
        impersonationId: data.impersonationId,
      };

      persistState(newState);
      return { success: true };
    } catch (error: any) {
      console.error("Error starting impersonation:", error);
      return { success: false, error: error.message || "Failed to start impersonation" };
    } finally {
      setLoading(false);
    }
  }, [persistState]);

  const stopImpersonation = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!state.sessionToken) {
      persistState({
        isImpersonating: false,
        impersonatedUser: null,
        sessionToken: null,
        impersonationId: null,
      });
      return { success: true };
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Just clear state if not authenticated
        persistState({
          isImpersonating: false,
          impersonatedUser: null,
          sessionToken: null,
          impersonationId: null,
        });
        return { success: true };
      }

      const response = await supabase.functions.invoke("impersonate-user", {
        body: {
          action: "stop",
          sessionToken: state.sessionToken,
        },
      });

      // Clear state regardless of server response
      persistState({
        isImpersonating: false,
        impersonatedUser: null,
        sessionToken: null,
        impersonationId: null,
      });

      if (response.error) {
        console.error("Error stopping impersonation:", response.error);
        // Still return success since we cleared local state
        return { success: true };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error stopping impersonation:", error);
      // Clear state anyway
      persistState({
        isImpersonating: false,
        impersonatedUser: null,
        sessionToken: null,
        impersonationId: null,
      });
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, [state.sessionToken, persistState]);

  // Get effective roles based on impersonation state
  const impersonatedRoles = useMemo((): RBACRole[] => {
    if (!state.isImpersonating || !state.impersonatedUser) {
      return [];
    }
    return normalizeRoles(state.impersonatedUser.roles);
  }, [state.isImpersonating, state.impersonatedUser]);

  return {
    ...state,
    loading,
    impersonatedRoles,
    startImpersonation,
    stopImpersonation,
  };
}
