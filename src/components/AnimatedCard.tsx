import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "lift" | "scale" | "glow" | "none";
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = "lift",
}: AnimatedCardProps) {
  const hoverClasses = {
    lift: "hover:-translate-y-1 hover:shadow-lg",
    scale: "hover:scale-[1.02]",
    glow: "hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
    none: "",
  };

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out will-change-transform",
        hoverClasses[hoverEffect],
        className
      )}
    >
      {children}
    </div>
  );
}
