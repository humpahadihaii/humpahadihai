import { useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LogIn, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useCMSSettings } from "@/hooks/useCMSSettings";
import { performLogout } from "@/lib/auth";
import { toast } from "sonner";
import logoFallback from "@/assets/hum-pahadi-logo-new.jpg";
import { SearchTrigger } from "@/components/search";
import { AdminPinModal } from "@/components/AdminPinModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Environment flag for dev/staging - show visible admin login
const SHOW_ADMIN_LOGIN = import.meta.env.VITE_SHOW_ADMIN_LOGIN === "true";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getImage } = useSiteImages();
  const { data: settings } = useCMSSettings();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Secret logo click trigger state
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const logo = settings?.logo_image || getImage('site_logo', logoFallback);
  const siteName = settings?.site_name || "Hum Pahadi Haii";

  // Handler called after successful PIN verification
  const handlePinSuccess = useCallback(() => {
    toast.success("Admin access granted", { duration: 2000 });
    navigate("/login");
  }, [navigate]);

  // Secret 11-click trigger handler
  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    clickCountRef.current += 1;
    
    // Clear existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    // Check if we reached 11 clicks
    if (clickCountRef.current >= 11) {
      // IMPORTANT: Prevent the Link's default navigation to "/"
      e.preventDefault();
      e.stopPropagation();
      
      clickCountRef.current = 0;
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      
      toast.success("Admin access triggered", { duration: 2000 });
      
      // Open PIN modal instead of navigating directly
      setShowPinModal(true);
      return;
    }
    
    // Reset counter after 12 seconds
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 12000);
  }, []);

  const handleSignOut = async () => {
    try {
      toast.success("Signing out...");
      setIsOpen(false);
      await performLogout();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  // Primary nav items (always visible)
  const primaryNavItems = [
    { name: "Home", path: "/" },
    { name: "Districts", path: "/districts" },
    { name: "Culture", path: "/culture" },
    { name: "Food", path: "/food" },
    { name: "Travel", path: "/travel" },
  ];

  // More dropdown items
  const moreNavItems = [
    { name: "Marketplace", path: "/marketplace" },
    { name: "Travel Packages", path: "/travel-packages" },
    { name: "Shop", path: "/products" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Thoughts", path: "/thoughts" },
    { name: "Promotions", path: "/promotions" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  // All items for mobile
  const allNavItems = [...primaryNavItems, ...moreNavItems];

  // Determine if we should show login button (only for authenticated users or with env flag)
  const showLoginButton = SHOW_ADMIN_LOGIN || isAuthenticated;

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item }: { item: { name: string; path: string } }) => (
    <Link
      to={item.path}
      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
        isActive(item.path)
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/80 hover:text-foreground hover:bg-muted"
      }`}
    >
      {item.name}
    </Link>
  );

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      
      <nav className="site-header sticky top-0 z-50 glass border-b border-border/50 h-[var(--header-height)]">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full gap-4">
            {/* Logo with secret click trigger */}
            <Link 
              to="/" 
              className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0"
              onClick={handleLogoClick}
            >
              <img 
                src={logo} 
                alt={`${siteName} Logo`} 
                width="48" 
                height="48" 
                className="h-11 w-11 md:h-12 md:w-12 rounded-full object-cover ring-2 ring-primary/10" 
              />
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold text-primary leading-tight">{siteName}</h1>
                <p className="text-xs text-muted-foreground">Uttarakhand Heritage</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {primaryNavItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
              
              {/* More dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-2 rounded-lg font-medium text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-all duration-200 flex items-center gap-1">
                    More
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {moreNavItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={isActive(item.path) ? "bg-muted font-medium" : ""}
                      >
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side: Search + Auth */}
            <div className="flex items-center gap-2">
              {/* Desktop Search Trigger */}
              <div className="hidden md:flex">
                <SearchTrigger variant="button" />
              </div>

              {/* Desktop Auth buttons */}
              <div className="hidden lg:flex items-center gap-2">
                {showLoginButton && (
                  isAuthenticated ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden xl:inline">Sign Out</span>
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate("/login")}
                      className="gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span className="hidden xl:inline">Login</span>
                    </Button>
                  )
                )}
              </div>

              {/* Mobile Search + Menu */}
              <div className="flex items-center gap-1 lg:hidden">
                <SearchTrigger variant="icon" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isOpen}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isOpen && (
            <div 
              className="lg:hidden py-4 border-t border-border/50 absolute top-[var(--header-height)] left-0 right-0 glass shadow-lg animate-fade-in-down"
              style={{ maxHeight: 'calc(100vh - var(--header-height))', overflowY: 'auto' }}
            >
              <div className="container mx-auto px-4 flex flex-col gap-1">
                {allNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Auth */}
                {showLoginButton && (
                  <div className="pt-2 mt-2 border-t border-border/50">
                    {isAuthenticated ? (
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-2 px-4"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => {
                          navigate("/login");
                          setIsOpen(false);
                        }}
                        className="w-full justify-start gap-2 px-4"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Admin PIN Modal */}
        <AdminPinModal
          open={showPinModal}
          onOpenChange={setShowPinModal}
          onSuccess={handlePinSuccess}
        />
      </nav>
    </>
  );
};

export default Navigation;
