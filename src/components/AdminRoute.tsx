import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  RBACRole, 
  canAccessSection, 
  hasAdminPanelAccess, 
  isSuperAdmin,
  getDefaultRouteForRole,
  getHighestPriorityRole
} from "@/lib/rbac";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - The guard for all /admin/* routes
 * 
 * Uses the new RBAC system for section-level access control.
 * 
 * Decision flow:
 * 1. Not initialized → show spinner
 * 2. No session → redirect to /login
 * 3. Disabled user → redirect to /login
 * 4. No roles (pending) → redirect to /pending-approval
 * 5. Has access to current section → render children
 * 6. Has admin access but not to this section → redirect to default route
 * 7. No admin access → redirect to home
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const location = useLocation();
  const { 
    isAuthInitialized, 
    session, 
    profile,
    roles: authRoles 
  } = useAuth();

  // Convert to RBACRole array
  const roles = (authRoles || []) as RBACRole[];
  const currentPath = location.pathname;

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

  // 5. Super Admin or Admin always has access
  if (isSuperAdmin(roles) || roles.includes("admin")) {
    return <>{children}</>;
  }

  // 6. Check if user can access this specific section
  if (canAccessSection(roles, currentPath)) {
    return <>{children}</>;
  }

  // 7. User has admin panel access but not to this section
  if (hasAdminPanelAccess(roles)) {
    const highestRole = getHighestPriorityRole(roles);
    if (highestRole) {
      const defaultRoute = getDefaultRouteForRole(highestRole);
      // Avoid redirect loop
      if (defaultRoute !== currentPath) {
        return <Navigate to={defaultRoute} replace />;
      }
    }
    // Fallback to unauthorized
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // 8. No admin access at all → home
  return <Navigate to="/" replace />;
};

export default AdminRoute;
