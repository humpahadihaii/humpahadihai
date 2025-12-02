import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { 
  Users, 
  Shield, 
  Search, 
  Check, 
  X, 
  Eye, 
  Trash2, 
  Loader2, 
  RefreshCw,
  UserX,
  Clock,
  Key
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_active_at: string | null;
  role: Database["public"]["Enums"]["app_role"] | null;
  status: "active" | "pending" | "rejected" | "disabled";
  admin_request_id: string | null;
  requested_role: Database["public"]["Enums"]["app_role"] | null;
}

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [revokeUser, setRevokeUser] = useState<UserProfile | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSuperAdmin(false);
        setIsAdmin(false);
        toast.error("You must be logged in");
        return;
      }

      setCurrentUserId(user.id);

      const { data: superAdminCheck } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'super_admin'
      });

      const { data: adminCheck } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      setIsSuperAdmin(superAdminCheck || false);
      setIsAdmin(adminCheck || false);

      if (!superAdminCheck && !adminCheck) {
        toast.error("Access Denied: Admin or Super Admin role required");
        return;
      }

      await fetchAllUsers();
    } catch (error: any) {
      console.error("Error checking admin access:", error);
      setIsSuperAdmin(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      console.log('[UserManagement] Fetching all users...');
      
      // Fetch all profiles (role is now in profiles table)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error('[UserManagement] Profiles fetch error:', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      console.log('[UserManagement] Fetched profiles:', profiles?.length || 0);

      // Fetch all admin requests
      const { data: requests, error: requestsError } = await supabase
        .from("admin_requests")
        .select("*");

      if (requestsError) {
        console.error('[UserManagement] Admin requests fetch error:', requestsError);
        throw new Error(`Failed to fetch admin requests: ${requestsError.message}`);
      }

      console.log('[UserManagement] Fetched admin requests:', requests?.length || 0);

      // Combine all data
      const allUsers: UserProfile[] = profiles.map(profile => {
        const adminRequest = requests
          .filter(r => r.user_id === profile.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        // Use profile status if exists, otherwise derive from admin_requests
        let status: "active" | "pending" | "rejected" | "disabled" = "active";
        if (profile.status) {
          status = profile.status as "active" | "pending" | "rejected" | "disabled";
        } else if (adminRequest) {
          if (adminRequest.status === "pending") status = "pending";
          else if (adminRequest.status === "rejected") status = "rejected";
        }

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          last_active_at: profile.last_active_at,
          role: profile.role || null,
          status,
          admin_request_id: adminRequest?.id || null,
          requested_role: adminRequest?.requested_role || null
        };
      });

      console.log('[UserManagement] Combined users:', allUsers.length);
      setUsers(allUsers);
    } catch (error: any) {
      console.error('[UserManagement] Fatal error fetching users:', error);
      toast.error(error.message || "Failed to load users. Check console for details.");
    }
  };

  const handleApprove = async (user: UserProfile, roleToGrant: Database["public"]["Enums"]["app_role"]) => {
    setProcessing(user.id);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      // Update request status if it exists
      if (user.admin_request_id) {
        const { error: updateError } = await supabase
          .from("admin_requests")
          .update({
            status: "approved",
            approved_by: currentUser.id,
            approved_at: new Date().toISOString(),
            requested_role: roleToGrant,
          })
          .eq("id", user.admin_request_id);

        if (updateError) throw updateError;
      }

      // Grant or update the role in user_roles (trigger will sync to profiles)
      if (user.role) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: roleToGrant })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: roleToGrant });

        if (error) throw error;
      }

      // Also update profile status to active
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success(`User approved as ${roleToGrant.replace('_', ' ')}`);
      await fetchAllUsers();
    } catch (error: any) {
      console.error("Approve error:", error);
      toast.error(error.message || "Failed to approve user");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (user: UserProfile) => {
    setProcessing(user.id);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      if (user.admin_request_id) {
        const { error } = await supabase
          .from("admin_requests")
          .update({
            status: "rejected",
            approved_by: currentUser.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", user.admin_request_id);

        if (error) throw error;
      }

      toast.success("User request rejected");
      await fetchAllUsers();
    } catch (error: any) {
      console.error("Reject error:", error);
      toast.error(error.message || "Failed to reject user");
    } finally {
      setProcessing(null);
    }
  };

  const updateRole = async (userId: string, hasRole: boolean, newRole: Database["public"]["Enums"]["app_role"]) => {
    setUpdatingRole(userId);
    try {
      if (hasRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast.success("Role updated successfully");
      await fetchAllUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRevokeRole = async () => {
    if (!revokeUser?.role) return;

    setProcessing(revokeUser.id);
    try {
      // Delete from user_roles (trigger will sync to profiles)
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", revokeUser.id);

      if (error) throw error;
      
      toast.success(`Access revoked for ${revokeUser.full_name || revokeUser.email}`);
      await fetchAllUsers();
      setRevokeUser(null);
    } catch (error: any) {
      console.error("Error revoking role:", error);
      toast.error(error.message || "Failed to revoke access");
    } finally {
      setProcessing(null);
    }
  };

  const updateStatus = async (userId: string, newStatus: "active" | "disabled") => {
    setUpdatingStatus(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User ${newStatus === "active" ? "activated" : "disabled"} successfully`);
      await fetchAllUsers();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePasswordReset = async (userId: string, userEmail: string, isSuperAdmin: boolean) => {
    setResettingPassword(userId);
    try {
      // Use Supabase password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;
      
      toast.success(`Password reset email sent to ${userEmail}`);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setResettingPassword(null);
    }
  };

  const getRoleLabel = (role: string | null): string => {
    if (!role) return "No Role";
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'content_editor': 'Content Manager',
      'content_manager': 'Content Manager',
      'moderator': 'Moderator',
      'user': 'User'
    };
    return roleMap[role] || role.replace('_', ' ');
  };

  const getRoleBadgeVariant = (role: string | null): "default" | "destructive" | "secondary" | "outline" => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'content_editor':
      case 'content_manager': return 'secondary';
      case 'moderator': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': 
      case 'disabled': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && user.role !== null) ||
      (activeTab === "pending" && user.status === "pending") ||
      (activeTab === "no-role" && user.role === null && user.status !== "pending");

    return matchesSearch && matchesTab;
  });

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

  if (!isSuperAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const activeUsers = users.filter(u => u.role !== null);
  const pendingUsers = users.filter(u => u.status === "pending");
  const noRoleUsers = users.filter(u => u.role === null && u.status !== "pending");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all users, roles, and access permissions
            </p>
          </div>
          <Button onClick={fetchAllUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers.length}</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingUsers.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">No Role</p>
                  <p className="text-2xl font-bold">{noRoleUsers.length}</p>
                </div>
                <UserX className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="all">All ({users.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeUsers.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingUsers.length})</TabsTrigger>
                <TabsTrigger value="no-role">No Role ({noRoleUsers.length})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelf = isCurrentUser(user.id);
                      const isUpdating = updatingRole === user.id;
                      const isProcessing = processing === user.id;
                      
                      return (
                        <TableRow key={user.id} className={isSelf ? "bg-muted/50" : ""}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {user.full_name || "N/A"}
                                {isSelf && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.status === "pending" || user.status === "rejected" ? (
                              <Badge variant={getStatusBadgeVariant(user.status)}>
                                {user.status}
                              </Badge>
                            ) : (
                              <Select
                                value={user.status}
                                onValueChange={(value) => updateStatus(user.id, value as "active" | "disabled")}
                                disabled={isSelf || updatingStatus === user.id}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-background z-50">
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="disabled">Disabled</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.status === "pending" ? (
                              <Select
                                value={user.requested_role || "moderator"}
                                onValueChange={(value) => 
                                  handleApprove(user, value as Database["public"]["Enums"]["app_role"])
                                }
                                disabled={isProcessing}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select role to approve" />
                                </SelectTrigger>
                                <SelectContent className="bg-background z-50">
                                  <SelectItem value="moderator">Approve as Moderator</SelectItem>
                                  <SelectItem value="content_editor">Approve as Content Manager</SelectItem>
                                  <SelectItem value="content_manager">Approve as Content Manager</SelectItem>
                                  <SelectItem value="admin">Approve as Admin</SelectItem>
                                  {isSuperAdmin && <SelectItem value="super_admin">Approve as Super Admin</SelectItem>}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={user.role || "none"}
                                  onValueChange={(value) => {
                                    if (value !== "none") {
                                      updateRole(user.id, !!user.role, value as Database["public"]["Enums"]["app_role"]);
                                    }
                                  }}
                                  disabled={isSelf || isProcessing || isUpdating}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="No role" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background z-50">
                                    <SelectItem value="none" disabled>Select role</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                    <SelectItem value="content_editor">Content Manager</SelectItem>
                                    <SelectItem value="content_manager">Content Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                                  </SelectContent>
                                </Select>
                                {isUpdating && (
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.last_active_at 
                              ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReject(user)}
                                  disabled={isProcessing}
                                  title="Reject request"
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                              {user.status === "active" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handlePasswordReset(user.id, user.email, user.role === 'super_admin')}
                                  disabled={resettingPassword === user.id || (user.role === 'super_admin' && !isSuperAdmin)}
                                  title={user.role === 'super_admin' && !isSuperAdmin ? "Only Super Admins can reset Super Admin passwords" : "Reset password"}
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedUser(user)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {user.role && !isSelf && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setRevokeUser(user)}
                                  disabled={isProcessing}
                                  title="Revoke access"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = isCurrentUser(user.id);
                  const isUpdating = updatingRole === user.id;
                  const isProcessing = processing === user.id;

                  return (
                    <Card key={user.id} className={isSelf ? "border-primary" : ""}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {user.full_name || "N/A"}
                              {isSelf && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                            </p>
                            <Badge variant={getStatusBadgeVariant(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.role && (
                            <Badge variant={getRoleBadgeVariant(user.role)} className="mt-2">
                              {getRoleLabel(user.role)}
                            </Badge>
                          )}
                        </div>

                        {user.status === "pending" ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Approve as:</label>
                            <Select
                              value={user.requested_role || "moderator"}
                              onValueChange={(value) => 
                                handleApprove(user, value as Database["public"]["Enums"]["app_role"])
                              }
                              disabled={isProcessing}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-50">
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="content_editor">Content Manager</SelectItem>
                                <SelectItem value="content_manager">Content Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => handleReject(user)}
                              disabled={isProcessing}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role || "none"}
                                onValueChange={(value) => {
                                  if (value !== "none") {
                                    updateRole(user.id, !!user.role, value as Database["public"]["Enums"]["app_role"]);
                                  }
                                }}
                                disabled={isSelf || isProcessing || isUpdating}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="No role" />
                                </SelectTrigger>
                                <SelectContent className="bg-background z-50">
                                  <SelectItem value="none" disabled>Select role</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="content_editor">Content Manager</SelectItem>
                                  <SelectItem value="content_manager">Content Manager</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                                </SelectContent>
                              </Select>
                              {isUpdating && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {user.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePasswordReset(user.id, user.email, user.role === 'super_admin')}
                              disabled={resettingPassword === user.id || (user.role === 'super_admin' && !isSuperAdmin)}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {user.role && !isSelf && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setRevokeUser(user)}
                              disabled={isProcessing}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information about this user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-base">{selectedUser.full_name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-xs font-mono bg-muted p-2 rounded">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Role</label>
                  <div className="mt-1">
                    {selectedUser.role ? (
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {getRoleLabel(selectedUser.role)}
                      </Badge>
                    ) : (
                      <span className="text-sm">No role assigned</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Joined</label>
                  <p className="text-base">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Active</label>
                  <p className="text-base">
                    {selectedUser.last_active_at 
                      ? formatDistanceToNow(new Date(selectedUser.last_active_at), { addSuffix: true })
                      : "Never"}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Revoke Access Dialog */}
        <AlertDialog open={!!revokeUser} onOpenChange={(open) => !open && setRevokeUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke Access</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <strong>{revokeUser?.full_name || revokeUser?.email}</strong>'s access? 
                This will remove their role and they will lose all admin panel access.
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

export default AdminUserManagementPage;