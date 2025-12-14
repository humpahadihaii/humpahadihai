import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface RouteExplorerHeaderProps {
  breadcrumbs: Breadcrumb[];
  onBack?: () => void;
  onClose: () => void;
  showBack?: boolean;
}

export function RouteExplorerHeader({
  breadcrumbs,
  onBack,
  onClose,
  showBack = false,
}: RouteExplorerHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack && onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 h-9 w-9"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <nav className="flex items-center gap-1 text-sm overflow-hidden">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <span className="text-muted-foreground shrink-0">/</span>
              )}
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="text-muted-foreground hover:text-foreground truncate transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="font-medium text-foreground truncate">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="shrink-0 h-9 w-9"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </Button>
    </header>
  );
}
