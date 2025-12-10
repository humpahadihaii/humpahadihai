// ============================================
// CENTRALIZED AUTH ROLES - SINGLE SOURCE OF TRUTH
// ============================================

// App role type matching database enum (lowercase to match DB)
export type AppRole =
  | "super_admin"
  | "admin"
  | "content_manager"
  | "content_editor"
  | "editor"
  | "moderator"
  | "author"
  | "reviewer"
  | "media_manager"
  | "seo_manager"
  | "support_agent"
  | "analytics_viewer"
  | "viewer"
  | "developer"
  | "user";

// Roles that grant access to the admin panel
export const ADMIN_PANEL_ROLES: AppRole[] = [
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
  "viewer",
  "developer",
];

export const SUPER_ADMIN_ROLE: AppRole = "super_admin";

// Normalize raw roles from DB to typed array
export function normalizeRoles(rawRoles: string[] | string | null | undefined): AppRole[] {
  if (!rawRoles) return [];
  if (typeof rawRoles === "string") {
    return [rawRoles as AppRole];
  }
  return rawRoles.filter(Boolean) as AppRole[];
}

// Check if user has any role at all
export function hasAnyRole(roles: AppRole[]): boolean {
  return roles.length > 0;
}

// Check if user is super admin
export function isSuperAdmin(roles: AppRole[]): boolean {
  return roles.includes(SUPER_ADMIN_ROLE);
}

// Check if user has access to admin panel
export function hasAdminPanelAccess(roles: AppRole[]): boolean {
  return roles.some((r) => ADMIN_PANEL_ROLES.includes(r));
}

// Determine where to redirect after login
export function routeAfterLogin(ctx: {
  roles: AppRole[];
  isSuperAdmin: boolean;
}): string {
  const { roles, isSuperAdmin: superAdmin } = ctx;

  // 1. SUPER ADMIN always goes to admin dashboard
  if (superAdmin) {
    return "/admin";
  }

  // 2. Any admin-panel role → admin dashboard
  if (hasAdminPanelAccess(roles)) {
    return "/admin";
  }

  // 3. User role only (no admin access) → home
  if (hasAnyRole(roles)) {
    return "/";
  }

  // 4. No roles → pending approval
  return "/pending-approval";
}
