import { ReactNode } from "react";
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
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Districts", href: "/admin/districts", icon: Map },
  { name: "District Content", href: "/admin/district-content", icon: Calendar },
  { name: "Villages", href: "/admin/villages", icon: Home },
  { name: "Highlights", href: "/admin/highlights", icon: Calendar },
  { name: "Featured Highlights", href: "/admin/featured-highlights", icon: Image },
  { name: "Hotels", href: "/admin/hotels", icon: Hotel },
  { name: "Festivals", href: "/admin/festivals", icon: Calendar },
  { name: "Gallery", href: "/admin/gallery", icon: Image },
  { name: "Site Images", href: "/admin/site-images", icon: Image },
  { name: "Thoughts", href: "/admin/thoughts", icon: MessageSquare },
  { name: "Submissions", href: "/admin/submissions", icon: Mail },
  { name: "Approvals", href: "/admin/approvals", icon: UserCheck },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
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
          {navigation.map((item) => {
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
