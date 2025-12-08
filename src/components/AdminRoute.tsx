import { Navigate } from "react-router-dom";
import { useAuth, getEffectiveStatus } from "@/hooks/useAuth";
import { performLogout } from "@/lib/auth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
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

  // Disabled users - logout and redirect
  if (effectiveStatus === "disabled") {
    performLogout();
    return <Navigate to="/login" replace />;
  }

  // Pending users - redirect to pending approval
  if (effectiveStatus === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }

  // Active user with at least one role - render children
  return <>{children}</>;
};

export default AdminRoute;
