import { Link, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  RBACRole, 
  canAccessSection, 
  getRoleLabel, 
  getRoleBadgeVariant,
  getHighestPriorityRole 
} from "@/lib/rbac";
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
  BarChart3,
  FileText,
  Users,
  Package,
  ShoppingCart,
  Megaphone,
  Plane,
  Store,
  Sparkles,
  Bell,
  type LucideIcon
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  section?: string;
}

/**
 * Complete navigation configuration with sections
 */
const NAVIGATION_ITEMS: NavItem[] = [
  // Core
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  
  // AI Tools
  { name: "AI Tools", href: "/admin/ai-tools", icon: Sparkles, section: "AI" },
  
  // User Management
  { name: "User Management", href: "/admin/users", icon: Users, section: "Users" },
  
  // Settings
  { name: "Site Settings", href: "/admin/site-settings", icon: Settings, section: "Settings" },
  { name: "Notify Settings", href: "/admin/notify-settings", icon: Bell },
  
  // Content
  { name: "Content Sections", href: "/admin/content-sections", icon: FileText, section: "Content" },
  { name: "Stories", href: "/admin/stories", icon: FileText },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Pages", href: "/admin/pages", icon: FileText },
  { name: "Footer Links", href: "/admin/footer-links", icon: FileText },
  
  // Content Types
  { name: "Culture", href: "/admin/content/culture", icon: FileText, section: "Content Types" },
  { name: "Food", href: "/admin/content/food", icon: FileText },
  { name: "Travel Content", href: "/admin/content/travel", icon: Plane },
  { name: "Thoughts", href: "/admin/content/thoughts", icon: MessageSquare },
  
  // Places
  { name: "Districts", href: "/admin/districts", icon: Map, section: "Places" },
  { name: "District Content", href: "/admin/district-content", icon: Calendar },
  { name: "District Places", href: "/admin/district-places", icon: Map },
  { name: "District Foods", href: "/admin/district-foods", icon: Store },
  { name: "District Festivals", href: "/admin/district-festivals", icon: Calendar },
  { name: "Villages", href: "/admin/villages", icon: Home },
  { name: "Hotels", href: "/admin/hotels", icon: Hotel },
  { name: "Festivals", href: "/admin/festivals", icon: Calendar },
  { name: "Highlights", href: "/admin/highlights", icon: FileText },
  
  // Media
  { name: "Gallery", href: "/admin/gallery", icon: Image, section: "Media" },
  { name: "Site Images", href: "/admin/site-images", icon: Image },
  { name: "Featured Highlights", href: "/admin/featured-highlights", icon: Image },
  
  // Submissions
  { name: "Community Submissions", href: "/admin/community-submissions", icon: Users, section: "Submissions" },
  { name: "Contact Submissions", href: "/admin/submissions", icon: Mail },
  
  // Tourism Marketplace
  { name: "Providers", href: "/admin/tourism-providers", icon: Users, section: "Tourism Marketplace" },
  { name: "Listings", href: "/admin/tourism-listings", icon: Store },
  { name: "Inquiries", href: "/admin/tourism-inquiries", icon: Mail },
  
  // Monetization
  { name: "Promotion Packages", href: "/admin/promotion-packages", icon: Megaphone, section: "Monetization" },
  { name: "Promotion Requests", href: "/admin/promotion-requests", icon: Mail },
  
  // Travel Packages
  { name: "Travel Packages", href: "/admin/travel-packages", icon: Plane, section: "Travel" },
  { name: "Travel Requests", href: "/admin/travel-requests", icon: Mail },
  
  // Store
  { name: "Product Categories", href: "/admin/product-categories", icon: Package, section: "Store" },
  { name: "Products", href: "/admin/products", icon: Store },
  { name: "Product Orders", href: "/admin/product-orders", icon: ShoppingCart },
  
  // Bookings
  { name: "All Bookings", href: "/admin/bookings", icon: Calendar, section: "Bookings" },
];

interface AdminSidebarProps {
  roles: RBACRole[];
  collapsed: boolean;
  onLinkClick?: () => void;
}

/**
 * AdminSidebar - Renders sidebar navigation based on user roles
 * 
 * Key behaviors:
 * - Hides entire sidebar during auth initialization
 * - Only shows links the user has permission to access
 * - Groups navigation items by section
 * - Displays user's highest priority role
 */
export const AdminSidebar = ({ roles, collapsed, onLinkClick }: AdminSidebarProps) => {
  const location = useLocation();
  
  // Get highest priority role for display
  const highestRole = getHighestPriorityRole(roles);
  
  // Filter navigation to only show accessible items
  const filteredNavigation = NAVIGATION_ITEMS.filter(item => 
    canAccessSection(roles, item.href)
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
  }, {} as Record<string, NavItem[]>);

  // If no visible items, return empty
  if (filteredNavigation.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <div className="flex flex-col">
            <Link to="/admin" className="flex items-center space-x-2" onClick={onLinkClick}>
              <span className="text-lg font-bold">Admin Panel</span>
            </Link>
            {highestRole && (
              <Badge variant={getRoleBadgeVariant(highestRole)} className="mt-1 text-xs w-fit">
                {getRoleLabel(highestRole)}
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
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </>
  );
};

export default AdminSidebar;
