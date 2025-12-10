import { supabase } from "@/integrations/supabase/client";

export type AdminAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "publish" 
  | "unpublish" 
  | "approve" 
  | "reject"
  | "assign_role"
  | "remove_role";

export interface LogActivityParams {
  userId: string;
  userEmail: string;
  entityType: string;
  entityId: string;
  action: AdminAction;
  summary: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an admin activity to the admin_activity_logs table.
 * This function is fire-and-forget - it will not throw errors or block the main operation.
 * @returns true if log was successful, false otherwise
 */
export async function logAdminActivity(params: LogActivityParams): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("admin_activity_logs")
      .insert({
        user_id: params.userId,
        user_email: params.userEmail,
        entity_type: params.entityType,
        entity_id: params.entityId,
        action: params.action,
        summary: params.summary,
        metadata: params.metadata || null,
      });

    if (error) {
      console.warn("[AdminActivity] Failed to log activity:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("[AdminActivity] Error logging activity:", err);
    return false;
  }
}

/**
 * Helper to create activity logger with pre-filled user info
 */
export function createActivityLogger(userId: string, userEmail: string) {
  return (params: Omit<LogActivityParams, "userId" | "userEmail">) => 
    logAdminActivity({ ...params, userId, userEmail });
}
