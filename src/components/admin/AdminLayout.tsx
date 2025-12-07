import { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Map, 
  Home, 
  Calendar, 
  Image, 
  Hotel, 
  MessageSquare,
  Mail,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  BarChart3,
  UserCheck,
  Shield,
  FileText,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { performLogout } from "@/lib/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Shield, adminOnly: true },
  { name: "Site Settings", href: "/admin/site-settings", icon: Settings, adminOnly: true },
  { name: "Content Sections", href: "/admin/content-sections", icon: FileText },
  { name: "Stories", href: "/admin/stories", icon: FileText },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Pages", href: "/admin/pages", icon: FileText },
  { name: "Footer Links", href: "/admin/footer-links", icon: FileText },
  { name: "Culture", href: "/admin/content/culture", icon: FileText },
  { name: "Food", href: "/admin/content/food", icon: FileText },
  { name: "Travel", href: "/admin/content/travel", icon: FileText },
  { name: "Thoughts", href: "/admin/content/thoughts", icon: MessageSquare },
  { name: "Districts", href: "/admin/districts", icon: Map },
  { name: "District Content", href: "/admin/district-content", icon: Calendar },
  { name: "Villages", href: "/admin/villages", icon: Home },
  { name: "Gallery", href: "/admin/gallery", icon: Image },
  { name: "Featured Highlights", href: "/admin/featured-highlights", icon: Image },
  { name: "Community Submissions", href: "/admin/community-submissions", icon: Users },
  { name: "Submissions", href: "/admin/submissions", icon: Mail },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContentManager, setIsContentManager] = useState(false);

  useEffect(() => {
    checkAdminRoles();
  }, []);

  const checkAdminRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [superAdminCheck, adminCheck, contentManagerCheck, contentEditorCheck] = await Promise.all([
        supabase.rpc('has_role', { _user_id: user.id, _role: 'super_admin' }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'content_manager' }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'content_editor' })
      ]);
      
      setIsSuperAdmin(superAdminCheck.data || false);
      setIsAdmin(adminCheck.data || false);
      setIsContentManager(contentManagerCheck.data || contentEditorCheck.data || false);
    } catch (error) {
      console.error("Error checking admin roles:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      toast.success("Signing out...");
      // Perform full logout with redirect to auth page
      await performLogout();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b px-6">
        {!collapsed && (
          <Link to="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation
            .filter(item => {
              if (item.superAdminOnly) return isSuperAdmin;
              if (item.adminOnly) return isSuperAdmin || isAdmin;
              // Content managers can access all content-related pages
              return true;
            })
            .map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
        </nav>
      </ScrollArea>

      <Separator />
      
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-background transition-all duration-300 md:flex md:flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
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
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
