import React from "react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  progress: number;
  isVisible: boolean;
  className?: string;
}

/**
 * Full-page circular loader with percentage display
 * Non-blocking overlay with smooth animations
 */
export function PageLoader({ progress, isVisible, className }: PageLoaderProps) {
  if (!isVisible && progress >= 100) return null;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-background/70 backdrop-blur-sm",
        "transition-opacity duration-500 ease-out",
        !isVisible && "opacity-0 pointer-events-none",
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading page content"
    >
      <div className="relative w-20 h-20">
        {/* Background track */}
        <svg 
          className="w-full h-full -rotate-90" 
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={5}
          />
          
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-200 ease-out"
          />
        </svg>
        
        {/* Spinning accent overlay */}
        <svg 
          className="absolute inset-0 w-full h-full animate-spin" 
          viewBox="0 0 100 100"
          style={{ animationDuration: "1.5s" }}
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#spinnerGradient)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-base font-semibold text-foreground tabular-nums"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline loader for sections
 */
export function SectionLoader({ 
  progress, 
  label,
  className 
}: { 
  progress: number; 
  label?: string;
  className?: string;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={3}
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-foreground tabular-nums">
          {progress}%
        </span>
      </div>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

export default PageLoader;
