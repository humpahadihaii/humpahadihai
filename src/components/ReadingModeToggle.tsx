import { useState, useEffect, createContext, useContext } from "react";
import { BookOpen, X, Type, Minus, Plus, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadingModeContextType {
  isReadingMode: boolean;
  fontSize: number;
  toggleReadingMode: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const ReadingModeContext = createContext<ReadingModeContextType | undefined>(undefined);

const STORAGE_KEY = "reading-mode-settings";

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(100); // percentage

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFontSize(parsed.fontSize || 100);
      }
    } catch (e) {
      console.warn("Failed to load reading mode settings");
    }
  }, []);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize }));
    } catch (e) {
      console.warn("Failed to save reading mode settings");
    }
  }, [fontSize]);

  // Apply reading mode styles
  useEffect(() => {
    if (isReadingMode) {
      document.body.classList.add("reading-mode");
      document.documentElement.style.setProperty("--reading-font-size", `${fontSize}%`);
    } else {
      document.body.classList.remove("reading-mode");
      document.documentElement.style.removeProperty("--reading-font-size");
    }

    return () => {
      document.body.classList.remove("reading-mode");
    };
  }, [isReadingMode, fontSize]);

  const toggleReadingMode = () => setIsReadingMode(prev => !prev);
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 10, 150));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 10, 80));

  return (
    <ReadingModeContext.Provider
      value={{
        isReadingMode,
        fontSize,
        toggleReadingMode,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </ReadingModeContext.Provider>
  );
}

export function useReadingMode() {
  const context = useContext(ReadingModeContext);
  if (!context) {
    throw new Error("useReadingMode must be used within ReadingModeProvider");
  }
  return context;
}

/**
 * Floating reading mode toggle button for article pages
 */
export function ReadingModeToggle({ className }: { className?: string }) {
  const { isReadingMode, fontSize, toggleReadingMode, increaseFontSize, decreaseFontSize } = useReadingMode();

  if (isReadingMode) {
    return (
      <div
        className={cn(
          "fixed bottom-24 right-4 z-40 flex flex-col gap-2 p-2 rounded-2xl",
          "bg-card/95 backdrop-blur-md border border-border shadow-lg",
          "animate-fade-in",
          className
        )}
      >
        {/* Font size controls */}
        <div className="flex items-center gap-1 px-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={decreaseFontSize}
            disabled={fontSize <= 80}
            aria-label="Decrease font size"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium w-10 text-center">{fontSize}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={increaseFontSize}
            disabled={fontSize >= 150}
            aria-label="Increase font size"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Exit button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={toggleReadingMode}
        >
          <X className="h-4 w-4" />
          Exit
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed bottom-24 right-4 z-40 h-12 w-12 rounded-full shadow-lg",
        "bg-card/95 backdrop-blur-md border-border hover:bg-muted",
        "transition-all duration-200 hover:scale-105",
        className
      )}
      onClick={toggleReadingMode}
      aria-label="Enter reading mode"
    >
      <BookOpen className="h-5 w-5" />
    </Button>
  );
}

/**
 * Wrapper for content that should be affected by reading mode
 */
export function ReadingModeContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isReadingMode } = useReadingMode();

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isReadingMode && "reading-mode-content",
        className
      )}
    >
      {children}
    </div>
  );
}
