import { useState, useEffect, useCallback } from "react";

// Types for user preferences
export interface UserPreferences {
  fontSize: "normal" | "large" | "xlarge";
  lastViewedCategory: string | null;
  recentlyViewed: RecentlyViewedItem[];
  readingMode: boolean;
  preferredLanguage: "en" | "hi";
}

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  image?: string;
  viewedAt: number;
}

const PREFERENCES_KEY = "hum-pahadi-preferences";
const MAX_RECENTLY_VIEWED = 10;

const defaultPreferences: UserPreferences = {
  fontSize: "normal",
  lastViewedCategory: null,
  recentlyViewed: [],
  readingMode: false,
  preferredLanguage: "en",
};

function getStoredPreferences(): UserPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn("Failed to parse preferences:", e);
  }
  return defaultPreferences;
}

export function useLocalPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences);

  // Persist to localStorage when preferences change
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn("Failed to save preferences:", e);
    }
  }, [preferences]);

  // Update a single preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Add item to recently viewed
  const addRecentlyViewed = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    setPreferences(prev => {
      const filtered = prev.recentlyViewed.filter(i => i.slug !== item.slug);
      const newItem = { ...item, viewedAt: Date.now() };
      const updated = [newItem, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      return { ...prev, recentlyViewed: updated };
    });
  }, []);

  // Set last viewed category
  const setLastCategory = useCallback((category: string) => {
    setPreferences(prev => ({ ...prev, lastViewedCategory: category }));
  }, []);

  // Toggle reading mode
  const toggleReadingMode = useCallback(() => {
    setPreferences(prev => ({ ...prev, readingMode: !prev.readingMode }));
  }, []);

  // Cycle font size
  const cycleFontSize = useCallback(() => {
    setPreferences(prev => {
      const sizes: UserPreferences["fontSize"][] = ["normal", "large", "xlarge"];
      const currentIndex = sizes.indexOf(prev.fontSize);
      const nextIndex = (currentIndex + 1) % sizes.length;
      return { ...prev, fontSize: sizes[nextIndex] };
    });
  }, []);

  return {
    preferences,
    updatePreference,
    addRecentlyViewed,
    setLastCategory,
    toggleReadingMode,
    cycleFontSize,
  };
}

// Hook for recently viewed only (lighter weight)
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const prefs = getStoredPreferences();
    setItems(prefs.recentlyViewed);
  }, []);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.slug !== item.slug);
      const newItem = { ...item, viewedAt: Date.now() };
      const updated = [newItem, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      
      // Also persist
      try {
        const prefs = getStoredPreferences();
        prefs.recentlyViewed = updated;
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
      } catch (e) {
        console.warn("Failed to save recently viewed:", e);
      }
      
      return updated;
    });
  }, []);

  return { items, addItem };
}
