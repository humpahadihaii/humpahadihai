import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const AdminToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthInitialized, isAdmin } = useAuth();

  // Don't show on admin pages, while loading, or if not admin
  if (!isAuthInitialized || location.pathname.startsWith('/admin') || !isAdmin) {
    return null;
  }

  const getAdminRoute = () => {
    const path = location.pathname;
    if (path.startsWith('/districts')) return '/admin/districts';
    if (path.startsWith('/villages')) return '/admin/villages';
    if (path === '/gallery') return '/admin/gallery';
    if (path === '/food') return '/admin/highlights';
    if (path === '/culture') return '/admin/festivals';
    if (path === '/travel') return '/admin/hotels';
    return '/admin';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2">
      <Button
        size="lg"
        className="rounded-full shadow-lg"
        onClick={() => navigate(getAdminRoute())}
      >
        <Settings className="mr-2 h-4 w-4" />
        Edit This Page
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="rounded-full shadow-lg"
        onClick={() => navigate('/admin')}
      >
        <Shield className="mr-2 h-4 w-4" />
        Admin Panel
      </Button>
    </div>
  );
};
