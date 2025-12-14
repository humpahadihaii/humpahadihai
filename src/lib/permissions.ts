import { UserRole } from "./roles";

export type PermissionKey =
  | "dashboard"
  | "users"
  | "roles"
  | "contentSections"
  | "stories"
  | "events"
  | "pages"
  | "footerLinks"
  | "culture"
  | "food"
  | "travelContent"
  | "thoughts"
  | "districts"
  | "districtContent"
  | "districtPlaces"
  | "districtFoods"
  | "districtFestivals"
  | "villages"
  | "hotels"
  | "festivals"
  | "highlights"
  | "gallery"
  | "siteImages"
  | "featuredHighlights"
  | "communitySubmissions"
  | "submissions"
  | "analytics"
  | "siteSettings"
  | "promotionPackages"
  | "promotionRequests"
  | "travelPackages"
  | "travelRequests"
  | "productCategories"
  | "products"
  | "productOrders"
  | "approvals"
  | "aiTools"
  | "tourismProviders"
  | "tourismListings"
  | "tourismInquiries"
  | "mediaImport"
  | "homepageCTAs"
  | "cookieConsent";

export const PERMISSIONS: Record<PermissionKey, UserRole[]> = {
  dashboard: ["super_admin", "admin"],
  users: ["super_admin", "admin"],
  roles: ["super_admin", "admin"],
  contentSections: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  stories: ["super_admin", "admin", "content_manager", "editor", "author", "reviewer", "moderator", "content_editor"],
  events: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  pages: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  footerLinks: ["super_admin", "admin", "content_manager"],
  culture: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  food: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  travelContent: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  thoughts: ["super_admin", "admin", "content_manager", "editor", "moderator", "content_editor"],
  districts: ["super_admin", "admin", "content_manager"],
  districtContent: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  districtPlaces: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  districtFoods: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  districtFestivals: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  villages: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  hotels: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  festivals: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  highlights: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  gallery: ["super_admin", "admin", "content_manager", "media_manager", "editor", "content_editor"],
  siteImages: ["super_admin", "admin", "content_manager", "media_manager"],
  featuredHighlights: ["super_admin", "admin", "content_manager"],
  communitySubmissions: ["super_admin", "admin", "content_manager", "moderator"],
  submissions: ["super_admin", "admin", "content_manager", "moderator", "support_agent"],
  analytics: ["super_admin", "admin", "content_manager", "analytics_viewer"],
  siteSettings: ["super_admin", "admin"],
  promotionPackages: ["super_admin", "admin", "content_manager"],
  promotionRequests: ["super_admin", "admin", "content_manager", "support_agent"],
  travelPackages: ["super_admin", "admin", "content_manager", "editor", "content_editor"],
  travelRequests: ["super_admin", "admin", "content_manager", "support_agent"],
  productCategories: ["super_admin", "admin", "content_manager"],
  products: ["super_admin", "admin", "content_manager"],
  productOrders: ["super_admin", "admin", "content_manager", "support_agent"],
  approvals: ["super_admin", "admin"],
  aiTools: ["super_admin", "admin", "content_manager", "editor"],
  tourismProviders: ["super_admin", "admin", "content_manager"],
  tourismListings: ["super_admin", "admin", "content_manager"],
  tourismInquiries: ["super_admin", "admin", "content_manager", "support_agent"],
  mediaImport: ["super_admin", "admin", "content_manager"],
  homepageCTAs: ["super_admin", "admin", "content_manager"],
  cookieConsent: ["super_admin", "admin"],
};

// Helper to check if a user can use AI features
export const canUseAI = (role?: UserRole | string | null): boolean => {
  if (!role) return false;
  return PERMISSIONS.aiTools.includes(role as UserRole);
};

// Check if user with given roles can view a section (union of all roles)
export const canViewSection = (key: PermissionKey, roles?: UserRole | UserRole[] | string | string[] | null): boolean => {
  if (!roles) return false;
  
  // Handle array of roles (multi-role support)
  if (Array.isArray(roles)) {
    return roles.some(role => PERMISSIONS[key]?.includes(role as UserRole) ?? false);
  }
  
  // Handle single role
  return PERMISSIONS[key]?.includes(roles as UserRole) ?? false;
};

export const canManageUsers = (role?: UserRole | string | null): boolean => {
  return role === "super_admin" || role === "admin";
};

export const canDeleteUsers = (role?: UserRole | string | null): boolean => {
  return role === "super_admin";
};

export const canResetPasswords = (role?: UserRole | string | null): boolean => {
  return role === "super_admin" || role === "admin";
};

export const canAssignRoles = (role?: UserRole | string | null): boolean => {
  return role === "super_admin" || role === "admin";
};
