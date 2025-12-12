import { cn } from "@/lib/utils";
import { SidebarItem } from "./SidebarItem";
import type { SidebarGroup as SidebarGroupType, SidebarItem as SidebarItemType } from "./SidebarConfig";

interface SidebarGroupProps {
  group: SidebarGroupType;
  items: SidebarItemType[];
  collapsed: boolean;
  onItemClick?: () => void;
}

export function SidebarGroup({ group, items, collapsed, onItemClick }: SidebarGroupProps) {
  return (
    <div className="mb-2">
      {/* Section header - hidden when collapsed */}
      {!collapsed && (
        <div
          className={cn(
            "px-3 py-3 pb-1.5",
            "text-[11px] font-semibold uppercase tracking-[0.06em]",
            "text-[hsl(220,9%,56%)]",
            "dark:text-[hsl(220,9%,50%)]",
            "select-none"
          )}
        >
          {group.label}
        </div>
      )}
      
      {/* Collapsed state - add spacing */}
      {collapsed && (
        <div className="h-3" />
      )}
      
      {/* Items */}
      <div className="space-y-0.5 px-2">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}
