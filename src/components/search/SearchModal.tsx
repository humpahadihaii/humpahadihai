import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "./SearchBox";
import { useSearchModal } from "./SearchContext";
import { cn } from "@/lib/utils";

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useSearchModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const input = modalRef.current?.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSearch();
    }
  };

  // Handle search completion - close modal and navigate
  const handleSearch = (query: string) => {
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Handle quick link navigation
  const handleQuickLink = (href: string) => {
    closeSearch();
    navigate(href);
  };

  if (!isSearchOpen) return null;

  const modalContent = (
    <div
      className="search-modal-portal fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal content - positioned below header */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 w-full bg-background border-b border-border shadow-lg",
          "mt-[var(--header-height,5rem)]", // Offset by header height
          "animate-in slide-in-from-top-2 duration-200"
        )}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Close button - mobile friendly */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Search</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSearch}
              className="h-10 w-10"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search box with hero variant for better visibility */}
          <SearchBox
            variant="hero"
            autoFocus
            placeholder="Search villages, stays, packages, products..."
            onSearch={handleSearch}
          />

          {/* Quick links / categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            <QuickLinkButton onClick={() => handleQuickLink("/districts")}>Districts</QuickLinkButton>
            <QuickLinkButton onClick={() => handleQuickLink("/marketplace")}>Marketplace</QuickLinkButton>
            <QuickLinkButton onClick={() => handleQuickLink("/travel-packages")}>Travel Packages</QuickLinkButton>
            <QuickLinkButton onClick={() => handleQuickLink("/products")}>Shop</QuickLinkButton>
            <QuickLinkButton onClick={() => handleQuickLink("/events")}>Events</QuickLinkButton>
          </div>
        </div>
      </div>

      {/* Click outside area below modal */}
      <div className="flex-1" onClick={handleBackdropClick} />
    </div>
  );

  // Use portal to render modal at document.body level
  return createPortal(modalContent, document.body);
}

function QuickLinkButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm bg-muted hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
    >
      {children}
    </button>
  );
}
