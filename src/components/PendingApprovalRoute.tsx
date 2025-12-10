import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PendingApprovalPage from "@/pages/PendingApprovalPage";

/**
 * PendingApprovalRoute - Guard for /pending-approval route
 * 
 * Decision flow:
 * 1. Not initialized → show spinner
 * 2. No session → redirect to /login
 * 3. Super Admin or has admin panel access → redirect to /admin (they shouldn't see this page)
 * 4. Has roles but no admin access → redirect to home
 * 5. No roles (truly pending) → show pending approval page
 */
const PendingApprovalRoute = () => {
  const { 
    isAuthInitialized, 
    session, 
    isSuperAdmin, 
    canAccessAdminPanel,
    isPending,
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

  // 2. No session → login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Super Admin or admin panel access → they should NOT see pending page
  if (isSuperAdmin || canAccessAdminPanel) {
    return <Navigate to="/admin" replace />;
  }

  // 4. Has roles but not admin roles → send to home
  if (roles.length > 0 && !canAccessAdminPanel) {
    return <Navigate to="/" replace />;
  }

  // 5. Truly pending (no roles) → show the page
  if (isPending) {
    return <PendingApprovalPage />;
  }

  // 6. Fallback: home
  return <Navigate to="/" replace />;
};

export default PendingApprovalRoute;
