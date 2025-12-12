import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchModal } from "./SearchContext";
import { cn } from "@/lib/utils";

interface SearchTriggerProps {
  variant?: "icon" | "button" | "hero";
  className?: string;
}

export function SearchTrigger({ variant = "icon", className }: SearchTriggerProps) {
  const { openSearch } = useSearchModal();

  if (variant === "hero") {
    return (
      <Button
        onClick={openSearch}
        size="lg"
        className={cn(
          "gap-2 px-6 py-3 text-base bg-background/95 text-foreground hover:bg-background",
          "backdrop-blur-sm shadow-lg",
          className
        )}
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
        <span>Search Uttarakhand</span>
      </Button>
    );
  }

  if (variant === "button") {
    return (
      <Button
        onClick={openSearch}
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    );
  }

  // Default icon variant
  return (
    <Button
      onClick={openSearch}
      variant="ghost"
      size="icon"
      className={cn("h-10 w-10", className)}
      aria-label="Open search"
    >
      <Search className="h-5 w-5" />
    </Button>
  );
}
