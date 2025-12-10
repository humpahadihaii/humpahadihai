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

// Determine where to redirect after login based on roles
export function routeAfterLogin(ctx: {
  roles: AppRole[];
  isSuperAdmin: boolean;
}): string {
  const { roles, isSuperAdmin: superAdmin } = ctx;

  // 1. SUPER ADMIN always goes to admin dashboard
  if (superAdmin) {
    return "/admin";
  }

  // 2. Any admin-panel role → find the best route based on highest priority role
  if (hasAdminPanelAccess(roles)) {
    const highestRole = getHighestPriorityRole(roles);
    if (highestRole && ROLE_DEFAULT_ROUTES[highestRole]) {
      return ROLE_DEFAULT_ROUTES[highestRole]!;
    }
    return "/admin";
  }

  // 3. User role only (no admin access) → home
  if (hasAnyRole(roles)) {
    return "/";
  }

  // 4. No roles → pending approval
  return "/pending-approval";
}
