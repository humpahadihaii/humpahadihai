import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, LogOut } from "lucide-react";

const PendingApprovalPage = () => {
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUserEmail(session.user.email || "");

      // Check if user has admin or super_admin role
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      const { data: hasSuperAdminRole } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'super_admin'
      });

      if (hasAdminRole || hasSuperAdminRole) {
        navigate("/admin");
        return;
      }

      // Check admin request status
      const { data: request } = await supabase
        .from("admin_requests")
        .select("status")
        .eq("user_id", session.user.id)
        .single();

      if (request) {
        setStatus(request.status);
        if (request.status === "approved") {
          // If approved but no role yet, wait a moment
          setTimeout(() => window.location.reload(), 1000);
        }
      }

      setLoading(false);
    };

    checkApprovalStatus();

    // Listen for status changes
    const channel = supabase
      .channel("admin_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_requests",
        },
        (payload) => {
          checkApprovalStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
              {status === "approved" && "Approved"}
              {status === "rejected" && "Rejected"}
            </Badge>

            {status === "pending" && (
              <p className="text-muted-foreground text-sm">
                Your account has been created successfully. Please wait while an administrator
                reviews and approves your access request. You will receive an email once your
                account is approved.
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
