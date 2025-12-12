import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SidebarItem as SidebarItemType } from "./SidebarConfig";

interface SidebarItemProps {
  item: SidebarItemType;
  collapsed: boolean;
  onClick?: () => void;
}

export function SidebarItem({ item, collapsed, onClick }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.route;
  const Icon = item.icon;

  const linkContent = (
    <Link
      to={item.route}
      onClick={onClick}
      className={cn(
        // Base styles
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
        "text-[13px] font-medium transition-all",
        // Duration and easing from design tokens
        "duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        // Collapsed state centering
        collapsed && "justify-center px-2",
        // Active state
        isActive ? [
          "bg-[hsl(142,71%,45%,0.12)]",
          "text-[hsl(142,71%,35%)]",
          "dark:bg-[hsl(142,71%,55%,0.15)]",
          "dark:text-[hsl(142,71%,60%)]",
          "font-semibold",
        ] : [
          // Default state
          "text-[hsl(220,9%,46%)]",
          "dark:text-[hsl(220,9%,68%)]",
          // Hover state
          "hover:bg-[hsl(220,14%,92%)]",
          "hover:text-[hsl(220,9%,20%)]",
          "hover:translate-x-0.5",
          "dark:hover:bg-[hsl(220,13%,14%)]",
          "dark:hover:text-[hsl(0,0%,98%)]",
        ]
      )}
    >
      {/* Icon */}
      <Icon 
        className={cn(
          "h-[22px] w-[22px] flex-shrink-0",
          "transition-transform duration-[120ms]",
          // Icon hover effect
          "group-hover:scale-[1.06] group-hover:-translate-y-px",
          // Active icon
          isActive && "scale-105"
        )}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      
      {/* Label - hidden when collapsed */}
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
      
      {/* Active indicator pill */}
      {isActive && (
        <span 
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2",
            "h-5 w-1 rounded-r-full",
            "bg-[hsl(142,71%,45%)]",
            "dark:bg-[hsl(142,71%,55%)]",
            "animate-[adminScaleIn_180ms_ease-out]"
          )}
        />
      )}
    </Link>
  );

  // Wrap in tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          sideOffset={12}
          className="font-medium"
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
