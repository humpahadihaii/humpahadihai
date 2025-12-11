import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAnalyticsSummary, getHeatmapData } from "@/lib/analytics";

export interface AnalyticsSummary {
  unique_total: number;
  unique_today: number;
  sessions: number;
  page_views: number;
  conversions: number;
  device_breakdown: Record<string, number>;
  top_pages: Array<{ page: string; unique_visitors: number }>;
  top_referrers: Array<{ referrer: string; count: number }>;
  date_range: { start: string; end: string };
}

export interface DailyMetric {
  date: string;
  unique_visitors: number;
  sessions: number;
  page_views: number;
  conversions: number;
}

export function useAnalyticsSummary(startDate: string, endDate: string, pageSlug?: string) {
  return useQuery({
    queryKey: ['analytics-summary', startDate, endDate, pageSlug],
    queryFn: () => getAnalyticsSummary(startDate, endDate, pageSlug),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useHeatmapData(pageSlug: string, date: string) {
  return useQuery({
    queryKey: ['analytics-heatmap', pageSlug, date],
    queryFn: () => getHeatmapData(pageSlug, date),
    enabled: !!pageSlug && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDailyMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-daily', startDate, endDate],
    queryFn: async (): Promise<DailyMetric[]> => {
      // Get unique visits per day - use any type assertion for new tables
      const { data: uniqueData } = await (supabase
        .from('page_unique_visits' as any)
        .select('visit_date')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate)) as { data: any[] | null };

      // Get events per day
      const { data: eventsData } = await (supabase
        .from('analytics_events' as any)
        .select('event_type, created_at')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)) as { data: any[] | null };

      // Aggregate by date
      const metrics: Record<string, DailyMetric> = {};

      // Initialize dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        metrics[dateStr] = {
          date: dateStr,
          unique_visitors: 0,
          sessions: 0,
          page_views: 0,
          conversions: 0,
        };
      }

      // Count unique visitors
      (uniqueData || []).forEach(row => {
        const dateStr = row.visit_date;
        if (metrics[dateStr]) {
          metrics[dateStr].unique_visitors++;
        }
      });

      // Count events
      (eventsData || []).forEach(row => {
        const dateStr = row.created_at.split('T')[0];
        if (metrics[dateStr]) {
          if (row.event_type === 'page_view') {
            metrics[dateStr].page_views++;
          } else if (['booking', 'inquiry', 'purchase'].includes(row.event_type)) {
            metrics[dateStr].conversions++;
          }
        }
      });

      return Object.values(metrics).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 60 * 1000,
  });
}

export function useTopPages(startDate: string, endDate: string, limit = 10) {
  return useQuery({
    queryKey: ['analytics-top-pages', startDate, endDate, limit],
    queryFn: async () => {
      const { data } = await (supabase
        .from('page_unique_visits' as any)
        .select('page_slug')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate)) as { data: any[] | null };

      const counts: Record<string, number> = {};
      (data || []).forEach(row => {
        counts[row.page_slug] = (counts[row.page_slug] || 0) + 1;
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([page, count]) => ({ page, unique_visitors: count }));
    },
    staleTime: 60 * 1000,
  });
}

export function useDeviceBreakdown(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-devices', startDate, endDate],
    queryFn: async () => {
      const { data } = await (supabase
        .from('page_unique_visits' as any)
        .select('device')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate)) as { data: any[] | null };

      const counts: Record<string, number> = {};
      (data || []).forEach(row => {
        const device = row.device || 'unknown';
        counts[device] = (counts[device] || 0) + 1;
      });

      return counts;
    },
    staleTime: 60 * 1000,
  });
}

export function useBrowserBreakdown(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-browsers', startDate, endDate],
    queryFn: async () => {
      const { data } = await (supabase
        .from('page_unique_visits' as any)
        .select('browser')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate)) as { data: any[] | null };

      const counts: Record<string, number> = {};
      (data || []).forEach(row => {
        const browser = row.browser || 'unknown';
        counts[browser] = (counts[browser] || 0) + 1;
      });

      return counts;
    },
    staleTime: 60 * 1000,
  });
}

export function useReferrerBreakdown(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-referrers', startDate, endDate],
    queryFn: async () => {
      const { data } = await (supabase
        .from('page_unique_visits' as any)
        .select('referrer')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate)) as { data: any[] | null };

      const counts: Record<string, number> = {};
      (data || []).forEach(row => {
        const referrer = row.referrer || 'direct';
        counts[referrer] = (counts[referrer] || 0) + 1;
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([referrer, count]) => ({ referrer, count }));
    },
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsSettings() {
  return useQuery({
    queryKey: ['analytics-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}