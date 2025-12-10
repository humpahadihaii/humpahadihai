import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccessSection, RBACRole, routeAfterLogin, getHighestPriorityRole, getDefaultRouteForRole } from "@/lib/rbac";

interface SectionGuardProps {
  children: React.ReactNode;
  section?: string;
}

/**
 * SectionGuard - Route guard that checks if user can access a specific admin section
 * 
 * Decision flow:
 * 1. Not initialized → show spinner
 * 2. No session → redirect to /login
 * 3. Disabled user → redirect to /login
 * 4. No roles (pending) → redirect to /pending-approval
 * 5. Has access to section → render children
 * 6. No access → redirect to their default route or /admin/unauthorized
 */
export const SectionGuard = ({ children, section }: SectionGuardProps) => {
  const location = useLocation();
  const { 
    isAuthInitialized, 
    session, 
    profile,
    roles: authRoles 
  } = useAuth();

  // Convert to RBACRole array
  const roles = (authRoles || []) as RBACRole[];
  
  // Current section - either passed in or from location
  const currentSection = section || location.pathname;

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

  // 4. No roles (pending) → pending approval
  if (roles.length === 0) {
    return <Navigate to="/pending-approval" replace />;
  }

  // 5. Check if user can access this section
  if (canAccessSection(roles, currentSection)) {
    return <>{children}</>;
  }

  // 6. No access - redirect to their default route
  const highestRole = getHighestPriorityRole(roles);
  if (highestRole) {
    const defaultRoute = getDefaultRouteForRole(highestRole);
    // Avoid redirect loop
    if (defaultRoute !== currentSection) {
      return <Navigate to={defaultRoute} replace />;
    }
  }

  // Fallback: unauthorized page
  return <Navigate to="/admin/unauthorized" replace />;
};

export default SectionGuard;
