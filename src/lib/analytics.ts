/**
 * Privacy-First Analytics Client Library
 * 
 * Features:
 * - Session tracking with hp_session cookie
 * - Automatic page view tracking
 * - Click tracking for heatmaps
 * - Scroll depth tracking
 * - UTM parameter parsing
 * - Opt-out support
 */

import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SESSION_COOKIE = 'hp_session';
const OPT_OUT_COOKIE = 'hp_analytics_opt_out';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

interface AnalyticsEvent {
  event_type: string;
  page_path: string;
  page_title?: string;
  element_id?: string;
  element_class?: string;
  click_x?: number;
  click_y?: number;
  viewport_width?: number;
  viewport_height?: number;
  scroll_depth?: number;
  referrer?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

// Event queue for batching
let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL = 2000; // 2 seconds
const MAX_QUEUE_SIZE = 20;

// Check if analytics is opted out
export function isOptedOut(): boolean {
  if (typeof document === 'undefined') return true;
  return document.cookie.includes(OPT_OUT_COOKIE);
}

// Opt out of analytics
export function optOut(): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${OPT_OUT_COOKIE}=true; expires=${expires}; path=/; SameSite=Lax`;
}

// Opt back in to analytics
export function optIn(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${OPT_OUT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Get or create session ID
export function getSessionId(): string {
  if (typeof document === 'undefined') return '';
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  if (cookies[SESSION_COOKIE]) {
    // Refresh session expiry
    const expires = new Date(Date.now() + SESSION_DURATION).toUTCString();
    document.cookie = `${SESSION_COOKIE}=${cookies[SESSION_COOKIE]}; expires=${expires}; path=/; SameSite=Lax`;
    return cookies[SESSION_COOKIE];
  }

  // Create new session
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DURATION).toUTCString();
  document.cookie = `${SESSION_COOKIE}=${sessionId}; expires=${expires}; path=/; SameSite=Lax`;
  return sessionId;
}

// Queue an event for tracking
function queueEvent(event: AnalyticsEvent): void {
  if (isOptedOut()) return;

  eventQueue.push({
    ...event,
    session_id: getSessionId(),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    referrer: document.referrer,
  });

  // Flush immediately if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents();
  } else if (!flushTimeout) {
    // Schedule flush
    flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL);
  }
}

// Flush queued events to server
async function flushEvents(): Promise<void> {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = [];

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analytics-track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      console.warn('Analytics tracking failed:', response.status);
      // Re-queue events on failure (with limit)
      if (eventQueue.length < 50) {
        eventQueue.push(...events);
      }
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
}

// Track page view
export function trackPageView(path?: string, title?: string): void {
  if (typeof window === 'undefined') return;

  queueEvent({
    event_type: 'page_view',
    page_path: path || window.location.pathname,
    page_title: title || document.title,
  });
}

// Track custom event
export function trackEvent(
  eventType: string,
  pagePath?: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  queueEvent({
    event_type: eventType,
    page_path: pagePath || window.location.pathname,
    metadata,
  });
}

// Track click for heatmap
export function trackClick(event: MouseEvent): void {
  if (typeof window === 'undefined') return;

  const target = event.target as HTMLElement;
  queueEvent({
    event_type: 'click',
    page_path: window.location.pathname,
    element_id: target.id || undefined,
    element_class: target.className || undefined,
    click_x: event.pageX,
    click_y: event.pageY,
  });
}

// Track scroll depth
let maxScrollDepth = 0;
export function trackScrollDepth(): void {
  if (typeof window === 'undefined') return;

  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollTop = window.scrollY;
  const depth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

  if (depth > maxScrollDepth) {
    maxScrollDepth = depth;
  }
}

// Track booking/conversion
export function trackBooking(
  bookingType: 'package' | 'listing' | 'product',
  itemId: string,
  metadata?: Record<string, unknown>
): void {
  trackEvent('booking', window.location.pathname, {
    booking_type: bookingType,
    item_id: itemId,
    ...metadata,
  });
}

// Track inquiry
export function trackInquiry(
  inquiryType: string,
  itemId?: string,
  metadata?: Record<string, unknown>
): void {
  trackEvent('inquiry', window.location.pathname, {
    inquiry_type: inquiryType,
    item_id: itemId,
    ...metadata,
  });
}

// Initialize analytics
export function initAnalytics(): void {
  if (typeof window === 'undefined' || isOptedOut()) return;

  // Track initial page view
  trackPageView();

  // Track clicks for heatmap (throttled)
  let lastClick = 0;
  document.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClick > 100) { // Throttle to 100ms
      lastClick = now;
      trackClick(e);
    }
  });

  // Track scroll depth
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;
  window.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      trackScrollDepth();
    }, 150);
  });

  // Send scroll depth before page unload
  window.addEventListener('beforeunload', () => {
    if (maxScrollDepth > 0) {
      queueEvent({
        event_type: 'scroll_depth',
        page_path: window.location.pathname,
        scroll_depth: maxScrollDepth,
      });
      // Force sync flush
      if (eventQueue.length > 0) {
        navigator.sendBeacon(
          `${SUPABASE_URL}/functions/v1/analytics-track`,
          JSON.stringify({ events: eventQueue })
        );
      }
    }
  });

  // Flush on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}

// Get analytics summary (for admin dashboard)
export async function getAnalyticsSummary(
  startDate: string,
  endDate: string,
  pageSlug?: string
): Promise<{
  unique_total: number;
  unique_today: number;
  sessions: number;
  page_views: number;
  conversions: number;
  device_breakdown: Record<string, number>;
  top_pages: Array<{ page: string; unique_visitors: number }>;
  top_referrers: Array<{ referrer: string; count: number }>;
}> {
  const params = new URLSearchParams({
    start: startDate,
    end: endDate,
  });
  
  if (pageSlug) {
    params.set('page_slug', pageSlug);
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/analytics-track/summary?${params}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch analytics summary');
  }

  return response.json();
}

// Get heatmap data (for admin dashboard)
export async function getHeatmapData(
  pageSlug: string,
  date: string
): Promise<{
  buckets: Array<{
    bucket_x: number;
    bucket_y: number;
    click_count: number;
    element_id?: string;
  }>;
}> {
  const params = new URLSearchParams({
    page_slug: pageSlug,
    date,
  });

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/analytics-track/heatmap?${params}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch heatmap data');
  }

  return response.json();
}