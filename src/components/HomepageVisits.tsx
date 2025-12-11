import { useEffect, useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const COOKIE_NAME = "hp_visit_key";
const COOKIE_EXPIRY_DAYS = 365;

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

export function HomepageVisits() {
  const [summary, setSummary] = useState<{ total: number; today: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trackAndFetch = async () => {
      try {
        // Get or create visitor key from cookie
        let visitorKey = getCookie(COOKIE_NAME);
        
        // Track visit
        const { data: trackData, error: trackError } = await supabase.functions.invoke(
          "homepage-track",
          {
            body: { visitorKey },
          }
        );

        if (!trackError && trackData?.visitorKey) {
          // Save or update the visitor key cookie
          setCookie(COOKIE_NAME, trackData.visitorKey, COOKIE_EXPIRY_DAYS);
        }

        // Fetch summary
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke(
          "homepage-summary"
        );

        if (!summaryError && summaryData) {
          setSummary({
            total: summaryData.total || 0,
            today: summaryData.today || 0,
          });
        }
      } catch (error) {
        console.error("Homepage visits error:", error);
      } finally {
        setLoading(false);
      }
    };

    trackAndFetch();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  // Show even if summary is null/zero
  const total = summary?.total || 0;
  const today = summary?.today || 0;

  return (
    <div className="flex items-center justify-center gap-4 text-sm text-white/80">
      <div className="flex items-center gap-1.5" title="Total visitors">
        <Users className="h-4 w-4" />
        <span>{total.toLocaleString()} visitors</span>
      </div>
      <div className="w-px h-4 bg-white/40" />
      <div className="flex items-center gap-1.5" title="Visitors today">
        <TrendingUp className="h-4 w-4" />
        <span>{today.toLocaleString()} today</span>
      </div>
    </div>
  );
}