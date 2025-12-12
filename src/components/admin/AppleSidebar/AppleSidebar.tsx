import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RBACRole, getHighestPriorityRole } from "@/lib/rbac";
import { 
  SIDEBAR_ITEMS, 
  SIDEBAR_GROUPS, 
  filterItemsByRoles, 
  groupItems 
} from "./SidebarConfig";
import { SidebarGroup } from "./SidebarGroup";
import { ProfileChip } from "./ProfileChip";

interface AppleSidebarProps {
  roles: RBACRole[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLinkClick?: () => void;
  email?: string;
  onSignOut: () => void;
  signingOut: boolean;
}

export function AppleSidebar({
  roles,
  collapsed,
  onToggleCollapse,
  onLinkClick,
  email,
  onSignOut,
  signingOut
}: AppleSidebarProps) {
  // Get highest priority role for display
  const highestRole = getHighestPriorityRole(roles);
  
  // Filter and group items based on user roles
  const groupedItems = useMemo(() => {
    const filteredItems = filterItemsByRoles(SIDEBAR_ITEMS, roles);
    return groupItems(filteredItems, SIDEBAR_GROUPS);
  }, [roles]);

  // If no visible items, return null
  if (groupedItems.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "flex h-full flex-col",
          // Background with glassmorphism
          "bg-[hsl(var(--admin-sidebar-bg))]",
          "dark:bg-[hsl(220,13%,8%)]",
          // Border
          "border-r border-[hsl(var(--admin-border))]",
          // Transition
          "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          // Width based on collapsed state
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Header */}
        <div 
          className={cn(
            "flex items-center h-14 px-4 border-b border-[hsl(var(--admin-border))]",
            "shrink-0",
            collapsed && "justify-center px-2"
          )}
        >
          <Link 
            to="/admin" 
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-2.5",
              "text-[hsl(220,9%,12%)] dark:text-[hsl(0,0%,98%)]",
              "hover:opacity-80 transition-opacity"
            )}
          >
            <div className={cn(
              "flex items-center justify-center",
              "h-8 w-8 rounded-lg",
              "bg-[hsl(142,71%,45%)]",
              "text-white"
            )}>
              <Mountain className="h-4.5 w-4.5" strokeWidth={2.2} />
            </div>
            {!collapsed && (
              <span className="font-semibold text-[15px] tracking-tight">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col">
            {groupedItems.map(({ group, items }) => (
              <SidebarGroup
                key={group.id}
                group={group}
                items={items}
                collapsed={collapsed}
                onItemClick={onLinkClick}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer with profile */}
        <div className="border-t border-[hsl(var(--admin-border))] shrink-0">
          <ProfileChip
            email={email}
            highestRole={highestRole}
            collapsed={collapsed}
            onSignOut={onSignOut}
            signingOut={signingOut}
          />
        </div>

        {/* Collapse toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "absolute -right-3.5 top-[72px] z-20",
            "h-7 w-7 rounded-full",
            "bg-[hsl(var(--admin-surface))] dark:bg-[hsl(220,13%,14%)]",
            "border border-[hsl(var(--admin-border))]",
            "shadow-sm hover:shadow-md",
            "transition-all duration-150",
            "hover:scale-105"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
}
