import { AlertTriangle, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/hooks/useImpersonation";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, loading, stopImpersonation } = useImpersonation();

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

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-amber-950 px-4 py-2 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">
              Impersonating: {impersonatedUser.fullName || impersonatedUser.email}
            </span>
            {impersonatedUser.roles.length > 0 && (
              <span className="text-amber-800 text-sm">
                ({impersonatedUser.roles.join(", ")})
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:inline">
            You are viewing the app as this user
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExitImpersonation}
            disabled={loading}
            className="bg-amber-100 border-amber-700 text-amber-900 hover:bg-amber-200 hover:text-amber-950"
          >
            <X className="h-4 w-4 mr-1" />
            {loading ? "Exiting..." : "Exit Impersonation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
