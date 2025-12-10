// ============================================
// LEGACY AUTH ROLES - REDIRECTS TO NEW RBAC SYSTEM
// ============================================
// This file is kept for backwards compatibility
// All new code should import from @/lib/rbac

export { 
  type RBACRole as AppRole,
  normalizeRoles,
  isSuperAdmin,
  hasAdminPanelAccess,
  getHighestPriorityRole,
  routeAfterLogin,
  ADMIN_PANEL_ROLES,
} from "@/lib/rbac";

// Legacy exports
export const SUPER_ADMIN_ROLE = "super_admin" as const;

// Legacy function - redirects to RBAC
export function hasAnyRole(roles: string[]): boolean {
  return roles.length > 0;
}

// Legacy interface
export interface AuthRedirectContext {
  roles: string[];
  isSuperAdmin: boolean;
  profileStatus?: string | null;
}

// Legacy function for pending approval check
export function isPendingApproval(roles: string[], profileStatus?: string | null): boolean {
  // If user has any roles, they are NOT pending
  if (roles.length > 0) return false;
  // No roles = pending
  return true;
}
