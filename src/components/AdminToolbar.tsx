import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, Shield } from "lucide-react";

export const AdminToolbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const { data } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
          if (mounted) {
            setIsAdmin(data || false);
            setLoading(false);
          }
        } else if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };
    
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAdmin(data || false);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Don't show on admin pages or while loading
  if (loading || location.pathname.startsWith('/admin')) return null;
  
  // Always show if admin (for debugging)
  if (!isAdmin) return null;

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
