import { ReactNode, useState } from "react";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { performLogout } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { useImpersonation } from "@/hooks/useImpersonation";
import { AppleSidebar } from "./AppleSidebar";
import { RBACRole, hasAdminPanelAccess, isSuperAdmin } from "@/lib/rbac";
import { AdminSearchProvider } from "./AdminSearchContext";
import { AdminSearchModal } from "./AdminSearchModal";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  
  const { 
    roles: authRoles, 
    user, 
    isAuthInitialized, 
    session 
  } = useAuth();
  
  const { isImpersonating, impersonatedUser, impersonatedRoles } = useImpersonation();

  // Use impersonated user's roles when in impersonation mode, otherwise use actual roles
  const effectiveRoles: RBACRole[] = isImpersonating && impersonatedRoles.length > 0
    ? impersonatedRoles
    : (authRoles || []) as RBACRole[];

  const handleSignOut = async () => {
    if (signingOut) return;
    
    setSigningOut(true);
    toast.info("Signing out...");
    
    try {
      await performLogout();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out. Please try again.");
      setSigningOut(false);
    }
  };

  // Show skeleton only if auth is not initialized
  if (!isAuthInitialized) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[hsl(var(--admin-bg))]">
        <aside className="hidden md:flex w-[260px] border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-sidebar-bg))]">
          <div className="flex flex-col w-full">
            <div className="h-14 border-b border-[hsl(var(--admin-border))] px-4 flex items-center">
              <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
              <div className="ml-2.5 h-5 w-16 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex-1 py-4 px-2 space-y-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-9 bg-muted/50 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  // If no session after initialization, redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin panel access
  const actualRoles = (authRoles || []) as RBACRole[];
  if (!hasAdminPanelAccess(actualRoles) && !isSuperAdmin(actualRoles)) {
    if (actualRoles.length === 0) {
      return <Navigate to="/pending-approval" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <AdminSearchProvider>
      <div className="flex h-screen w-full overflow-hidden flex-col bg-[hsl(var(--admin-bg))]">
        {/* Impersonation Banner */}
        <ImpersonationBanner />
        
        <div className={cn("flex flex-1 overflow-hidden", isImpersonating && "pt-0")}>
          {/* Desktop Sidebar */}
          <div className="hidden md:block relative">
            <AppleSidebar
              roles={effectiveRoles}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed(!collapsed)}
              email={user?.email}
              onSignOut={handleSignOut}
              signingOut={signingOut}
            />
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-4 z-50 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 border-0">
              <AppleSidebar
                roles={effectiveRoles}
                collapsed={false}
                onToggleCollapse={() => {}}
                onLinkClick={() => setMobileOpen(false)}
                email={user?.email}
                onSignOut={handleSignOut}
                signingOut={signingOut}
              />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
            <div className="container mx-auto p-6 md:p-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>

        {/* Global Search Modal */}
        <AdminSearchModalWrapper />
      </div>
    </AdminSearchProvider>
  );
}

// Wrapper component to use the search context
function AdminSearchModalWrapper() {
  const { isOpen, close } = useAdminSearchModal();
  return <AdminSearchModal isOpen={isOpen} onClose={close} />;
}

// Need to import this after defining the component
import { useAdminSearchModal } from "./AdminSearchContext";
