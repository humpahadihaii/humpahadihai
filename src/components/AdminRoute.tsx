import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthInitialized, session, isSuperAdmin, canAccessAdminPanel, profile } = useAuth();

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

  // Super Admin or any admin panel role = allow access
  if (isSuperAdmin || canAccessAdminPanel) {
    return <>{children}</>;
  }

  // Disabled users = send to login
  if (profile?.status === "disabled") {
    return <Navigate to="/login" replace />;
  }

  // Has session but no admin access = send to home
  return <Navigate to="/" replace />;
};

export default AdminRoute;
