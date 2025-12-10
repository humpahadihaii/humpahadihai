import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PermissionKey, canViewSection } from "@/lib/permissions";
import { routeAfterLogin } from "@/lib/authRoles";

interface ProtectedRouteProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

const ProtectedRoute = ({ permission, children }: ProtectedRouteProps) => {
  const { 
    isAuthInitialized, 
    isAuthenticated, 
    profile, 
    roles,
    isSuperAdmin,
    canAccessAdminPanel,
    session,
  } = useAuth();

  // Wait for auth to initialize - no redirects during loading
  // But if we already have a session, proceed
  if (!isAuthInitialized) {
    if (session) {
      // Session exists, don't block
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // SUPER_ADMIN always has access - bypass all other checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // User has admin panel access - check specific permission
  if (canAccessAdminPanel) {
    // Check permission using all roles (union of permissions)
    if (!canViewSection(permission, roles)) {
      return <Navigate to="/admin/unauthorized" replace />;
    }
    return <>{children}</>;
  }

  // Disabled users - redirect to login
  if (profile?.status === "disabled") {
    return <Navigate to="/login" replace />;
  }

  // No admin panel access - redirect appropriately
  const target = routeAfterLogin({ roles, isSuperAdmin });
  return <Navigate to={target} replace />;
};

export default ProtectedRoute;
