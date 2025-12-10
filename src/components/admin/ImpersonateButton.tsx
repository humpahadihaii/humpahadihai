import { useState } from "react";
import { UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useImpersonation } from "@/hooks/useImpersonation";
import { toast } from "sonner";

interface ImpersonateButtonProps {
  targetUserId: string;
  targetEmail: string;
  targetName?: string | null;
  disabled?: boolean;
}

export function ImpersonateButton({
  targetUserId,
  targetEmail,
  targetName,
  disabled = false,
}: ImpersonateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { startImpersonation, loading, isImpersonating } = useImpersonation();

  const handleImpersonate = async () => {
    const result = await startImpersonation(targetUserId, reason.trim() || undefined);
    
    if (result.success) {
      toast.success(`Now impersonating ${targetName || targetEmail}`);
      setDialogOpen(false);
      setReason("");
      // Reload to apply impersonation
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to start impersonation");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDialogOpen(true)}
        disabled={disabled || isImpersonating}
        title="Impersonate user"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <UserCog className="h-4 w-4" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              Impersonate User
            </DialogTitle>
            <DialogDescription>
              You are about to impersonate this user. This action is logged for security purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Target User</Label>
              <Input
                value={`${targetName || "N/A"} (${targetEmail})`}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Troubleshooting user-reported issue #123"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be recorded in the audit log.
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> While impersonating, you will see the app exactly as this user sees it, 
                with their permissions. All actions are still logged under your admin account.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImpersonate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <UserCog className="h-4 w-4 mr-2" />
                  Start Impersonation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
