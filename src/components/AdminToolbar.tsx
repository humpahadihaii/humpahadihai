import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, Shield } from "lucide-react";

export const AdminToolbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAdmin(data || false);
      }
    };
    
    checkAdmin();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        }).then(({ data }) => {
          setIsAdmin(data || false);
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAdmin || location.pathname.startsWith('/admin')) return null;

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
