import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearch, Suggestion } from "@/hooks/useSearch";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  showFilters?: boolean;
  variant?: "default" | "hero" | "compact";
}

const CONTENT_TYPE_ICONS: Record<string, string> = {
  village: "🏘️",
  district: "🗺️",
  provider: "🏨",
  listing: "🏡",
  package: "🎒",
  product: "🛍️",
  story: "📖",
  event: "🎉",
  thought: "💭",
};

export function SearchBox({
  placeholder = "Search villages, stays, packages, products...",
  className,
  onSearch,
  autoFocus = false,
  variant = "default",
}: SearchBoxProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(inputValue, 200);
  const { setQuery, suggestions, isSuggestLoading, trackClick } = useSearch();

  // Update search hook with debounced query
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setQuery(debouncedQuery);
    }
  }, [debouncedQuery, setQuery]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (inputValue.trim()) {
        setIsOpen(false);
        if (onSearch) {
          onSearch(inputValue.trim());
        } else {
          navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
        }
      }
    },
    [inputValue, navigate, onSearch]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion, index: number) => {
      setIsOpen(false);
      setInputValue(suggestion.text);

      if (suggestion.url) {
        // Track click and navigate directly
        trackClick({ id: suggestion.text, url: suggestion.url } as any, index);
        navigate(suggestion.url);
      } else {
        // Search for the suggestion text
        if (onSearch) {
          onSearch(suggestion.text);
        } else {
          navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
        }
      }
    },
    [navigate, onSearch, trackClick]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === "Enter") {
          handleSubmit();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex], selectedIndex);
          } else {
            handleSubmit();
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, handleSubmit, handleSuggestionClick]
  );

  const clearInput = useCallback(() => {
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "relative flex items-center",
            variant === "hero" && "bg-background/95 backdrop-blur-sm rounded-xl shadow-lg",
            variant === "compact" && "bg-muted rounded-lg"
          )}
        >
          <Search
            className={cn(
              "absolute left-3 h-5 w-5 text-muted-foreground",
              variant === "hero" && "left-4 h-6 w-6"
            )}
          />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "pl-10 pr-20",
              variant === "hero" && "h-14 pl-12 pr-24 text-lg rounded-xl border-0 focus-visible:ring-2 focus-visible:ring-primary",
              variant === "compact" && "h-10 pl-10 pr-16 text-sm border-0"
            )}
          />
          <div className="absolute right-2 flex items-center gap-1">
            {isSuggestLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={clearInput}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size={variant === "hero" ? "default" : "sm"}
              className={cn(variant === "hero" && "px-6")}
            >
              <Search className="h-4 w-4" />
              {variant === "hero" && <span className="ml-2 hidden sm:inline">Search</span>}
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-popover shadow-lg overflow-hidden">
          <ul className="py-2" role="listbox">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.text}-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                  index === selectedIndex && "bg-accent",
                  index !== selectedIndex && "hover:bg-muted"
                )}
                onClick={() => handleSuggestionClick(suggestion, index)}
              >
                {suggestion.image_url ? (
                  <img
                    src={suggestion.image_url}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="text-xl flex-shrink-0">
                    {CONTENT_TYPE_ICONS[suggestion.entity_type || ""] || "🔍"}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{suggestion.text}</p>
                  {suggestion.entity_type && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {suggestion.entity_type}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </li>
            ))}
          </ul>
          <div className="border-t px-4 py-2 bg-muted/50">
            <button
              onClick={handleSubmit}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              See all results for "{inputValue}"
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
