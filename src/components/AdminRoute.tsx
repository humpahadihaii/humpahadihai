import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthInitialized, session, isSuperAdmin, canAccessAdminPanel, profile, isRolesLoading, roles } = useAuth();

  // Debug logging for route guard decisions
  console.log("[AdminRoute] Check:", {
    isAuthInitialized,
    hasSession: !!session,
    isRolesLoading,
    rolesCount: roles.length,
    isSuperAdmin,
    canAccessAdminPanel,
  });

  // Show spinner only during initial auth check (before we know if there's a session)
  if (!isAuthInitialized) {
    console.log("[AdminRoute] Auth not initialized, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No session = not logged in
  if (!session) {
    console.log("[AdminRoute] No session, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // IMPORTANT: If we have a session and are still loading roles,
  // we should show a brief loading state, but with a timeout protection
  // to prevent infinite loading. AdminLayout handles the actual display.
  // Here we allow through to AdminLayout which will show skeleton while roles load.
  
  // Super Admin or any admin panel role = allow access
  if (isSuperAdmin || canAccessAdminPanel) {
    console.log("[AdminRoute] Access granted:", { isSuperAdmin, canAccessAdminPanel });
    return <>{children}</>;
  }

  // Still loading roles - allow through to AdminLayout to show skeleton
  // AdminLayout will handle the loading state properly
  if (isRolesLoading) {
    console.log("[AdminRoute] Roles still loading, allowing through to AdminLayout");
    return <>{children}</>;
  }

  // Disabled users = send to login
  if (profile?.status === "disabled") {
    console.log("[AdminRoute] User disabled, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Has session but no roles at all after loading = pending approval
  if (roles.length === 0) {
    console.log("[AdminRoute] No roles, redirecting to pending-approval");
    return <Navigate to="/pending-approval" replace />;
  }

  // Has roles but not admin roles = send to home
  console.log("[AdminRoute] Has roles but no admin access, redirecting to home");
  return <Navigate to="/" replace />;
};

export default AdminRoute;
