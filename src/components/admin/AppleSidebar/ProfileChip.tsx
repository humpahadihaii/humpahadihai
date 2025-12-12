import { LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRoleLabel, getRoleBadgeVariant, RBACRole } from "@/lib/rbac";

interface ProfileChipProps {
  email?: string;
  highestRole: RBACRole | null;
  collapsed: boolean;
  onSignOut: () => void;
  signingOut: boolean;
}

export function ProfileChip({ 
  email, 
  highestRole, 
  collapsed, 
  onSignOut, 
  signingOut 
}: ProfileChipProps) {
  // Get initials from email
  const initials = email 
    ? email.split('@')[0].slice(0, 2).toUpperCase() 
    : '??';

  const signOutButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={onSignOut}
      disabled={signingOut}
      className={cn(
        "h-9 w-9 rounded-lg",
        "text-[hsl(220,9%,46%)] hover:text-[hsl(0,84%,60%)]",
        "hover:bg-[hsl(0,84%,60%,0.1)]",
        "transition-colors duration-150"
      )}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );

  if (collapsed) {
    return (
      <div className="p-2 flex flex-col items-center gap-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Avatar className="h-9 w-9 cursor-default">
              <AvatarFallback className="bg-[hsl(142,71%,45%,0.12)] text-[hsl(142,71%,35%)] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <div className="text-sm">
              <p className="font-medium">{email}</p>
              {highestRole && (
                <p className="text-muted-foreground text-xs mt-0.5">
                  {getRoleLabel(highestRole)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {signOutButton}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            Sign Out
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Profile card */}
      <div 
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl",
          "bg-[hsl(220,14%,96%)] dark:bg-[hsl(220,13%,14%)]",
          "border border-[hsl(220,13%,91%)] dark:border-[hsl(220,13%,18%)]"
        )}
      >
        {/* Avatar */}
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-[hsl(142,71%,45%,0.12)] text-[hsl(142,71%,35%)] text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[hsl(220,9%,12%)] dark:text-[hsl(0,0%,98%)] truncate">
            {email?.split('@')[0] || 'User'}
          </p>
          {highestRole && (
            <Badge 
              variant={getRoleBadgeVariant(highestRole)}
              className="mt-0.5 text-[10px] h-5 px-1.5"
            >
              {getRoleLabel(highestRole)}
            </Badge>
          )}
        </div>
        
        {/* Sign out */}
        {signOutButton}
      </div>
    </div>
  );
}
