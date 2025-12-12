import { useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LogIn, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useCMSSettings } from "@/hooks/useCMSSettings";
import { performLogout } from "@/lib/auth";
import { toast } from "sonner";
import logoFallback from "@/assets/hum-pahadi-logo-new.jpg";
import { SearchBox } from "@/components/search/SearchBox";
import { AdminPinModal } from "@/components/AdminPinModal";

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

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Culture", path: "/culture" },
    { name: "Food", path: "/food" },
    { name: "Travel", path: "/travel" },
    { name: "Districts", path: "/districts" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Thoughts", path: "/thoughts" },
    { name: "Promotions", path: "/promotions" },
    { name: "Travel Packages", path: "/travel-packages" },
    { name: "Shop", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    // Only show Admin link if user is already admin
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  // Determine if we should show login button (only for authenticated users or with env flag)
  const showLoginButton = SHOW_ADMIN_LOGIN || isAuthenticated;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo with secret click trigger */}
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <img src={logo} alt={`${siteName} Logo`} width="56" height="56" className="h-14 w-14 rounded-full object-cover" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-primary">{siteName}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Uttarakhand Heritage</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBox />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2 py-2 rounded-lg font-medium text-xs transition-all ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {/* Only show auth buttons if authenticated or env flag is set */}
            {showLoginButton && (
              isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {/* Mobile Search */}
              <div className="px-4 pb-3 border-b border-border mb-2">
                <SearchBox />
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {/* Only show auth buttons if authenticated or env flag is set */}
              {showLoginButton && (
                isAuthenticated ? (
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="justify-start gap-2 px-4"
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
                    className="justify-start gap-2 px-4"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                )
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
  );
};

export default Navigation;
