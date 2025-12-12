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
    staleTime: 60 * 1000,
  });
}

export function useHeatmapData(pageSlug: string, date: string) {
  return useQuery({
    queryKey: ['analytics-heatmap', pageSlug, date],
    queryFn: () => getHeatmapData(pageSlug, date),
    enabled: !!pageSlug && !!date,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDailyMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-daily', startDate, endDate],
    queryFn: async (): Promise<DailyMetric[]> => {
      // Get visits from site_visits table
      const { data: visitsData } = await supabase
        .from('site_visits')
        .select('created_at, ip_hash')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

      // Get page views from page_views table
      const { data: pageViewsData } = await supabase
        .from('page_views')
        .select('page, count, updated_at')
        .gte('updated_at', `${startDate}T00:00:00`)
        .lte('updated_at', `${endDate}T23:59:59`);

      // Get bookings for conversions
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('created_at')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

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

      // Count unique visitors and sessions from site_visits
      const uniqueByDate: Record<string, Set<string>> = {};
      (visitsData || []).forEach(row => {
        const dateStr = row.created_at.split('T')[0];
        if (metrics[dateStr]) {
          metrics[dateStr].sessions++;
          if (!uniqueByDate[dateStr]) {
            uniqueByDate[dateStr] = new Set();
          }
          uniqueByDate[dateStr].add(row.ip_hash);
        }
      });

      // Set unique visitors count
      Object.entries(uniqueByDate).forEach(([date, ips]) => {
        if (metrics[date]) {
          metrics[date].unique_visitors = ips.size;
        }
      });

      // Aggregate page views (sum of counts)
      const totalPageViews = (pageViewsData || []).reduce((acc, row) => acc + (row.count || 0), 0);
      // Distribute proportionally if we have visits
      const totalVisits = visitsData?.length || 1;
      Object.keys(metrics).forEach(date => {
        const dayVisits = metrics[date].sessions;
        metrics[date].page_views = Math.round((dayVisits / totalVisits) * totalPageViews);
      });

      // Count conversions
      (bookingsData || []).forEach(row => {
        const dateStr = row.created_at.split('T')[0];
        if (metrics[dateStr]) {
          metrics[dateStr].conversions++;
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
      const { data } = await supabase
        .from('page_views')
        .select('page, count')
        .order('count', { ascending: false })
        .limit(limit);

      return (data || []).map(row => ({
        page: row.page,
        unique_visitors: row.count || 0,
      }));
    },
    staleTime: 60 * 1000,
  });
}

export function useDeviceBreakdown(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-devices', startDate, endDate],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_visits')
        .select('device')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

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
      const { data } = await supabase
        .from('site_visits')
        .select('browser')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

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
      const { data } = await supabase
        .from('site_visits')
        .select('referrer')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

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