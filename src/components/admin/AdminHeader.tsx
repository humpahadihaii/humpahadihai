import { Search, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, Link } from "react-router-dom";
import { useMemo } from "react";
import { SIDEBAR_ITEMS } from "./AppleSidebar";
import { useAdminSearchModal } from "./AdminSearchContext";
interface AdminHeaderProps {
  email?: string;
  onMobileMenuClick?: () => void;
  onSignOut?: () => void;
  signingOut?: boolean;
}

export function AdminHeader({ 
  email, 
  onMobileMenuClick,
  onSignOut,
  signingOut 
}: AdminHeaderProps) {
  const location = useLocation();
  const { open: openSearch } = useAdminSearchModal();
  
  // Get current page title from sidebar config
  const pageTitle = useMemo(() => {
    const currentItem = SIDEBAR_ITEMS.find(item => item.route === location.pathname);
    return currentItem?.label || "Admin";
  }, [location.pathname]);

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; path: string }[] = [];
    
    let currentPath = '';
    for (const segment of paths) {
      currentPath += `/${segment}`;
      const item = SIDEBAR_ITEMS.find(i => i.route === currentPath);
      if (item) {
        crumbs.push({ label: item.label, path: currentPath });
      } else if (segment !== 'admin') {
        // Format segment as label
        crumbs.push({ 
          label: segment.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          path: currentPath 
        });
      }
    }
    
    return crumbs;
  }, [location.pathname]);

  const initials = email 
    ? email.split('@')[0].slice(0, 2).toUpperCase() 
    : '??';

  return (
    <header 
      className={cn(
        "flex items-center justify-between h-14 px-4 md:px-6",
        "bg-[hsl(var(--admin-surface))] dark:bg-[hsl(220,13%,10%)]",
        "border-b border-[hsl(var(--admin-border))]",
        "sticky top-0 z-30"
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuClick}
          className="md:hidden h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Breadcrumbs - desktop only */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-[hsl(var(--admin-text-tertiary))]">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-[hsl(var(--admin-text-primary))] dark:text-[hsl(0,0%,98%)]">
                  {crumb.label}
                </span>
              ) : (
                <Link 
                  to={crumb.path}
                  className="text-[hsl(var(--admin-text-secondary))] hover:text-[hsl(var(--admin-text-primary))] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        {/* Mobile title */}
        <h1 className="md:hidden font-semibold text-[15px]">
          {pageTitle}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <Button
          variant="ghost"
          onClick={openSearch}
          className={cn(
            "h-9 px-3 rounded-lg gap-2",
            "text-[hsl(var(--admin-text-secondary))]",
            "hover:text-[hsl(var(--admin-text-primary))]",
            "hover:bg-[hsl(var(--admin-sidebar-hover))]"
          )}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Search</span>
          <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-[hsl(var(--admin-border))] bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {/* Notifications button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-lg relative",
            "text-[hsl(var(--admin-text-secondary))]",
            "hover:text-[hsl(var(--admin-text-primary))]",
            "hover:bg-[hsl(var(--admin-sidebar-hover))]"
          )}
        >
          <Bell className="h-4.5 w-4.5" />
          {/* Notification badge */}
          <span 
            className={cn(
              "absolute top-1.5 right-1.5",
              "h-2 w-2 rounded-full",
              "bg-[hsl(var(--admin-error))]",
              "ring-2 ring-[hsl(var(--admin-surface))]"
            )}
          />
        </Button>

        {/* Profile dropdown - mobile only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[hsl(142,71%,45%,0.12)] text-[hsl(142,71%,35%)] text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/">View Site</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onSignOut}
              disabled={signingOut}
              className="text-destructive focus:text-destructive"
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
