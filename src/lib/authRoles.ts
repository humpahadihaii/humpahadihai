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

// Roles that grant FULL access to the admin panel (restricted to top-tier admins only)
export const ADMIN_PANEL_ROLES: AppRole[] = [
  "super_admin",
  "admin",
];

// Roles that can access specific admin sections (but not full admin panel)
export const STAFF_ROLES: AppRole[] = [
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

// Role priority order (highest to lowest)
const ROLE_PRIORITY: AppRole[] = [
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

// Get the highest priority role from the user's roles
export function getHighestPriorityRole(roles: AppRole[]): AppRole | null {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return null;
}

// Role-based default routes
const ROLE_DEFAULT_ROUTES: Partial<Record<AppRole, string>> = {
  super_admin: "/admin",
  admin: "/admin",
  content_manager: "/admin/content-sections",
  content_editor: "/admin/content-sections",
  editor: "/admin/content-sections",
  moderator: "/admin/community-submissions",
  author: "/admin/stories",
  reviewer: "/admin/community-submissions",
  media_manager: "/admin/gallery",
  seo_manager: "/admin/pages",
  support_agent: "/admin/submissions",
  analytics_viewer: "/admin/analytics",
  viewer: "/admin",
  developer: "/admin",
};

// ============================================
// CENTRALIZED REDIRECT LOGIC
// ============================================

export interface AuthRedirectContext {
  roles: AppRole[];
  isSuperAdmin: boolean;
  profileStatus?: string | null;
}

/**
 * Determine where to redirect after login based on roles and status.
 * This is the SINGLE SOURCE OF TRUTH for post-login routing.
 * ONLY super_admin and admin roles go to admin panel.
 */
export function routeAfterLogin(ctx: AuthRedirectContext): string {
  const { roles, isSuperAdmin: superAdmin, profileStatus } = ctx;

  // 1. SUPER ADMIN always goes to admin dashboard - no exceptions
  if (superAdmin) {
    return "/admin";
  }

  // 2. ADMIN role only → admin dashboard
  if (roles.includes("admin")) {
    return "/admin";
  }

  // 3. Any other role (staff, user, etc.) → home page (no admin access)
  if (hasAnyRole(roles)) {
    return "/";
  }

  // 4. No roles at all → pending approval
  return "/pending-approval";
}

/**
 * Check if a user should be considered "pending" (needs approval)
 */
export function isPendingApproval(roles: AppRole[], profileStatus?: string | null): boolean {
  // If user has any admin panel role, they are NOT pending
  if (isSuperAdmin(roles) || hasAdminPanelAccess(roles)) {
    return false;
  }
  
  // If user has any role at all (even just 'user'), they are NOT pending
  if (hasAnyRole(roles)) {
    return false;
  }
  
  // No roles = pending
  return true;
}
