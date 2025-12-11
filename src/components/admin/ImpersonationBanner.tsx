import { AlertTriangle, X, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImpersonation } from "@/hooks/useImpersonation";
import { toast } from "sonner";
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/rbac";

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, loading, stopImpersonation, impersonatedRoles } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  const handleExitImpersonation = async () => {
    const result = await stopImpersonation();
    if (result.success) {
      toast.success("Exited impersonation mode");
      // Reload to refresh permissions and data
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to exit impersonation");
    }
  };

  const primaryRole = impersonatedRoles[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-amber-950 px-4 py-2 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <User className="h-4 w-4" />
            <span className="font-medium">
              Viewing as: {impersonatedUser.fullName || impersonatedUser.email}
            </span>
            {primaryRole && (
              <Badge variant={getRoleBadgeVariant(primaryRole)} className="bg-amber-100 text-amber-900 border-amber-600">
                {getRoleLabel(primaryRole)}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:inline">
            Sidebar shows only sections this role can access
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExitImpersonation}
            disabled={loading}
            className="bg-amber-100 border-amber-700 text-amber-900 hover:bg-amber-200 hover:text-amber-950"
          >
            <X className="h-4 w-4 mr-1" />
            {loading ? "Exiting..." : "Exit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
