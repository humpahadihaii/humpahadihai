import { supabase } from '@/integrations/supabase/client';

const TRACK_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track`;

interface TrackEventOptions {
  eventName: string;
  metadata?: Record<string, unknown>;
}

interface TrackBookingOptions {
  packageId?: string;
  listingId?: string;
  productId?: string;
  bookingType: string;
  url: string;
}

// Get UTM source from URL
function getUtmSource(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source') || params.get('source') || params.get('ref') || null;
  } catch {
    return null;
  }
}

// Track page view
export async function trackPageView(url?: string): Promise<void> {
  try {
    const payload = {
      url: url || window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      utmSource: getUtmSource()
    };

    await fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.debug('Track pageview failed:', error);
  }
}

// Track custom event
export async function trackInternalEvent(options: TrackEventOptions): Promise<void> {
  try {
    await fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      },
      body: JSON.stringify({
        eventName: options.eventName,
        metadata: options.metadata || {}
      })
    });
  } catch (error) {
    console.debug('Track event failed:', error);
  }
}

// Track booking for analytics summary
export async function trackBookingSummary(options: TrackBookingOptions): Promise<void> {
  try {
    const ua = navigator.userAgent.toLowerCase();
    let device = 'desktop';
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
      device = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
    }

    // Categorize referrer - check UTM first, then document.referrer
    const utmSource = getUtmSource();
    let referrer = 'direct';
    
    if (utmSource) {
      const utm = utmSource.toLowerCase();
      if (utm.includes('instagram') || utm === 'ig') referrer = 'instagram';
      else if (utm.includes('whatsapp') || utm === 'wa') referrer = 'whatsapp';
      else if (utm.includes('facebook') || utm === 'fb') referrer = 'facebook';
      else if (utm.includes('youtube') || utm === 'yt') referrer = 'youtube';
      else if (utm.includes('twitter') || utm === 'x') referrer = 'twitter';
      else if (utm.includes('google')) referrer = 'google';
      else referrer = 'other';
    } else {
      const ref = document.referrer.toLowerCase();
      if (ref.includes('instagram')) referrer = 'instagram';
      else if (ref.includes('whatsapp') || ref.includes('wa.me')) referrer = 'whatsapp';
      else if (ref.includes('facebook')) referrer = 'facebook';
      else if (ref.includes('youtube')) referrer = 'youtube';
      else if (ref.includes('twitter') || ref.includes('x.com')) referrer = 'twitter';
      else if (ref.includes('google')) referrer = 'google';
      else if (ref) referrer = 'other';
    }

    await supabase.from('bookings_summary').insert({
      package_id: options.packageId || null,
      listing_id: options.listingId || null,
      product_id: options.productId || null,
      booking_type: options.bookingType,
      url: options.url,
      device,
      referrer
    });
  } catch (error) {
    console.debug('Track booking summary failed:', error);
  }
}

// Initialize tracker - call once on app load
let isInitialized = false;

export function initInternalTracker(): void {
  if (isInitialized) return;
  isInitialized = true;
  
  // Track initial page load
  trackPageView();
}
