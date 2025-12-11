import { ReactNode, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { performLogout } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { useImpersonation } from "@/hooks/useImpersonation";
import { AdminSidebar } from "./AdminSidebar";
import { RBACRole, hasAdminPanelAccess, isSuperAdmin } from "@/lib/rbac";

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
    console.log("[AdminLayout] Auth not initialized, showing skeleton");
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="hidden border-r bg-background md:flex md:flex-col w-64">
          <div className="flex h-16 items-center border-b px-4">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex-1 px-3 py-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  // If no session after initialization, redirect to login
  if (!session) {
    console.log("[AdminLayout] No session, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin panel access (use actual auth roles for this check, not impersonated)
  const actualRoles = (authRoles || []) as RBACRole[];
  if (!hasAdminPanelAccess(actualRoles) && !isSuperAdmin(actualRoles)) {
    // If user has no roles, go to pending approval
    if (actualRoles.length === 0) {
      return <Navigate to="/pending-approval" replace />;
    }
    // Otherwise redirect to home
    return <Navigate to="/" replace />;
  }
  
  console.log("[AdminLayout] Rendering for user:", user?.email, "effective roles:", effectiveRoles, "impersonating:", isImpersonating);

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col">
      {/* Impersonation Banner - fixed at top */}
      <ImpersonationBanner />
      
      <div className={cn("flex flex-1 overflow-hidden", isImpersonating && "pt-0")}>
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden border-r bg-background transition-all duration-300 md:flex md:flex-col relative",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <AdminSidebar 
            roles={effectiveRoles} 
            collapsed={collapsed} 
          />
          
          <Separator />
          
          <div className="p-4 space-y-2">
            {!collapsed && user && (
              <p className="text-xs text-muted-foreground truncate px-2">
                {user.email}
              </p>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && (signingOut ? "Signing out..." : "Sign Out")}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-20 z-10 rounded-full border bg-background"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <AdminSidebar 
                roles={effectiveRoles} 
                collapsed={false} 
                onLinkClick={() => setMobileOpen(false)}
              />
              
              <Separator />
              
              <div className="p-4 space-y-2">
                {user && (
                  <p className="text-xs text-muted-foreground truncate px-2">
                    {user.email}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {signingOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
