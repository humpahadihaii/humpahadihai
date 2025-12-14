import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, FileText, MapPin, Folder, Tag, Package, Building, Calendar, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminSearch, AdminSearchResult } from "@/hooks/useAdminSearch";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<AdminSearchResult["type"], React.ReactNode> = {
  district: <MapPin className="h-4 w-4" />,
  village: <MapPin className="h-4 w-4" />,
  category: <Folder className="h-4 w-4" />,
  subcategory: <Tag className="h-4 w-4" />,
  content: <FileText className="h-4 w-4" />,
  story: <BookOpen className="h-4 w-4" />,
  event: <Calendar className="h-4 w-4" />,
  page: <FileText className="h-4 w-4" />,
  provider: <Building className="h-4 w-4" />,
  listing: <Building className="h-4 w-4" />,
  package: <Package className="h-4 w-4" />,
  product: <Package className="h-4 w-4" />,
  "admin-page": <Settings className="h-4 w-4" />,
};

const TYPE_COLORS: Record<AdminSearchResult["type"], string> = {
  district: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  village: "bg-green-500/10 text-green-600 dark:text-green-400",
  category: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  subcategory: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  content: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  story: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  event: "bg-red-500/10 text-red-600 dark:text-red-400",
  page: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  provider: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  listing: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  package: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  product: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "admin-page": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isSearching, clearSearch, hasResults } = useAdminSearch();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        onClose();
        clearSearch();
      }
      // Open on Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Parent component should handle opening
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, clearSearch]);

  // Handle result click
  const handleResultClick = useCallback((result: AdminSearchResult) => {
    navigate(result.route);
    onClose();
    clearSearch();
  }, [navigate, onClose, clearSearch]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      clearSearch();
    }
  }, [onClose, clearSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "w-full max-w-2xl mx-4",
          "bg-[hsl(var(--admin-surface))] dark:bg-[hsl(220,13%,12%)]",
          "rounded-xl shadow-2xl border border-[hsl(var(--admin-border))]",
          "overflow-hidden"
        )}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--admin-border))]">
          <Search className="h-5 w-5 text-[hsl(var(--admin-text-tertiary))]" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search districts, villages, content, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0",
              "text-base placeholder:text-[hsl(var(--admin-text-tertiary))]"
            )}
          />
          {query && (
            <button
              onClick={() => clearSearch()}
              className="p-1 hover:bg-[hsl(var(--admin-sidebar-hover))] rounded"
            >
              <X className="h-4 w-4 text-[hsl(var(--admin-text-tertiary))]" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-[hsl(var(--admin-border))] bg-muted px-1.5 font-mono text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching && (
            <div className="p-8 text-center text-[hsl(var(--admin-text-secondary))]">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {!isSearching && query.length > 0 && query.length < 2 && (
            <div className="p-8 text-center text-[hsl(var(--admin-text-tertiary))]">
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}

          {!isSearching && query.length >= 2 && !hasResults && (
            <div className="p-8 text-center text-[hsl(var(--admin-text-tertiary))]">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1 opacity-75">Try a different search term</p>
            </div>
          )}

          {!isSearching && hasResults && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                    "hover:bg-[hsl(var(--admin-sidebar-hover))]",
                    "focus:bg-[hsl(var(--admin-sidebar-hover))] focus:outline-none",
                    "transition-colors"
                  )}
                >
                  {/* Icon */}
                  <span className={cn("p-1.5 rounded-lg", TYPE_COLORS[result.type])}>
                    {TYPE_ICONS[result.type]}
                  </span>

                  {/* Title & Type */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--admin-text-primary))] truncate">
                      {result.title}
                    </p>
                    {result.parentInfo && (
                      <p className="text-xs text-[hsl(var(--admin-text-tertiary))] truncate">
                        {result.parentInfo}
                      </p>
                    )}
                  </div>

                  {/* Type Badge */}
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {result.typeLabel}
                  </Badge>

                  {/* Status */}
                  {result.status && (
                    <Badge
                      variant={result.status === "published" ? "default" : "outline"}
                      className="text-xs shrink-0"
                    >
                      {result.status}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Empty state - no query */}
          {!query && (
            <div className="p-6 text-center text-[hsl(var(--admin-text-tertiary))]">
              <p className="text-sm">Search across all admin content</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">Districts</Badge>
                <Badge variant="outline" className="text-xs">Villages</Badge>
                <Badge variant="outline" className="text-xs">Content</Badge>
                <Badge variant="outline" className="text-xs">Stories</Badge>
                <Badge variant="outline" className="text-xs">Events</Badge>
                <Badge variant="outline" className="text-xs">Listings</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[hsl(var(--admin-border))] flex items-center gap-4 text-xs text-[hsl(var(--admin-text-tertiary))]">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[hsl(var(--admin-border))] bg-muted">↵</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[hsl(var(--admin-border))] bg-muted">↑↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[hsl(var(--admin-border))] bg-muted">esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
