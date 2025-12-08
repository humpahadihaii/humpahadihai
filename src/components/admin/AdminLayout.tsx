import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Users,
  Package,
  ShoppingCart,
  Megaphone,
  Plane,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { performLogout } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { canViewSection, PermissionKey } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/roles";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permission: PermissionKey;
  section?: string;
}

const navigation: NavigationItem[] = [
  // Core
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard" },
  
  // User Management
  { name: "User Management", href: "/admin/users", icon: Shield, permission: "users", section: "Users" },
  { name: "Role Management", href: "/admin/roles", icon: UserCheck, permission: "roles" },
  { name: "Approvals", href: "/admin/approvals", icon: UserCheck, permission: "approvals" },
  
  // Settings
  { name: "Site Settings", href: "/admin/site-settings", icon: Settings, permission: "siteSettings", section: "Settings" },
  
  // Content
  { name: "Content Sections", href: "/admin/content-sections", icon: FileText, permission: "contentSections", section: "Content" },
  { name: "Stories", href: "/admin/stories", icon: FileText, permission: "stories" },
  { name: "Events", href: "/admin/events", icon: Calendar, permission: "events" },
  { name: "Pages", href: "/admin/pages", icon: FileText, permission: "pages" },
  { name: "Footer Links", href: "/admin/footer-links", icon: FileText, permission: "footerLinks" },
  
  // Content Types
  { name: "Culture", href: "/admin/content/culture", icon: FileText, permission: "culture", section: "Content Types" },
  { name: "Food", href: "/admin/content/food", icon: FileText, permission: "food" },
  { name: "Travel Content", href: "/admin/content/travel", icon: Plane, permission: "travelContent" },
  { name: "Thoughts", href: "/admin/content/thoughts", icon: MessageSquare, permission: "thoughts" },
  
  // Places
  { name: "Districts", href: "/admin/districts", icon: Map, permission: "districts", section: "Places" },
  { name: "District Content", href: "/admin/district-content", icon: Calendar, permission: "districtContent" },
  { name: "Villages", href: "/admin/villages", icon: Home, permission: "villages" },
  { name: "Hotels", href: "/admin/hotels", icon: Hotel, permission: "hotels" },
  { name: "Festivals", href: "/admin/festivals", icon: Calendar, permission: "festivals" },
  { name: "Highlights", href: "/admin/highlights", icon: FileText, permission: "highlights" },
  
  // Media
  { name: "Gallery", href: "/admin/gallery", icon: Image, permission: "gallery", section: "Media" },
  { name: "Site Images", href: "/admin/site-images", icon: Image, permission: "siteImages" },
  { name: "Featured Highlights", href: "/admin/featured-highlights", icon: Image, permission: "featuredHighlights" },
  
  // Submissions
  { name: "Community Submissions", href: "/admin/community-submissions", icon: Users, permission: "communitySubmissions", section: "Submissions" },
  { name: "Contact Submissions", href: "/admin/submissions", icon: Mail, permission: "submissions" },
  
  // Monetization
  { name: "Promotion Packages", href: "/admin/promotion-packages", icon: Megaphone, permission: "promotionPackages", section: "Monetization" },
  { name: "Promotion Requests", href: "/admin/promotion-requests", icon: Mail, permission: "promotionRequests" },
  
  // Travel Packages
  { name: "Travel Packages", href: "/admin/travel-packages", icon: Plane, permission: "travelPackages", section: "Travel" },
  { name: "Travel Requests", href: "/admin/travel-requests", icon: Mail, permission: "travelRequests" },
  
  // Products
  { name: "Product Categories", href: "/admin/product-categories", icon: Package, permission: "productCategories", section: "Store" },
  { name: "Products", href: "/admin/products", icon: Store, permission: "products" },
  { name: "Product Orders", href: "/admin/product-orders", icon: ShoppingCart, permission: "productOrders" },
  
  // Analytics
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics", section: "Analytics" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      toast.success("Signing out...");
      await performLogout();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter(item => 
    canViewSection(item.permission, role)
  );

  // Group navigation items by section
  const groupedNavigation = filteredNavigation.reduce((acc, item) => {
    if (item.section) {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
    }
    const section = item.section || Object.keys(acc).pop() || "General";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <div className="flex flex-col">
            <Link to="/admin" className="flex items-center space-x-2">
              <span className="text-lg font-bold">Admin Panel</span>
            </Link>
            {role && (
              <Badge variant={getRoleBadgeVariant(role)} className="mt-1 text-xs w-fit">
                {getRoleLabel(role)}
              </Badge>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-4">
          {Object.entries(groupedNavigation).map(([section, items]) => (
            <div key={section}>
              {!collapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item) => {
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
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

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
          "hidden border-r bg-background transition-all duration-300 md:flex md:flex-col relative",
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
