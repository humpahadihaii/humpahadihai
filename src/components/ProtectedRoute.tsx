import { Navigate } from "react-router-dom";
import { useAuth, getEffectiveStatus } from "@/hooks/useAuth";
import { PermissionKey, canViewSection } from "@/lib/permissions";

interface ProtectedRouteProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

const ProtectedRoute = ({ permission, children }: ProtectedRouteProps) => {
  const { isAuthInitialized, isAuthenticated, profile, roles } = useAuth();

  // Wait for auth to initialize - no redirects during loading
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Compute effective status
  const effectiveStatus = getEffectiveStatus(profile?.status, roles);

  // Non-active users - redirect appropriately
  if (effectiveStatus === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }

  if (effectiveStatus === "disabled") {
    return <Navigate to="/login" replace />;
  }

  // Check permission using all roles (union of permissions)
  if (!canViewSection(permission, roles)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
