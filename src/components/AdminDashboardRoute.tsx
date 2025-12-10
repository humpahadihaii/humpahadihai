import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminDashboardRouteProps {
  children: React.ReactNode;
}

/**
 * AdminDashboardRoute - Stricter guard for /admin (Dashboard) route
 * 
 * Only allows SUPER_ADMIN and ADMIN roles.
 * All other roles are redirected to their appropriate section.
 */
const AdminDashboardRoute = ({ children }: AdminDashboardRouteProps) => {
  const { 
    isAuthInitialized, 
    session, 
    isSuperAdmin, 
    canAccessAdminPanel, 
    isPending,
    profile,
    roles 
  } = useAuth();

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

  // 4. Super Admin or Admin → allow dashboard access
  if (isSuperAdmin || roles.includes("admin")) {
    return <>{children}</>;
  }

  // 5. User has admin panel access but not super_admin/admin → redirect to content sections
  if (canAccessAdminPanel) {
    return <Navigate to="/admin/content-sections" replace />;
  }

  // 6. User has roles but no admin access → send to home
  if (roles.length > 0 && !canAccessAdminPanel) {
    return <Navigate to="/" replace />;
  }

  // 7. No roles (pending) → pending approval page
  if (isPending) {
    return <Navigate to="/pending-approval" replace />;
  }

  // 8. Fallback: home
  return <Navigate to="/" replace />;
};

export default AdminDashboardRoute;
