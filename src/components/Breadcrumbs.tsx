import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route to label mapping for auto-generation
const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  districts: "Districts",
  culture: "Culture",
  food: "Food",
  travel: "Travel",
  gallery: "Gallery",
  marketplace: "Marketplace",
  "travel-packages": "Travel Packages",
  products: "Shop",
  events: "Events",
  thoughts: "Thoughts",
  promotions: "Promotions",
  about: "About",
  contact: "Contact",
  villages: "Villages",
  providers: "Providers",
  listings: "Listings",
  destinations: "Destinations",
};

/**
 * Auto-generate breadcrumb items from current URL path
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = "";
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Try to get a friendly label
    const label = ROUTE_LABELS[segment] || 
      segment.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    // Last item has no href (current page)
    const isLast = i === segments.length - 1;
    
    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return items;
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
}: BreadcrumbsProps) {
  const location = useLocation();
  
  // Use provided items or auto-generate
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);
  
  // Don't show on homepage
  if (location.pathname === "/" || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm text-muted-foreground overflow-x-auto py-2",
        className
      )}
    >
      <ol className="flex items-center gap-1 flex-nowrap min-w-0">
        {showHome && (
          <li className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors duration-150 px-1.5 py-1 rounded-md hover:bg-muted"
              aria-label="Home"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/50 shrink-0" aria-hidden="true" />
          </li>
        )}
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center min-w-0">
            {item.href ? (
              <>
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors duration-150 px-1.5 py-1 rounded-md hover:bg-muted truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/50 shrink-0" aria-hidden="true" />
              </>
            ) : (
              <span
                className="text-foreground font-medium px-1.5 py-1 truncate max-w-[200px] sm:max-w-none"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
