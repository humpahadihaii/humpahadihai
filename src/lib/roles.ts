// Centralized role definitions matching the database app_role enum
export type UserRole =
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

export const ALL_ROLES: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "content_manager", label: "Content Manager" },
  { value: "moderator", label: "Moderator" },
  { value: "editor", label: "Editor" },
  { value: "author", label: "Author" },
  { value: "reviewer", label: "Reviewer" },
  { value: "media_manager", label: "Media Manager" },
  { value: "seo_manager", label: "SEO Manager" },
  { value: "support_agent", label: "Support Agent" },
  { value: "analytics_viewer", label: "Analytics Viewer" },
  { value: "viewer", label: "Viewer" },
  { value: "developer", label: "Developer" },
  { value: "content_editor", label: "Content Editor" },
  { value: "user", label: "User" },
];

export const getRoleLabel = (role: UserRole | string | null | undefined): string => {
  if (!role) return "No Role";
  const found = ALL_ROLES.find((r) => r.value === role);
  return found?.label || role;
};

export const getRoleBadgeVariant = (role: UserRole | string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
  switch (role) {
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
};

// Roles that can be assigned by different user types
export const getAssignableRoles = (currentUserRole: UserRole | null): UserRole[] => {
  if (currentUserRole === "super_admin") {
    return ALL_ROLES.map((r) => r.value);
  }
  if (currentUserRole === "admin") {
    return ALL_ROLES.filter((r) => r.value !== "super_admin").map((r) => r.value);
  }
  return [];
};

export const isAdminRole = (role?: UserRole | string | null): boolean => {
  return role === "super_admin" || role === "admin";
};

export const isSuperAdmin = (role?: UserRole | string | null): boolean => {
  return role === "super_admin";
};
