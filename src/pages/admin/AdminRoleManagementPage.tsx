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
import { Shield, Trash2, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Navigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";

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
  const [error, setError] = useState<string | null>(null);
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
        toast.error("You must be logged in");
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'super_admin'
      });

      if (error) throw error;
      
      if (!data) {
        toast.error("Access Denied: Super Admin role required");
        setIsSuperAdmin(false);
        return;
      }

      setIsSuperAdmin(true);
      await fetchUsers();
    } catch (error: any) {
      console.error("Error checking super admin:", error);
      setError("Failed to verify permissions");
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setError(null);
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
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
      toast.error("Failed to load users");
    }
  };

  const updateRole = async (userId: string, roleId: string | null, newRole: Database["public"]["Enums"]["app_role"]) => {
    setUpdatingRole(userId);
    try {
      if (roleId) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", roleId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      await fetchUsers();
      
      setTimeout(() => {
        setUpdatingRole(null);
        toast.success("Role updated successfully");
      }, 500);
    } catch (error: any) {
      console.error("Error updating role:", error);
      setUpdatingRole(null);
      toast.error(error.message || "Failed to update role");
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
      console.error("Error revoking role:", error);
      toast.error(error.message || "Failed to revoke access");
    } finally {
      setProcessing(null);
    }
  };

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
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
            {error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Failed to load users</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchUsers} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm text-muted-foreground">
                    There are no users in the system yet
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
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
                                      updateRole(user.id, user.role_id, value as Database["public"]["Enums"]["app_role"]);
                                    }
                                  }}
                                  disabled={isSelf || processing === user.id || isUpdating}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background z-50">
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
                            <TableCell className="text-right">
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
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {users.map((user) => {
                    const isSelf = isCurrentUser(user.id);
                    const isUpdating = updatingRole === user.id;

                    return (
                      <Card key={user.id} className={isSelf ? "border-primary" : ""}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">
                                {user.full_name || "N/A"}
                                {isSelf && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                              </p>
                              {user.role && (
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                  {user.role.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Last active: {user.last_active_at 
                                ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                                : "Never"}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role || "none"}
                                onValueChange={(value) => {
                                  if (value !== "none") {
                                    updateRole(user.id, user.role_id, value as Database["public"]["Enums"]["app_role"]);
                                  }
                                }}
                                disabled={isSelf || processing === user.id || isUpdating}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-background z-50">
                                  <SelectItem value="none" disabled>Select role</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="content_editor">Content Editor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              {isUpdating && (
                                <div className="flex items-center gap-1 text-primary">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>

                          {user.role && !isSelf && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => setRevokeUser(user)}
                              disabled={processing === user.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revoke Access
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
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
    </AdminLayout>
  );
};

export default AdminRoleManagementPage;