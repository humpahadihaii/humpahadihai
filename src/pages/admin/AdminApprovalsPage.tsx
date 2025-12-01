import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface AdminRequest {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  requested_role: string;
  created_at: string;
  user_id: string;
}

const AdminApprovalsPage = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Database["public"]["Enums"]["app_role"]>>({});

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: AdminRequest) => {
    setProcessing(request.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the selected role or default to moderator
      const roleToGrant: Database["public"]["Enums"]["app_role"] = selectedRoles[request.id] || 'moderator';

      // Update request status
      const { error: updateError } = await supabase
        .from("admin_requests")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          requested_role: roleToGrant,
        })
        .eq("id", request.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(`Failed to update request: ${updateError.message}`);
      }

      // Grant the role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: request.user_id,
          role: roleToGrant,
        });

      if (roleError) {
        console.error("Role error:", roleError);
        throw new Error(`Failed to grant role: ${roleError.message}`);
      }

      toast.success(`Admin request approved as ${roleToGrant.replace('_', ' ')}`);
      await fetchRequests();
    } catch (error: any) {
      console.error("Approve error:", error);
      toast.error(error.message || "Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: AdminRequest) => {
    setProcessing(request.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("admin_requests")
        .update({
          status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (error) {
        console.error("Reject error:", error);
        throw new Error(`Failed to reject request: ${error.message}`);
      }

      toast.success("Admin request rejected");
      await fetchRequests();
    } catch (error: any) {
      console.error("Reject error:", error);
      toast.error(error.message || "Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Approval Requests</CardTitle>
          <CardDescription>
            Review and approve or reject admin access requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No admin requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.full_name || "N/A"}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <Select
                          value={selectedRoles[request.id] || 'moderator'}
                          onValueChange={(value) => 
                            setSelectedRoles(prev => ({ 
                              ...prev, 
                              [request.id]: value as Database["public"]["Enums"]["app_role"]
                            }))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="content_editor">Content Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="capitalize">{request.requested_role.replace('_', ' ')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(request)}
                            disabled={processing === request.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request)}
                            disabled={processing === request.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApprovalsPage;
