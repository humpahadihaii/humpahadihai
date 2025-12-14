import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CookieConsentBanner } from './CookieConsentBanner';

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface ConsentContextValue {
  consent: ConsentState | null;
  hasConsent: (category: ConsentCategory) => boolean;
  isLoading: boolean;
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  hasConsent: () => false,
  isLoading: true,
});

export function useConsent() {
  return useContext(ConsentContext);
}

const CONSENT_STORAGE_KEY = 'hp_cookie_consent';

function getStoredConsent(): ConsentState | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state || null;
    }
    return null;
  } catch {
    return null;
  }
}

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing consent
    const stored = getStoredConsent();
    setConsent(stored);
    setIsLoading(false);

    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) {
        const newConsent = getStoredConsent();
        setConsent(newConsent);
      }
    };

    // Custom event for same-tab consent changes
    const handleConsentChange = () => {
      const newConsent = getStoredConsent();
      setConsent(newConsent);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('consentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('consentChanged', handleConsentChange);
    };
  }, []);

  const hasConsent = (category: ConsentCategory): boolean => {
    if (category === 'necessary') return true;
    return consent?.[category] ?? false;
  };

  return (
    <ConsentContext.Provider value={{ consent, hasConsent, isLoading }}>
      {children}
      <CookieConsentBanner />
    </ConsentContext.Provider>
  );
}