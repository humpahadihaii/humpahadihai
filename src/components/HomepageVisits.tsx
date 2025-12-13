import { useEffect, useState, useRef } from "react";
import { Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const VISITOR_COOKIE = "hp_visitor_id";
const SESSION_COOKIE = "hp_session_id";
const DEVICE_COOKIE = "hp_device_id";
const COOKIE_EXPIRY_DAYS = 365;
const SESSION_EXPIRY_HOURS = 24;

interface HomepageVisitsProps {
  showToday?: boolean;
  className?: string;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function setSessionCookie(name: string, value: string, hours: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Generate a stable device fingerprint based on browser characteristics (no timestamp!)
function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    navigator.platform || "unknown",
  ];
  
  // Simple hash function for fingerprint - STABLE, no random/time component
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "d_" + Math.abs(hash).toString(36);
}

// Generate unique visitor ID (only called once, then stored in cookie)
function generateVisitorId(): string {
  return "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 15);
}

function generateSessionId(): string {
  return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 10);
}

// Animated counter component
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    startTime.current = null;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

// Loading skeleton
function CounterSkeleton() {
  return (
    <div className="flex items-center justify-center gap-4 animate-pulse">
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-4 bg-white/30 rounded" />
        <div className="h-4 w-20 bg-white/30 rounded" />
      </div>
      <div className="w-px h-4 bg-white/20" />
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-4 bg-white/30 rounded" />
        <div className="h-4 w-16 bg-white/30 rounded" />
      </div>
    </div>
  );
}

export function HomepageVisits({ showToday = true, className }: HomepageVisitsProps) {
  const [summary, setSummary] = useState<{ total: number; today: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const trackAndFetch = async () => {
      try {
        // Get or create visitor ID (persistent across sessions)
        let visitorId = getCookie(VISITOR_COOKIE);
        if (!visitorId) {
          visitorId = generateVisitorId();
          setCookie(VISITOR_COOKIE, visitorId, COOKIE_EXPIRY_DAYS);
        }

        // Get or create session ID (expires after 24 hours of inactivity)
        let sessionId = getCookie(SESSION_COOKIE);
        if (!sessionId) {
          sessionId = generateSessionId();
        }
        // Refresh session cookie on each visit
        setSessionCookie(SESSION_COOKIE, sessionId, SESSION_EXPIRY_HOURS);

        // Get or create device fingerprint (persistent)
        let deviceId = getCookie(DEVICE_COOKIE);
        if (!deviceId) {
          deviceId = generateDeviceFingerprint();
          setCookie(DEVICE_COOKIE, deviceId, COOKIE_EXPIRY_DAYS);
        }
        
        // Track visit with all identifiers
        const { data: trackData, error: trackError } = await supabase.functions.invoke(
          "homepage-track",
          {
            body: { 
              visitorId,
              sessionId,
              deviceId,
              screenResolution: `${screen.width}x${screen.height}`,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language,
            },
          }
        );

        if (!trackError && trackData?.visitorId) {
          // Update visitor ID if server provides one
          setCookie(VISITOR_COOKIE, trackData.visitorId, COOKIE_EXPIRY_DAYS);
        }

        // Fetch summary
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke(
          "homepage-summary"
        );

        if (summaryError) {
          console.error("Summary fetch error:", summaryError);
          setError(true);
        } else if (summaryData) {
          setSummary({
            total: summaryData.total || 0,
            today: summaryData.today || 0,
          });
          // Trigger fade-in animation after data loads
          setTimeout(() => setIsVisible(true), 100);
        }
      } catch (err) {
        console.error("Homepage visits error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    trackAndFetch();
  }, []);

  // Show skeleton while loading
  if (loading) {
    return (
      <div 
        className={cn(
          "px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20",
          className
        )}
        aria-label="Loading visitor count"
      >
        <CounterSkeleton />
      </div>
    );
  }

  const total = error ? null : (summary?.total ?? 0);
  const today = error ? null : (summary?.today ?? 0);

  return (
    <div 
      className={cn(
        "px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg",
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
      aria-label="Homepage visitor count"
      role="status"
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base text-white">
        {/* Total visitors */}
        <div className="flex items-center gap-1.5" title="Total visitors">
          <Users className="h-4 w-4 text-white/90" />
          <span className="font-medium">
            Visitors:{" "}
            <span className="tabular-nums">
              {total !== null ? <AnimatedCounter value={total} /> : "—"}
            </span>
          </span>
        </div>

        {/* Separator */}
        {showToday && (
          <>
            <span className="text-white/40">•</span>
            
            {/* Today's visitors */}
            <div className="flex items-center gap-1.5" title="Visitors today">
              <TrendingUp className="h-4 w-4 text-white/90" />
              <span className="font-medium">
                Today:{" "}
                <span className="tabular-nums">
                  {today !== null ? <AnimatedCounter value={today} duration={1200} /> : "—"}
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}