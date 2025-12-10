import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { routeAfterLogin } from "@/lib/authRoles";
import { performLogout } from "@/lib/auth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const {
    isAuthInitialized,
    isAuthenticated,
    session,
    roles,
    isSuperAdmin,
    canAccessAdminPanel,
    profile,
  } = useAuth();

  // Wait for auth to initialize - but with a timeout safety
  // If we have a session but still loading, show content anyway
  if (!isAuthInitialized) {
    // If we already have session data, don't block
    if (session) {
      return <>{children}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !session) {
    return <Navigate to="/login" replace />;
  }

  // SUPER_ADMIN always has access - no other checks needed
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Any admin panel role has access
  if (canAccessAdminPanel) {
    return <>{children}</>;
  }

  // Disabled users - logout and redirect
  if (profile?.status === "disabled") {
    performLogout();
    return <Navigate to="/login" replace />;
  }

  // No admin panel access - redirect to appropriate place
  const target = routeAfterLogin({ roles, isSuperAdmin });
  return <Navigate to={target} replace />;
};

export default AdminRoute;
