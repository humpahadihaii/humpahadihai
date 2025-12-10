import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * PendingApprovalPage - STATIC component that shows pending status
 * 
 * IMPORTANT: This component does NOT contain any redirect logic.
 * All routing decisions are made by PendingApprovalRoute wrapper.
 * This component only displays information and handles sign out.
 */
const PendingApprovalPage = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const userEmail = session?.user?.email || "";

  // Fetch admin request status for display purposes ONLY (no redirects)
  useEffect(() => {
    let mounted = true;

    const fetchRequestStatus = async () => {
      if (!session?.user?.id) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: requestData } = await supabase
          .from("admin_requests")
          .select("status")
          .eq("user_id", session.user.id)
          .single();

        if (requestData && mounted) {
          setStatus(requestData.status);
        }
      } catch (error) {
        console.error("Error fetching request status:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRequestStatus();

    // Listen for status changes (for display update only)
    const channel = supabase
      .channel("pending_status_display")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_requests",
        },
        (payload) => {
          if (mounted && payload.new && payload.new.user_id === session?.user?.id) {
            setStatus(payload.new.status as string);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOut();
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
              {status === "approved" && "Approved - Please refresh or re-login"}
              {status === "rejected" && "Rejected"}
            </Badge>

            {status === "pending" && (
              <p className="text-muted-foreground text-sm">
                Your account has been created successfully. Please wait while an administrator
                reviews and approves your access request.
              </p>
            )}

            {status === "approved" && (
              <p className="text-muted-foreground text-sm">
                Your account has been approved! Please sign out and sign back in to access the admin panel.
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
