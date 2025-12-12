import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface SearchContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const openSearch = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    // Restore focus to previous element
    setTimeout(() => {
      previousActiveElement.current?.focus();
    }, 100);
  }, []);

  const toggleSearch = useCallback(() => {
    if (isSearchOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  }, [isSearchOpen, openSearch, closeSearch]);

  // Handle body scroll lock
  useEffect(() => {
    if (isSearchOpen) {
      document.body.classList.add("body-scroll-locked");
    } else {
      document.body.classList.remove("body-scroll-locked");
    }
    return () => {
      document.body.classList.remove("body-scroll-locked");
    };
  }, [isSearchOpen]);

  // Handle ESC key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  return (
    <SearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch, toggleSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchModal() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchModal must be used within SearchProvider");
  }
  return context;
}
