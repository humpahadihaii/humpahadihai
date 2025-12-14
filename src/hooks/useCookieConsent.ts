import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface ConsentSettings {
  id: string;
  banner_title: string;
  banner_description: string;
  categories: Record<string, {
    enabled: boolean;
    locked: boolean;
    title: string;
    description: string;
  }>;
  accept_all_text: string;
  reject_all_text: string;
  manage_text: string;
  save_text: string;
  privacy_policy_url: string;
  cookie_policy_url: string;
  consent_expiry_days: number;
  policy_version: number;
  force_reconsent: boolean;
  banner_position: string;
  theme: string;
}

interface StoredConsent {
  state: ConsentState;
  version: number;
  timestamp: number;
}

const CONSENT_STORAGE_KEY = 'hp_cookie_consent';
const CONSENT_COOKIE_KEY = 'hp_consent';

// Get consent from storage (localStorage with cookie fallback)
function getStoredConsent(): StoredConsent | null {
  try {
    // Try localStorage first
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback to cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    if (cookies[CONSENT_COOKIE_KEY]) {
      return JSON.parse(decodeURIComponent(cookies[CONSENT_COOKIE_KEY]));
    }
    
    return null;
  } catch {
    return null;
  }
}

// Store consent in localStorage and cookie
function storeConsent(consent: StoredConsent, expiryDays: number): void {
  try {
    const json = JSON.stringify(consent);
    localStorage.setItem(CONSENT_STORAGE_KEY, json);
    
    // Also store in cookie as fallback
    const expires = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(json)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  } catch (e) {
    console.debug('Failed to store consent:', e);
  }
}

// Track consent action to stats
async function trackConsentAction(
  action: 'accepted_all' | 'rejected_all' | 'customized',
  categories?: ConsentCategory[]
): Promise<void> {
  try {
    await supabase.rpc('increment_consent_stat', {
      p_stat_type: action,
      p_categories: categories || null
    });
  } catch (e) {
    console.debug('Failed to track consent:', e);
  }
}

export function useCookieConsent() {
  const [settings, setSettings] = useState<ConsentSettings | null>(null);
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch settings from database
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('cookie_consent_settings')
          .select('*')
          .single();
        
        if (error) throw error;
        if (data) {
          setSettings({
            ...data,
            categories: data.categories as ConsentSettings['categories']
          } as ConsentSettings);
        }
      } catch (e) {
        console.debug('Failed to fetch consent settings:', e);
        // Use defaults
        setSettings({
          id: '',
          banner_title: 'We value your privacy',
          banner_description: 'We use cookies to enhance your browsing experience and analyze site traffic.',
          categories: {
            necessary: { enabled: true, locked: true, title: 'Essential', description: 'Required for basic functionality.' },
            analytics: { enabled: true, locked: false, title: 'Analytics', description: 'Help us improve our website.' },
            marketing: { enabled: true, locked: false, title: 'Marketing', description: 'For advertising purposes.' },
            preferences: { enabled: true, locked: false, title: 'Preferences', description: 'Remember your settings.' },
          },
          accept_all_text: 'Accept All',
          reject_all_text: 'Reject All',
          manage_text: 'Manage Preferences',
          save_text: 'Save Preferences',
          privacy_policy_url: '/privacy-policy',
          cookie_policy_url: '/privacy-policy#cookies',
          consent_expiry_days: 365,
          policy_version: 1,
          force_reconsent: false,
          banner_position: 'bottom',
          theme: 'auto',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Check stored consent on mount
  useEffect(() => {
    if (!settings || loading) return;

    const stored = getStoredConsent();
    
    if (stored) {
      // Check if consent has expired
      const expiryMs = settings.consent_expiry_days * 24 * 60 * 60 * 1000;
      const isExpired = Date.now() - stored.timestamp > expiryMs;
      
      // Check if policy version changed or force reconsent
      const needsReconsent = stored.version < settings.policy_version || settings.force_reconsent;
      
      if (isExpired || needsReconsent) {
        setShowBanner(true);
      } else {
        setConsent(stored.state);
      }
    } else {
      setShowBanner(true);
    }
  }, [settings, loading]);

  const acceptAll = useCallback(() => {
    if (!settings) return;
    
    const state: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    const stored: StoredConsent = {
      state,
      version: settings.policy_version,
      timestamp: Date.now(),
    };
    
    storeConsent(stored, settings.consent_expiry_days);
    setConsent(state);
    setShowBanner(false);
    setShowPreferences(false);
    trackConsentAction('accepted_all');
  }, [settings]);

  const rejectAll = useCallback(() => {
    if (!settings) return;
    
    const state: ConsentState = {
      necessary: true, // Always enabled
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    const stored: StoredConsent = {
      state,
      version: settings.policy_version,
      timestamp: Date.now(),
    };
    
    storeConsent(stored, settings.consent_expiry_days);
    setConsent(state);
    setShowBanner(false);
    setShowPreferences(false);
    trackConsentAction('rejected_all');
  }, [settings]);

  const savePreferences = useCallback((preferences: Partial<ConsentState>) => {
    if (!settings) return;
    
    const state: ConsentState = {
      necessary: true, // Always enabled
      analytics: preferences.analytics ?? false,
      marketing: preferences.marketing ?? false,
      preferences: preferences.preferences ?? false,
    };
    
    const stored: StoredConsent = {
      state,
      version: settings.policy_version,
      timestamp: Date.now(),
    };
    
    storeConsent(stored, settings.consent_expiry_days);
    setConsent(state);
    setShowBanner(false);
    setShowPreferences(false);
    
    const acceptedCategories: ConsentCategory[] = [];
    if (state.analytics) acceptedCategories.push('analytics');
    if (state.marketing) acceptedCategories.push('marketing');
    if (state.preferences) acceptedCategories.push('preferences');
    
    trackConsentAction('customized', acceptedCategories);
  }, [settings]);

  const openPreferences = useCallback(() => {
    setShowPreferences(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferences(false);
  }, []);

  const hasConsent = useCallback((category: ConsentCategory): boolean => {
    if (category === 'necessary') return true;
    return consent?.[category] ?? false;
  }, [consent]);

  return {
    settings,
    consent,
    showBanner,
    showPreferences,
    loading,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
    hasConsent,
  };
}

// Simple hook to check if analytics is consented
export function useAnalyticsConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setHasConsent(stored?.state?.analytics ?? false);
  }, []);

  return hasConsent;
}