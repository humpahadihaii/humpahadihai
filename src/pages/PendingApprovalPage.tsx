import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { normalizeRoles, isSuperAdmin, hasAdminPanelAccess, routeAfterLogin, hasAnyRole } from "@/lib/authRoles";

const PendingApprovalPage = () => {
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkApprovalStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) navigate("/login", { replace: true });
          return;
        }

        if (mounted) setUserEmail(session.user.email || "");

        // Fetch roles and admin request in parallel
        const [rolesResult, requestResult] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", session.user.id),
          supabase.from("admin_requests").select("status").eq("user_id", session.user.id).single()
        ]);

        const roles = normalizeRoles(rolesResult.data?.map(r => r.role) || []);
        
        // BULLETPROOF CHECK: If user has ANY role, they should NOT be on this page
        // Redirect them to the appropriate place immediately
        if (isSuperAdmin(roles) || hasAdminPanelAccess(roles) || hasAnyRole(roles)) {
          const target = routeAfterLogin({ roles, isSuperAdmin: isSuperAdmin(roles) });
          if (mounted) navigate(target, { replace: true });
          return;
        }

        // Set request status for display (only for users with no roles)
        if (requestResult.data && mounted) {
          setStatus(requestResult.data.status);
          
          // If approved in admin_requests but still no roles, they need role assignment
          if (requestResult.data.status === "approved") {
            // Re-check roles after a moment (in case of race condition)
            setTimeout(async () => {
              const { data: recheck } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id);
              
              const recheckedRoles = normalizeRoles(recheck?.map(r => r.role) || []);
              if (hasAnyRole(recheckedRoles)) {
                const target = routeAfterLogin({ roles: recheckedRoles, isSuperAdmin: isSuperAdmin(recheckedRoles) });
                navigate(target, { replace: true });
              }
            }, 1000);
          }
        }

        if (mounted) setLoading(false);
      } catch (error) {
        console.error("Error checking status:", error);
        if (mounted) setLoading(false);
      }
    };

    checkApprovalStatus();

    // Listen for role changes via realtime
    const channel = supabase
      .channel("pending_approval_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
        },
        () => {
          if (mounted) checkApprovalStatus();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_requests",
        },
        () => {
          if (mounted) checkApprovalStatus();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "pending" && <Clock className="h-16 w-16 text-warning" />}
            {status === "approved" && <CheckCircle className="h-16 w-16 text-success" />}
            {status === "rejected" && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "pending" && "Account Pending Approval"}
            {status === "approved" && "Account Approved!"}
            {status === "rejected" && "Access Denied"}
          </CardTitle>
          <CardDescription>
            {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <Badge
              variant={
                status === "approved"
                  ? "default"
                  : status === "rejected"
                  ? "destructive"
                  : "secondary"
              }
              className="text-sm px-4 py-2"
            >
              {status === "pending" && "Waiting for Admin Approval"}
              {status === "approved" && "Approved - Redirecting..."}
              {status === "rejected" && "Rejected"}
            </Badge>

            {status === "pending" && (
              <p className="text-muted-foreground text-sm">
                Your account has been created successfully. Please wait while an administrator
                reviews and approves your access request. You will be redirected automatically
                once approved.
              </p>
            )}

            {status === "approved" && (
              <p className="text-muted-foreground text-sm">
                Your account has been approved! Redirecting you to the admin panel...
              </p>
            )}

            {status === "rejected" && (
              <p className="text-muted-foreground text-sm">
                Your access request has been rejected. Please contact the administrator for more
                information.
              </p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;
