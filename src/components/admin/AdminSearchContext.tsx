import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

interface AdminSearchContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const AdminSearchContext = createContext<AdminSearchContextValue | undefined>(undefined);

export function AdminSearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <AdminSearchContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearchModal() {
  const context = useContext(AdminSearchContext);
  if (!context) {
    throw new Error("useAdminSearchModal must be used within AdminSearchProvider");
  }
  return context;
}
