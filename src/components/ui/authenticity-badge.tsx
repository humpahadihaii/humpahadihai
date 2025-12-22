import { memo } from "react";
import { cn } from "@/lib/utils";
import { Mountain, HandHeart } from "lucide-react";

interface AuthenticityBadgeProps {
  variant?: "default" | "compact" | "inline";
  className?: string;
}

/**
 * AuthenticityBadge - Trust indicator for authentic Pahadi products
 * Shows cultural authenticity without aggressive marketing
 */
export const AuthenticityBadge = memo(function AuthenticityBadge({
  variant = "default",
  className,
}: AuthenticityBadgeProps) {
  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
          "border border-emerald-200 dark:border-emerald-800",
          className
        )}
      >
        <Mountain className="h-3 w-3" />
        Pahadi
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400",
          className
        )}
      >
        <Mountain className="h-4 w-4" />
        <span>Authentic Pahadi Product</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/40 dark:to-amber-950/40",
        "border border-emerald-200/60 dark:border-emerald-800/60",
        className
      )}
    >
      <Mountain className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
        Authentic Pahadi Product
      </span>
    </div>
  );
});

/**
 * CulturalCueBadge - Small badge for cultural product tags
 */
export const CulturalCueBadge = memo(function CulturalCueBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  // Define cultural keywords that warrant special styling
  const culturalKeywords = ["handmade", "traditional", "organic", "local", "artisan", "handcrafted"];
  const isCultural = culturalKeywords.some((kw) =>
    label.toLowerCase().includes(kw)
  );

  if (!isCultural) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
        "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
        "border border-amber-200 dark:border-amber-800",
        className
      )}
    >
      <HandHeart className="h-3 w-3" />
      {label}
    </span>
  );
});

export default AuthenticityBadge;
