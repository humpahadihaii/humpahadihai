// Google Analytics 4 Integration Module
// Handles client-side gtag and server-side Measurement Protocol

import { supabase } from "@/integrations/supabase/client";

// Types
interface PageViewParams {
  page_path: string;
  page_title: string;
  page_location?: string;
}

interface EventParams {
  [key: string]: string | number | boolean | undefined | null;
}

interface BookingEventParams {
  booking_id: string;
  booking_type: 'package' | 'listing' | 'product';
  item_id: string;
  item_name: string;
  price?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  user_logged_in?: boolean;
}

interface EnquiryEventParams {
  enquiry_type: string;
  item_id?: string;
  item_name?: string;
}

// Global gtag function type
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Get measurement ID from environment
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';

// Check if analytics is enabled
let analyticsEnabled = true;
let adPersonalizationEnabled = false;

// Initialize analytics settings from database
export async function loadAnalyticsSettings(): Promise<{ enabled: boolean; adPersonalization: boolean }> {
  try {
    const { data, error } = await supabase
      .from('analytics_settings')
      .select('analytics_enabled, ad_personalization_enabled')
      .limit(1)
      .single();

    if (error) {
      console.warn('Failed to load analytics settings:', error.message);
      return { enabled: true, adPersonalization: false };
    }

    analyticsEnabled = data?.analytics_enabled ?? true;
    adPersonalizationEnabled = data?.ad_personalization_enabled ?? false;

    return { enabled: analyticsEnabled, adPersonalization: adPersonalizationEnabled };
  } catch (err) {
    console.warn('Error loading analytics settings:', err);
    return { enabled: true, adPersonalization: false };
  }
}

// Initialize gtag with proper configuration
export function initAnalytics(): void {
  if (!GA_MEASUREMENT_ID || !analyticsEnabled) {
    console.log('Analytics disabled or no measurement ID');
    return;
  }

  // Check if already initialized
  if (document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Set initial timestamp
  window.gtag('js', new Date());

  // Configure gtag with privacy settings
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_ad_personalization_signals: adPersonalizationEnabled,
    send_page_view: false, // We'll manually send page views for SPA
  });

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  console.log('GA4 Analytics initialized');
}

// Track page view (for SPA navigation)
export function trackPageView(params: PageViewParams): void {
  if (!GA_MEASUREMENT_ID || !analyticsEnabled || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: params.page_path,
    page_title: params.page_title,
    page_location: params.page_location || window.location.href,
  });
}

// Track custom event
export function trackEvent(eventName: string, params?: EventParams): void {
  if (!GA_MEASUREMENT_ID || !analyticsEnabled || typeof window.gtag !== 'function') {
    return;
  }

  // Filter out PII and undefined values
  const sanitizedParams = params ? sanitizeParams(params) : {};

  window.gtag('event', eventName, sanitizedParams);
}

// Track booking event (both client and server-side)
export async function trackBooking(booking: BookingEventParams): Promise<void> {
  // Client-side tracking
  trackEvent('booking_submitted', {
    booking_id: booking.booking_id,
    booking_type: booking.booking_type,
    item_id: booking.item_id,
    item_name: booking.item_name,
    value: booking.price,
    currency: booking.currency || 'INR',
    start_date: booking.start_date,
    end_date: booking.end_date,
    user_logged_in: booking.user_logged_in,
  });

  // Server-side tracking for reliability
  await sendServerEvent('booking_submitted', {
    booking_id: booking.booking_id,
    booking_type: booking.booking_type,
    item_id: booking.item_id,
    item_name: booking.item_name,
    value: booking.price,
    currency: booking.currency || 'INR',
  });
}

// Track enquiry event
export function trackEnquiry(params: EnquiryEventParams): void {
  trackEvent('enquiry_submitted', {
    enquiry_type: params.enquiry_type,
    item_id: params.item_id,
    item_name: params.item_name,
  });
}

// Track listing view
export function trackListingView(listingId: string, listingName: string, category?: string): void {
  trackEvent('listing_view', {
    item_id: listingId,
    item_name: listingName,
    item_category: category,
  });
}

// Track listing contact click
export function trackListingContact(listingId: string, listingName: string): void {
  trackEvent('listing_contact', {
    item_id: listingId,
    item_name: listingName,
  });
}

// Track provider view
export function trackProviderView(providerId: string, providerName: string): void {
  trackEvent('provider_view', {
    provider_id: providerId,
    provider_name: providerName,
  });
}

// Track auth events (no PII)
export function trackLogin(roleCategory: string): void {
  trackEvent('login_success', {
    role_category: roleCategory,
  });
}

export function trackLogout(): void {
  trackEvent('logout');
}

export function trackSignup(): void {
  trackEvent('signup');
}

// Shop events
export function trackAddToCart(productId: string, productName: string, price?: number): void {
  trackEvent('add_to_cart', {
    item_id: productId,
    item_name: productName,
    value: price,
    currency: 'INR',
  });
}

// Send event to server for Measurement Protocol
async function sendServerEvent(eventName: string, params: EventParams): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('ga-event', {
      body: {
        event_name: eventName,
        params: sanitizeParams(params),
        client_id: getClientId(),
      },
    });

    if (error) {
      console.warn('Failed to send server event:', error.message);
    }
  } catch (err) {
    console.warn('Error sending server event:', err);
  }
}

// Get or generate client ID for GA
function getClientId(): string {
  const key = '_ga_client_id';
  let clientId = localStorage.getItem(key);
  
  if (!clientId) {
    clientId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, clientId);
  }
  
  return clientId;
}

// Sanitize params to remove PII
function sanitizeParams(params: EventParams): EventParams {
  const sanitized: EventParams = {};
  const piiFields = ['email', 'phone', 'name', 'address', 'ip'];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    
    // Skip PII fields
    const lowerKey = key.toLowerCase();
    if (piiFields.some(pii => lowerKey.includes(pii))) continue;
    
    sanitized[key] = value;
  }

  return sanitized;
}

// Hash user ID for privacy (if needed)
export async function hashUserId(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Export for use in components
export const analytics = {
  init: initAnalytics,
  loadSettings: loadAnalyticsSettings,
  pageView: trackPageView,
  event: trackEvent,
  booking: trackBooking,
  enquiry: trackEnquiry,
  listingView: trackListingView,
  listingContact: trackListingContact,
  providerView: trackProviderView,
  login: trackLogin,
  logout: trackLogout,
  signup: trackSignup,
  addToCart: trackAddToCart,
};
