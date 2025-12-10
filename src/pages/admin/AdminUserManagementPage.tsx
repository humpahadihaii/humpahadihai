import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  Search, 
  X, 
  Eye, 
  Trash2, 
  Loader2, 
  RefreshCw,
  Clock,
  Key,
  Check,
  Pencil,
  UserCheck,
  UserX,
  UserCog
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { 
  ALL_ROLES, 
  getAssignableRoles, 
  getRoleLabel, 
  getRoleBadgeVariant,
  UserRole 
} from "@/lib/roles";
import { canDeleteUsers, canResetPasswords } from "@/lib/permissions";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";
import { ImpersonateButton } from "@/components/admin/ImpersonateButton";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_active_at: string | null;
  roles: AppRole[];
  status: "active" | "pending" | "rejected" | "disabled";
  admin_request_id: string | null;
  requested_role: AppRole | null;
}

const getInitials = (name: string | null, email: string) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
};

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingRoles, setEditingRoles] = useState<AppRole[]>([]);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [approvalUser, setApprovalUser] = useState<UserProfile | null>(null);
  const [approvalRoles, setApprovalRoles] = useState<AppRole[]>(['viewer']);
  
  const [updatingRoles, setUpdatingRoles] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);

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
      setCurrentUserRole(superAdminCheck ? 'super_admin' : adminCheck ? 'admin' : null);

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
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw new Error(`Failed to fetch profiles: ${profilesError.message}`);

      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw new Error(`Failed to fetch roles: ${rolesError.message}`);

      const { data: requests, error: requestsError } = await supabase
        .from("admin_requests")
        .select("*");

      if (requestsError) throw new Error(`Failed to fetch admin requests: ${requestsError.message}`);

      const allUsers: UserProfile[] = profiles.map(profile => {
        const adminRequest = requests
          .filter(r => r.user_id === profile.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        const userRoles = allRoles
          .filter(r => r.user_id === profile.id)
          .map(r => r.role);

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
          roles: userRoles,
          status,
          admin_request_id: adminRequest?.id || null,
          requested_role: adminRequest?.requested_role || null
        };
      });

      setUsers(allUsers);
    } catch (error: any) {
      console.error('[UserManagement] Error fetching users:', error);
      toast.error(error.message || "Failed to load users.");
    }
  };

  const handleApprove = async () => {
    if (!approvalUser || approvalRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    setProcessing(approvalUser.id);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      // Insert all selected roles
      for (const role of approvalRoles) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: approvalUser.id, role });
        if (error && !error.message.includes('duplicate')) throw error;
      }

      // Update admin request status
      if (approvalUser.admin_request_id) {
        await supabase
          .from("admin_requests")
          .update({
            status: "approved",
            approved_by: currentUser.id,
            approved_at: new Date().toISOString(),
            requested_role: approvalRoles[0],
          })
          .eq("id", approvalUser.admin_request_id);
      }

      // Update profile status
      await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", approvalUser.id);

      toast.success(`User approved with ${approvalRoles.length} role(s)`);
      setApprovalUser(null);
      setApprovalRoles(['viewer']);
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
        await supabase
          .from("admin_requests")
          .update({
            status: "rejected",
            approved_by: currentUser.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", user.admin_request_id);
      }

      await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("id", user.id);

      toast.success("User request rejected");
      await fetchAllUsers();
    } catch (error: any) {
      console.error("Reject error:", error);
      toast.error(error.message || "Failed to reject user");
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;

    setUpdatingRoles(editingUser.id);
    try {
      // Delete all existing roles for this user
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", editingUser.id);

      // Insert new roles
      for (const role of editingRoles) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: editingUser.id, role });
        if (error) throw error;
      }

      toast.success("Roles updated successfully");
      setEditingUser(null);
      await fetchAllUsers();
    } catch (error: any) {
      console.error("Error updating roles:", error);
      toast.error(error.message || "Failed to update roles");
    } finally {
      setUpdatingRoles(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    if (deleteUser.id === currentUserId) {
      toast.error("You cannot delete your own account");
      setDeleteUser(null);
      return;
    }

    if (!isSuperAdmin) {
      toast.error("Only Super Admins can delete users");
      setDeleteUser(null);
      return;
    }

    setProcessing(deleteUser.id);
    try {
      await supabase.from("user_roles").delete().eq("user_id", deleteUser.id);
      await supabase.from("admin_requests").delete().eq("user_id", deleteUser.id);
      
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteUser.id);

      if (profileError) throw profileError;
      
      toast.success("User deleted successfully");
      setDeleteUser(null);
      await fetchAllUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setProcessing(null);
    }
  };

  const handlePasswordReset = async (user: UserProfile) => {
    if (!canResetPasswords(currentUserRole)) {
      toast.error("You don't have permission to reset passwords");
      return;
    }

    const userIsSuperAdmin = user.roles.includes('super_admin');
    if (userIsSuperAdmin && !isSuperAdmin) {
      toast.error("Only Super Admins can reset Super Admin passwords");
      return;
    }

    setResettingPassword(user.id);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setResettingPassword(null);
    }
  };

  const openEditRoles = (user: UserProfile) => {
    setEditingUser(user);
    setEditingRoles([...user.roles]);
  };

  const toggleRole = (role: AppRole, isApproval = false) => {
    if (isApproval) {
      setApprovalRoles(prev => 
        prev.includes(role) 
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
    } else {
      setEditingRoles(prev => 
        prev.includes(role) 
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
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

  const assignableRoles = getAssignableRoles(currentUserRole);
  const isCurrentUser = (userId: string) => userId === currentUserId;

  const activeUsers = users.filter(u => u.status === 'active' && u.roles.length > 0);
  const pendingUsers = users.filter(u => u.status === "pending");

  const filteredActiveUsers = activeUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const filteredPendingUsers = pendingUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

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
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-[#0A4D2E]">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, roles, and access permissions
            </p>
          </div>
          <Button onClick={fetchAllUsers} variant="outline" size="sm" className="border-[#0A4D2E] text-[#0A4D2E] hover:bg-[#0A4D2E]/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[#0A4D2E]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-[#0A4D2E]">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-[#0A4D2E]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#0A4D2E]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#0A4D2E]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Card className="border-[#0A4D2E]/20">
          <CardHeader>
            <CardTitle className="text-[#0A4D2E]">Manage Users</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-[#0A4D2E]/10">
                <TabsTrigger value="active" className="data-[state=active]:bg-[#0A4D2E] data-[state=active]:text-white">
                  Active Users ({activeUsers.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-[#0A4D2E] data-[state=active]:text-white">
                  Pending Requests ({pendingUsers.length})
                </TabsTrigger>
              </TabsList>

              {/* Search */}
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#0A4D2E]/30 focus:border-[#0A4D2E]"
                  />
                </div>
              </div>

              {/* Active Users Tab */}
              <TabsContent value="active">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-[#0A4D2E]/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#0A4D2E]/5">
                        <TableHead>User</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActiveUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No active users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredActiveUsers.map((user) => {
                          const isSelf = isCurrentUser(user.id);
                          const userIsSuperAdmin = user.roles.includes('super_admin');
                          
                          return (
                            <TableRow key={user.id} className={isSelf ? "bg-[#0A4D2E]/5" : ""}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 bg-[#0A4D2E] text-white">
                                    <AvatarFallback className="bg-[#0A4D2E] text-white">
                                      {getInitials(user.full_name, user.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {user.full_name || "N/A"}
                                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.roles.length > 0 ? (
                                    user.roles.map(role => (
                                      <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                                        {getRoleLabel(role)}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No roles</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize">
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {user.last_active_at 
                                  ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                                  : "Never"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Impersonate button - only for Super Admins, not for self or other super admins */}
                                  {isSuperAdmin && !isSelf && !userIsSuperAdmin && (
                                    <ImpersonateButton
                                      targetUserId={user.id}
                                      targetEmail={user.email}
                                      targetName={user.full_name}
                                    />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditRoles(user)}
                                    disabled={isSelf || (userIsSuperAdmin && !isSuperAdmin)}
                                    title="Edit roles"
                                  >
                                    <Pencil className="h-4 w-4 text-[#0A4D2E]" />
                                  </Button>
                                  {canResetPasswords(currentUserRole) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handlePasswordReset(user)}
                                      disabled={resettingPassword === user.id || (userIsSuperAdmin && !isSuperAdmin)}
                                      title="Reset password"
                                    >
                                      {resettingPassword === user.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Key className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                  {canDeleteUsers(currentUserRole) && !isSelf && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeleteUser(user)}
                                      disabled={processing === user.id}
                                      title="Delete user"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                  {filteredActiveUsers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No active users found</div>
                  ) : (
                    filteredActiveUsers.map((user) => {
                      const isSelf = isCurrentUser(user.id);
                      const userIsSuperAdmin = user.roles.includes('super_admin');

                      return (
                        <Card key={user.id} className={`border-[#0A4D2E]/20 ${isSelf ? "border-[#0A4D2E]" : ""}`}>
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 bg-[#0A4D2E] text-white">
                                <AvatarFallback className="bg-[#0A4D2E] text-white">
                                  {getInitials(user.full_name, user.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {user.full_name || "N/A"}
                                  {isSelf && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                                </p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize">
                                {user.status}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                                  {getRoleLabel(role)}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              Last active: {user.last_active_at 
                                ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                                : "Never"}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {/* Impersonate button - only for Super Admins, not for self or other super admins */}
                              {isSuperAdmin && !isSelf && !userIsSuperAdmin && (
                                <ImpersonateButton
                                  targetUserId={user.id}
                                  targetEmail={user.email}
                                  targetName={user.full_name}
                                />
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditRoles(user)}
                                disabled={isSelf || (userIsSuperAdmin && !isSuperAdmin)}
                                className="border-[#0A4D2E] text-[#0A4D2E]"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Roles
                              </Button>
                              {canResetPasswords(currentUserRole) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePasswordReset(user)}
                                  disabled={resettingPassword === user.id || (userIsSuperAdmin && !isSuperAdmin)}
                                >
                                  <Key className="h-4 w-4 mr-2" />
                                  Reset Password
                                </Button>
                              )}
                              {canDeleteUsers(currentUserRole) && !isSelf && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteUser(user)}
                                  disabled={processing === user.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* Pending Requests Tab */}
              <TabsContent value="pending">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-[#0A4D2E]/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#0A4D2E]/5">
                        <TableHead>User</TableHead>
                        <TableHead>Requested Role</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPendingUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No pending requests
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPendingUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 bg-yellow-500 text-white">
                                  <AvatarFallback className="bg-yellow-500 text-white">
                                    {getInitials(user.full_name, user.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.full_name || "N/A"}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.requested_role ? (
                                <Badge variant="secondary">
                                  {getRoleLabel(user.requested_role)}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not specified</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setApprovalUser(user);
                                    setApprovalRoles(user.requested_role ? [user.requested_role] : ['viewer']);
                                  }}
                                  disabled={processing === user.id}
                                  className="bg-[#0A4D2E] hover:bg-[#0A4D2E]/90"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(user)}
                                  disabled={processing === user.id}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredPendingUsers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No pending requests</div>
                  ) : (
                    filteredPendingUsers.map((user) => (
                      <Card key={user.id} className="border-yellow-400">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 bg-yellow-500 text-white">
                              <AvatarFallback className="bg-yellow-500 text-white">
                                {getInitials(user.full_name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{user.full_name || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Requested Role</p>
                              {user.requested_role ? (
                                <Badge variant="secondary">
                                  {getRoleLabel(user.requested_role)}
                                </Badge>
                              ) : (
                                <span className="text-sm">Not specified</span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Applied</p>
                              <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-[#0A4D2E] hover:bg-[#0A4D2E]/90"
                              onClick={() => {
                                setApprovalUser(user);
                                setApprovalRoles(user.requested_role ? [user.requested_role] : ['viewer']);
                              }}
                              disabled={processing === user.id}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleReject(user)}
                              disabled={processing === user.id}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit Roles Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#0A4D2E]">Edit User Roles</DialogTitle>
              <DialogDescription>
                Assign multiple roles to {editingUser?.full_name || editingUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Select one or more roles:</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {assignableRoles.map(role => (
                  <div key={role} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted">
                    <Checkbox
                      id={`role-${role}`}
                      checked={editingRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <label htmlFor={`role-${role}`} className="flex-1 cursor-pointer">
                      <Badge variant={getRoleBadgeVariant(role)}>
                        {getRoleLabel(role)}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveRoles} 
                disabled={updatingRoles === editingUser?.id}
                className="bg-[#0A4D2E] hover:bg-[#0A4D2E]/90"
              >
                {updatingRoles === editingUser?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Roles"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={!!approvalUser} onOpenChange={(open) => !open && setApprovalUser(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#0A4D2E]">Approve User</DialogTitle>
              <DialogDescription>
                Assign roles to {approvalUser?.full_name || approvalUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Select one or more roles to assign:</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {assignableRoles.map(role => (
                  <div key={role} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted">
                    <Checkbox
                      id={`approval-role-${role}`}
                      checked={approvalRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role, true)}
                    />
                    <label htmlFor={`approval-role-${role}`} className="flex-1 cursor-pointer">
                      <Badge variant={getRoleBadgeVariant(role)}>
                        {getRoleLabel(role)}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalUser(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApprove} 
                disabled={processing === approvalUser?.id || approvalRoles.length === 0}
                className="bg-[#0A4D2E] hover:bg-[#0A4D2E]/90"
              >
                {processing === approvalUser?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Delete User Permanently</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to permanently delete <strong>{deleteUser?.full_name || deleteUser?.email}</strong>?
                </p>
                <p className="font-semibold text-destructive">
                  This action cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processing === deleteUser?.id}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={processing === deleteUser?.id}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {processing === deleteUser?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </>
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