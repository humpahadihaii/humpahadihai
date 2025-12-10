import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAdminActivity, AdminAction } from "@/lib/adminActivityLogger";

interface LogParams {
  entityType: string;
  entityId: string;
  action: AdminAction;
  entityName?: string;
}

/**
 * Hook that provides activity logging utilities for admin operations.
 * All logging is fire-and-forget - errors are logged but don't affect the main operation.
 */
export function useAdminActivityLogger() {
  const log = useCallback(async (params: LogParams) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.warn("[ActivityLogger] No session, skipping log");
        return;
      }

      const actionVerb = getActionVerb(params.action);
      const summary = params.entityName 
        ? `${actionVerb} ${params.entityType}: ${params.entityName}`
        : `${actionVerb} ${params.entityType}`;

      await logAdminActivity({
        userId: session.user.id,
        userEmail: session.user.email || "unknown",
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        summary,
      });
    } catch (error) {
      console.warn("[ActivityLogger] Failed to log activity:", error);
    }
  }, []);

  const logCreate = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "create", entityName });
  }, [log]);

  const logUpdate = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "update", entityName });
  }, [log]);

  const logDelete = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "delete", entityName });
  }, [log]);

  const logPublish = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "publish", entityName });
  }, [log]);

  const logUnpublish = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "unpublish", entityName });
  }, [log]);

  const logApprove = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "approve", entityName });
  }, [log]);

  const logReject = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "reject", entityName });
  }, [log]);

  const logAssignRole = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "assign_role", entityName });
  }, [log]);

  const logRemoveRole = useCallback((entityType: string, entityId: string, entityName?: string) => {
    return log({ entityType, entityId, action: "remove_role", entityName });
  }, [log]);

  return {
    log,
    logCreate,
    logUpdate,
    logDelete,
    logPublish,
    logUnpublish,
    logApprove,
    logReject,
    logAssignRole,
    logRemoveRole,
  };
}

function getActionVerb(action: AdminAction): string {
  switch (action) {
    case "create": return "Created";
    case "update": return "Updated";
    case "delete": return "Deleted";
    case "publish": return "Published";
    case "unpublish": return "Unpublished";
    case "approve": return "Approved";
    case "reject": return "Rejected";
    case "assign_role": return "Assigned role to";
    case "remove_role": return "Removed role from";
    default: return action;
  }
}
