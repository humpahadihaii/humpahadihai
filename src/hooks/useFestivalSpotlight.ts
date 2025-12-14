import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SpotlightFestival {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  month: string | null;
  start_month: number | null;
  end_month: number | null;
  is_spotlight: boolean;
  district: {
    id: string;
    name: string;
    slug: string;
  };
}

interface UseFestivalSpotlightOptions {
  districtId?: string;
  limit?: number;
}

export function useFestivalSpotlight(options: UseFestivalSpotlightOptions = {}) {
  const { districtId, limit = 3 } = options;
  const currentMonth = new Date().getMonth() + 1; // 1-12

  return useQuery({
    queryKey: ["festival-spotlight", districtId, currentMonth, limit],
    queryFn: async () => {
      // First, try to get festivals in the current month that are marked as spotlight
      let query = supabase
        .from("district_festivals")
        .select(`
          id, name, description, image_url, month, start_month, end_month, is_spotlight,
          district:districts(id, name, slug)
        `)
        .eq("is_active", true);

      if (districtId) {
        query = query.eq("district_id", districtId);
      }

      const { data: allFestivals, error } = await query;
      if (error) throw error;

      // Filter festivals that are currently active (in season) or marked as spotlight
      const activeFestivals = (allFestivals || []).filter((f: any) => {
        // If start_month and end_month are set, check if current month is within range
        if (f.start_month && f.end_month) {
          if (f.start_month <= f.end_month) {
            // Normal range (e.g., March to May)
            return currentMonth >= f.start_month && currentMonth <= f.end_month;
          } else {
            // Wrapping range (e.g., November to February)
            return currentMonth >= f.start_month || currentMonth <= f.end_month;
          }
        }
        // Fallback: check if month field matches current month name
        const monthNames = [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"
        ];
        if (f.month) {
          const monthLower = f.month.toLowerCase();
          return monthLower.includes(monthNames[currentMonth - 1]);
        }
        // If spotlight is marked, always include
        return f.is_spotlight;
      });

      // If we have active festivals, return them (prioritizing spotlight)
      if (activeFestivals.length > 0) {
        const sorted = activeFestivals.sort((a: any, b: any) => {
          // Spotlight festivals first
          if (a.is_spotlight && !b.is_spotlight) return -1;
          if (!a.is_spotlight && b.is_spotlight) return 1;
          return 0;
        });
        return sorted.slice(0, limit) as SpotlightFestival[];
      }

      // If no active festivals, get upcoming ones
      const upcomingFestivals = (allFestivals || []).filter((f: any) => {
        if (f.start_month) {
          return f.start_month > currentMonth;
        }
        return false;
      }).sort((a: any, b: any) => {
        return (a.start_month || 13) - (b.start_month || 13);
      });

      if (upcomingFestivals.length > 0) {
        return upcomingFestivals.slice(0, limit) as SpotlightFestival[];
      }

      // If still nothing, return spotlight-marked festivals or first few
      const fallback = (allFestivals || [])
        .filter((f: any) => f.is_spotlight || f.image_url)
        .slice(0, limit);
      
      return fallback as SpotlightFestival[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
