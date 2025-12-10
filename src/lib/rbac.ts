// ============================================
// ENTERPRISE RBAC SYSTEM - SINGLE SOURCE OF TRUTH
// ============================================

/**
 * Role names - normalized to lowercase for DB compatibility
 * Use EXACT names from the role list
 */
export type RBACRole =
  | "super_admin"
  | "admin"
  | "content_manager"
  | "moderator"
  | "editor"
  | "author"
  | "reviewer"
  | "media_manager"
  | "seo_manager"
  | "support_agent"
  | "analytics_viewer"
  | "viewer"
  | "developer"
  | "content_editor"
  | "user";

/**
 * Admin section slugs - EXACT paths from admin panel
 */
export type AdminSection =
  | "/admin"
  | "/admin/analytics"
  | "/admin/ai-tools"
  | "/admin/users"
  | "/admin/site-settings"
  | "/admin/content-sections"
  | "/admin/stories"
  | "/admin/events"
  | "/admin/pages"
  | "/admin/footer-links"
  | "/admin/content/culture"
  | "/admin/content/food"
  | "/admin/content/travel"
  | "/admin/content/thoughts"
  | "/admin/districts"
  | "/admin/district-content"
  | "/admin/district-places"
  | "/admin/district-foods"
  | "/admin/district-festivals"
  | "/admin/villages"
  | "/admin/hotels"
  | "/admin/festivals"
  | "/admin/highlights"
  | "/admin/gallery"
  | "/admin/site-images"
  | "/admin/featured-highlights"
  | "/admin/community-submissions"
  | "/admin/submissions"
  | "/admin/tourism-providers"
  | "/admin/tourism-listings"
  | "/admin/tourism-inquiries"
  | "/admin/promotion-packages"
  | "/admin/promotion-requests"
  | "/admin/travel-packages"
  | "/admin/travel-requests"
  | "/admin/product-categories"
  | "/admin/products"
  | "/admin/product-orders"
  | "/admin/bookings"
  | "/admin/page-settings";

/**
 * Complete list of all admin sections
 */
export const ADMIN_SECTIONS: AdminSection[] = [
  "/admin",
  "/admin/analytics",
  "/admin/ai-tools",
  "/admin/users",
  "/admin/site-settings",
  "/admin/content-sections",
  "/admin/stories",
  "/admin/events",
  "/admin/pages",
  "/admin/footer-links",
  "/admin/content/culture",
  "/admin/content/food",
  "/admin/content/travel",
  "/admin/content/thoughts",
  "/admin/districts",
  "/admin/district-content",
  "/admin/district-places",
  "/admin/district-foods",
  "/admin/district-festivals",
  "/admin/villages",
  "/admin/hotels",
  "/admin/festivals",
  "/admin/highlights",
  "/admin/gallery",
  "/admin/site-images",
  "/admin/featured-highlights",
  "/admin/community-submissions",
  "/admin/submissions",
  "/admin/tourism-providers",
  "/admin/tourism-listings",
  "/admin/tourism-inquiries",
  "/admin/promotion-packages",
  "/admin/promotion-requests",
  "/admin/travel-packages",
  "/admin/travel-requests",
  "/admin/product-categories",
  "/admin/products",
  "/admin/product-orders",
  "/admin/bookings",
  "/admin/page-settings",
];

/**
 * RBAC Permission Matrix - Maps each role to allowed admin sections
 * This is the AUTHORITATIVE source for all permission checks
 */
export const ROLE_PERMISSIONS: Record<RBACRole, AdminSection[]> = {
  // SUPER_ADMIN: Full access to ALL sections
  super_admin: [...ADMIN_SECTIONS],

  // ADMIN: Access to all sections EXCEPT modifying SUPER_ADMIN accounts (handled separately)
  admin: [...ADMIN_SECTIONS],

  // CONTENT_MANAGER: Full content access, no users/settings/store/monetization/analytics
  content_manager: [
    "/admin/content-sections",
    "/admin/stories",
    "/admin/events",
    "/admin/pages",
    "/admin/footer-links",
    "/admin/content/culture",
    "/admin/content/food",
    "/admin/content/travel",
    "/admin/content/thoughts",
    "/admin/districts",
    "/admin/district-content",
    "/admin/district-places",
    "/admin/district-foods",
    "/admin/district-festivals",
    "/admin/villages",
    "/admin/hotels",
    "/admin/festivals",
    "/admin/highlights",
    "/admin/gallery",
    "/admin/site-images",
    "/admin/featured-highlights",
    "/admin/ai-tools",
  ],

  // MODERATOR: Submissions and moderation only
  moderator: [
    "/admin/community-submissions",
    "/admin/submissions",
    "/admin/content/thoughts",
    "/admin/gallery",
  ],

  // EDITOR: Edit content but cannot publish others' work
  editor: [
    "/admin/content/culture",
    "/admin/content/food",
    "/admin/content/travel",
    "/admin/content/thoughts",
    "/admin/stories",
    "/admin/events",
    "/admin/pages",
    "/admin/content-sections",
    "/admin/ai-tools",
  ],

  // AUTHOR: Create-only access
  author: [
    "/admin/stories",
    "/admin/events",
    "/admin/content/thoughts",
  ],

  // REVIEWER: Approve/reject only
  reviewer: [
    "/admin/stories",
    "/admin/events",
    "/admin/content/thoughts",
    "/admin/community-submissions",
  ],

  // MEDIA_MANAGER: Gallery and images only
  media_manager: [
    "/admin/gallery",
    "/admin/site-images",
    "/admin/featured-highlights",
  ],

  // SEO_MANAGER: Analytics (readonly), pages (SEO fields), footer links
  seo_manager: [
    "/admin/analytics",
    "/admin/pages",
    "/admin/footer-links",
    "/admin/page-settings",
  ],

  // SUPPORT_AGENT: Submissions and inquiries (respond-only)
  support_agent: [
    "/admin/submissions",
    "/admin/community-submissions",
    "/admin/tourism-inquiries",
    "/admin/travel-requests",
    "/admin/product-orders",
    "/admin/promotion-requests",
    "/admin/bookings",
  ],

  // ANALYTICS_VIEWER: Read-only dashboard and analytics (frontend only)
  analytics_viewer: [
    "/admin",
    "/admin/analytics",
  ],

  // VIEWER: Read-only dashboard only
  viewer: [
    "/admin",
  ],

  // DEVELOPER: Settings, API, logs, integrations
  developer: [
    "/admin/site-settings",
    "/admin/page-settings",
    "/admin/ai-tools",
  ],

  // CONTENT_EDITOR: Edit + publish own content
  content_editor: [
    "/admin/stories",
    "/admin/events",
    "/admin/pages",
    "/admin/content/culture",
    "/admin/content/food",
    "/admin/content/travel",
    "/admin/content/thoughts",
    "/admin/content-sections",
    "/admin/district-content",
    "/admin/district-places",
    "/admin/highlights",
    "/admin/ai-tools",
  ],

  // USER: No admin access
  user: [],
};

/**
 * Roles that grant access to the admin panel (any section)
 */
export const ADMIN_PANEL_ROLES: RBACRole[] = [
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

/**
 * Normalize raw role strings to RBACRole array
 */
export function normalizeRoles(rawRoles: string[] | string | null | undefined): RBACRole[] {
  if (!rawRoles) return [];
  
  const roleList = typeof rawRoles === "string" ? [rawRoles] : rawRoles;
  
  return roleList
    .filter(Boolean)
    .map(r => r.toLowerCase().trim() as RBACRole)
    .filter(r => Object.keys(ROLE_PERMISSIONS).includes(r));
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(roles: RBACRole[]): boolean {
  return roles.includes("super_admin");
}

/**
 * Check if user is Admin (super_admin or admin)
 */
export function isAdmin(roles: RBACRole[]): boolean {
  return roles.includes("super_admin") || roles.includes("admin");
}

/**
 * Check if user has any admin panel access
 */
export function hasAdminPanelAccess(roles: RBACRole[]): boolean {
  return roles.some(r => ADMIN_PANEL_ROLES.includes(r));
}

/**
 * Get the union of all permissions for multiple roles
 */
export function mergeRolePermissions(roles: RBACRole[]): AdminSection[] {
  const permissionSet = new Set<AdminSection>();
  
  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    permissions.forEach(p => permissionSet.add(p));
  }
  
  return Array.from(permissionSet);
}

/**
 * Check if user with given roles can access a specific section
 * @param roles - User's roles
 * @param sectionSlug - The admin section path
 * @returns boolean - Whether access is allowed
 */
export function canAccessSection(roles: RBACRole[], sectionSlug: string): boolean {
  // No roles = no access
  if (!roles || roles.length === 0) return false;
  
  // Super Admin always has access
  if (isSuperAdmin(roles)) return true;
  
  // Admin has access to everything except some restrictions (handled elsewhere)
  if (roles.includes("admin")) return true;
  
  // Normalize the section slug
  const normalizedSlug = sectionSlug.toLowerCase().replace(/\/$/, "") as AdminSection;
  
  // Get merged permissions for all user roles
  const allowedSections = mergeRolePermissions(roles);
  
  // Check if section is in allowed list
  return allowedSections.includes(normalizedSlug);
}

/**
 * Get visible sidebar sections for a user
 */
export function getVisibleSections(roles: RBACRole[]): AdminSection[] {
  if (!roles || roles.length === 0) return [];
  
  // Super Admin and Admin see everything
  if (isSuperAdmin(roles) || roles.includes("admin")) {
    return [...ADMIN_SECTIONS];
  }
  
  return mergeRolePermissions(roles);
}

/**
 * Get the default route for a role after login
 */
export function getDefaultRouteForRole(role: RBACRole): string {
  switch (role) {
    case "super_admin":
    case "admin":
      return "/admin";
    case "content_manager":
    case "content_editor":
    case "editor":
      return "/admin/content-sections";
    case "moderator":
    case "reviewer":
      return "/admin/community-submissions";
    case "author":
      return "/admin/stories";
    case "media_manager":
      return "/admin/gallery";
    case "seo_manager":
      return "/admin/pages";
    case "support_agent":
      return "/admin/submissions";
    case "analytics_viewer":
      return "/admin/analytics";
    case "viewer":
      return "/admin";
    case "developer":
      return "/admin/site-settings";
    case "user":
      return "/";
    default:
      return "/";
  }
}

/**
 * Role priority for determining highest role
 */
const ROLE_PRIORITY: RBACRole[] = [
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

/**
 * Get highest priority role from user's roles
 */
export function getHighestPriorityRole(roles: RBACRole[]): RBACRole | null {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return null;
}

/**
 * Get route after login based on roles
 */
export function routeAfterLogin(roles: RBACRole[]): string {
  if (!roles || roles.length === 0) return "/pending-approval";
  
  const highestRole = getHighestPriorityRole(roles);
  if (!highestRole) return "/pending-approval";
  
  return getDefaultRouteForRole(highestRole);
}

/**
 * Check if user can manage other users (super_admin, admin only)
 */
export function canManageUsers(roles: RBACRole[]): boolean {
  return isSuperAdmin(roles) || roles.includes("admin");
}

/**
 * Check if user can modify site settings (super_admin, admin, developer)
 */
export function canModifySettings(roles: RBACRole[]): boolean {
  return isSuperAdmin(roles) || roles.includes("admin") || roles.includes("developer");
}

/**
 * Role display labels
 */
export const ROLE_LABELS: Record<RBACRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  content_manager: "Content Manager",
  moderator: "Moderator",
  editor: "Editor",
  author: "Author",
  reviewer: "Reviewer",
  media_manager: "Media Manager",
  seo_manager: "SEO Manager",
  support_agent: "Support Agent",
  analytics_viewer: "Analytics Viewer",
  viewer: "Viewer",
  developer: "Developer",
  content_editor: "Content Editor",
  user: "User",
};

/**
 * Get role display label
 */
export function getRoleLabel(role: RBACRole | string | null | undefined): string {
  if (!role) return "No Role";
  const normalized = role.toLowerCase() as RBACRole;
  return ROLE_LABELS[normalized] || role;
}

/**
 * Get role badge variant for UI
 */
export function getRoleBadgeVariant(role: RBACRole | string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  if (!role) return "outline";
  const normalized = role.toLowerCase() as RBACRole;
  
  switch (normalized) {
    case "super_admin":
      return "destructive";
    case "admin":
      return "default";
    case "content_manager":
    case "content_editor":
      return "secondary";
    default:
      return "outline";
  }
}
