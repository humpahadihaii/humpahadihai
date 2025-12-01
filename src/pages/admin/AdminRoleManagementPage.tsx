import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Shield, Trash2, Check, Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: Database["public"]["Enums"]["app_role"] | null;
  role_id: string | null;
  last_active_at: string | null;
}

const AdminRoleManagementPage = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [revokeUser, setRevokeUser] = useState<UserWithRole | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSuperAdmin(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'super_admin'
      });

      if (error) throw error;
      setIsSuperAdmin(data);

      if (data) {
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error checking super admin:", error);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, last_active_at")
        .order("email");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || null,
          role_id: userRole?.id || null
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string | null, newRole: Database["public"]["Enums"]["app_role"]) => {
    setUpdatingRole(userId);
    try {
      if (roleId) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", roleId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      await fetchUsers();
      
      // Show success feedback briefly
      setTimeout(() => {
        setUpdatingRole(null);
        toast.success("Role updated successfully");
      }, 500);
    } catch (error: any) {
      setUpdatingRole(null);
      toast.error(error.message);
    }
  };

  const handleRevokeRole = async () => {
    if (!revokeUser?.role_id) return;

    setProcessing(revokeUser.id);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", revokeUser.role_id);

      if (error) throw error;
      toast.success(`Access revoked for ${revokeUser.full_name || revokeUser.email}`);
      await fetchUsers();
      setRevokeUser(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const getRoleBadgeVariant = (role: string | null): "default" | "destructive" | "secondary" | "outline" => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'content_editor':
        return 'secondary';
      case 'moderator':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <CardTitle>User Role Management</CardTitle>
          </div>
          <CardDescription>
            Manage user roles and permissions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isSelf = isCurrentUser(user.id);
                  const isUpdating = updatingRole === user.id;
                  
                  return (
                    <TableRow key={user.id} className={isSelf ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">
                        {user.full_name || "N/A"}
                        {isSelf && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role || "none"}
                            onValueChange={(value) => {
                              if (value !== "none") {
                                handleRoleChange(user.id, user.role_id, value as Database["public"]["Enums"]["app_role"]);
                              }
                            }}
                            disabled={isSelf || processing === user.id || isUpdating}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="none" disabled>Select role</SelectItem>
                              <SelectItem value="moderator">
                                <Badge variant="outline" className="mr-2">Moderator</Badge>
                              </SelectItem>
                              <SelectItem value="content_editor">
                                <Badge variant="secondary" className="mr-2">Content Editor</Badge>
                              </SelectItem>
                              <SelectItem value="admin">
                                <Badge variant="default" className="mr-2">Admin</Badge>
                              </SelectItem>
                              <SelectItem value="super_admin">
                                <Badge variant="destructive" className="mr-2">Super Admin</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {isUpdating && (
                            <div className="flex items-center gap-1 text-primary">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.last_active_at 
                          ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {user.role && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRevokeUser(user)}
                            disabled={isSelf || processing === user.id}
                            title={isSelf ? "You cannot revoke your own access" : "Revoke access"}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!revokeUser} onOpenChange={(open) => !open && setRevokeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{revokeUser?.full_name || revokeUser?.email}</strong>? 
              This action cannot be undone and they will lose all access to the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing === revokeUser?.id}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeRole}
              disabled={processing === revokeUser?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing === revokeUser?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Revoking...
                </>
              ) : (
                "Revoke Access"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRoleManagementPage;
