import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RBACRole, isSuperAdmin, canAccessSection } from "@/lib/rbac";

interface AdminDashboardRouteProps {
  children: React.ReactNode;
}

/**
 * AdminDashboardRoute - Stricter guard for /admin (Dashboard) route
 * 
 * Only allows SUPER_ADMIN, ADMIN, and ANALYTICS_VIEWER roles.
 * All other roles are redirected to their appropriate section.
 */
const AdminDashboardRoute = ({ children }: AdminDashboardRouteProps) => {
  const { 
    isAuthInitialized, 
    session, 
    profile,
    roles: authRoles 
  } = useAuth();

  // Convert to RBACRole array
  const roles = (authRoles || []) as RBACRole[];

  // 1. Still initializing - show spinner
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 2. No session = not logged in
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Disabled user → login
  if (profile?.status === "disabled") {
    return <Navigate to="/login" replace />;
  }

  // 4. No roles (pending) → pending approval
  if (roles.length === 0) {
    return <Navigate to="/pending-approval" replace />;
  }

  // 5. Check access using RBAC system - /admin is in the allowed list for specific roles
  if (canAccessSection(roles, "/admin")) {
    return <>{children}</>;
  }

  // 6. Has other admin access → redirect to content sections
  if (roles.some(r => ["content_manager", "content_editor", "editor"].includes(r))) {
    return <Navigate to="/admin/content-sections" replace />;
  }

  // 7. Moderator/Reviewer → community submissions
  if (roles.some(r => ["moderator", "reviewer"].includes(r))) {
    return <Navigate to="/admin/community-submissions" replace />;
  }

  // 8. Author → stories
  if (roles.includes("author")) {
    return <Navigate to="/admin/stories" replace />;
  }

  // 9. Media Manager → gallery
  if (roles.includes("media_manager")) {
    return <Navigate to="/admin/gallery" replace />;
  }

  // 10. SEO Manager → pages
  if (roles.includes("seo_manager")) {
    return <Navigate to="/admin/pages" replace />;
  }

  // 11. Support Agent → submissions
  if (roles.includes("support_agent")) {
    return <Navigate to="/admin/submissions" replace />;
  }

  // 12. Developer → site settings
  if (roles.includes("developer")) {
    return <Navigate to="/admin/site-settings" replace />;
  }

  // 13. No admin access → home
  if (!roles.some(r => r !== "user")) {
    return <Navigate to="/" replace />;
  }

  // 14. Fallback: redirect to content sections for any admin panel role
  return <Navigate to="/admin/content-sections" replace />;
};

export default AdminDashboardRoute;
