import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PermissionKey, canViewSection } from "@/lib/permissions";

interface ProtectedRouteProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Guards admin routes with permission checks
 * ONLY super_admin and admin roles can access admin panel
 */
const ProtectedRoute = ({ permission, children }: ProtectedRouteProps) => {
  const { isAuthInitialized, session, roles, isSuperAdmin, profile, isPending } = useAuth();

  // Show spinner only during initial auth check
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No session = not logged in
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Disabled user = login
  if (profile?.status === "disabled") {
    return <Navigate to="/login" replace />;
  }

  // No roles = pending approval
  if (isPending) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Super Admin = full access
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // CRITICAL: Only admin role can access admin panel (strict check)
  const isAdminRole = roles.includes("admin");
  if (isAdminRole) {
    if (!canViewSection(permission, roles)) {
      return <Navigate to="/admin/unauthorized" replace />;
    }
    return <>{children}</>;
  }

  // No admin access - redirect home
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
