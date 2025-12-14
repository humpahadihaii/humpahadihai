import React, { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface ProgressSignals {
  routeReady?: boolean;
  dataReady?: boolean;
  imagesReady?: boolean;
}

// Hook for tracking page load progress with hybrid approach
export function usePageProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [signals, setSignals] = useState<ProgressSignals>({
    routeReady: false,
    dataReady: false,
    imagesReady: false,
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Signal handlers
  const signalRouteReady = useCallback(() => {
    setSignals(prev => ({ ...prev, routeReady: true }));
  }, []);

  const signalDataReady = useCallback(() => {
    setSignals(prev => ({ ...prev, dataReady: true }));
  }, []);

  const signalImagesReady = useCallback(() => {
    setSignals(prev => ({ ...prev, imagesReady: true }));
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setIsVisible(true);
    setSignals({ routeReady: false, dataReady: false, imagesReady: false });
    startTimeRef.current = Date.now();
  }, []);

  // Calculate target progress based on signals
  const getTargetProgress = useCallback(() => {
    let target = 10; // Start at 10%
    
    if (signals.routeReady) target += 25;
    if (signals.dataReady) target += 35;
    if (signals.imagesReady) target += 25;
    
    // Cap at 95% until all signals are ready
    const allReady = signals.routeReady && signals.dataReady && signals.imagesReady;
    return allReady ? 100 : Math.min(target, 95);
  }, [signals]);

  // Smooth progress animation
  useEffect(() => {
    const animate = () => {
      const target = getTargetProgress();
      const elapsed = Date.now() - startTimeRef.current;
      
      setProgress(prev => {
        // Time-based fallback progression
        const timeBasedProgress = Math.min(10 + (elapsed / 100) * 2, 90);
        const effectiveTarget = Math.max(target, timeBasedProgress);
        
        if (prev >= effectiveTarget) return prev;
        
        // Smooth easing - faster initially, slower as approaching target
        const remaining = effectiveTarget - prev;
        const step = Math.max(0.5, remaining * 0.08);
        
        return Math.min(prev + step, effectiveTarget);
      });
    };

    timerRef.current = setInterval(animate, 50);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [getTargetProgress]);

  // Complete and fade out
  useEffect(() => {
    if (progress >= 100) {
      completionTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
    
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, [progress]);

  // Fallback: ensure completion after max time (8 seconds)
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setSignals({ routeReady: true, dataReady: true, imagesReady: true });
    }, 8000);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  return {
    progress: Math.round(progress),
    isVisible,
    signalRouteReady,
    signalDataReady,
    signalImagesReady,
    reset,
  };
}

// Circular progress loader with percentage
export function ProgressLoader({
  isLoading,
  onComplete,
  className,
  size = "md",
}: ProgressLoaderProps) {
  const { progress, isVisible, signalDataReady, signalImagesReady } = usePageProgress();

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg";

  // Trigger completion callback
  useEffect(() => {
    if (progress >= 100 && !isVisible && onComplete) {
      onComplete();
    }
  }, [progress, isVisible, onComplete]);

  // Auto signal data ready when not loading
  useEffect(() => {
    if (!isLoading) {
      signalDataReady();
      signalImagesReady();
    }
  }, [isLoading, signalDataReady, signalImagesReady]);

  if (!isVisible && progress >= 100) return null;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        !isVisible && "opacity-0 pointer-events-none",
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading page"
    >
      <div className={cn("relative", sizeClasses[size])}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>
        
        {/* Spinning indicator overlay */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90 animate-spin" 
          viewBox="0 0 100 100"
          style={{ animationDuration: "2s" }}
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth={strokeWidth / 2}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.15} ${circumference * 0.85}`}
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-semibold text-foreground tabular-nums",
            textSize
          )}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Inline progress indicator (non-blocking)
export function InlineProgressLoader({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={40}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={6}
          />
          <circle
            cx="50"
            cy="50"
            r={40}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

export default ProgressLoader;
