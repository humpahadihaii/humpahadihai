import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - The SINGLE guard for all /admin/* routes
 * 
 * Decision flow:
 * 1. Not initialized → show spinner
 * 2. No session → redirect to /login
 * 3. Super Admin or has admin panel access → show admin content
 * 4. Has roles but no admin access → redirect to home
 * 5. No roles (pending) → redirect to /pending-approval
 * 6. Disabled user → redirect to /login
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
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

  // 4. ONLY Super Admin or Admin role → allow access (strict check)
  const isAdminRole = isSuperAdmin || roles.includes("admin");
  if (isAdminRole) {
    return <>{children}</>;
  }

  // 5. User has roles but no admin access → send to home
  if (roles.length > 0) {
    return <Navigate to="/" replace />;
  }

  // 6. No roles (pending) → pending approval page
  if (isPending) {
    return <Navigate to="/pending-approval" replace />;
  }

  // 7. Fallback: home
  return <Navigate to="/" replace />;
};

export default AdminRoute;
