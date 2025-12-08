import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useCMSSettings } from "@/hooks/useCMSSettings";
import { performLogout } from "@/lib/auth";
import { toast } from "sonner";
import logoFallback from "@/assets/hum-pahadi-logo-new.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getImage } = useSiteImages();
  const { data: settings } = useCMSSettings();
  const { isAuthenticated, isAdmin } = useAuth();
  
  const logo = settings?.logo_image || getImage('site_logo', logoFallback);
  const siteName = settings?.site_name || "Hum Pahadi Haii";

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
    { name: "Gallery", path: "/gallery" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Thoughts", path: "/thoughts" },
    { name: "Promotions", path: "/promotions" },
    { name: "Travel Packages", path: "/travel-packages" },
    { name: "Shop", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt={`${siteName} Logo`} width="56" height="56" className="h-14 w-14 rounded-full object-cover" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">{siteName}</h1>
              <p className="text-xs text-muted-foreground">Uttarakhand Heritage</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
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
              {isAuthenticated ? (
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
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
