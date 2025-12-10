import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, format } from 'date-fns';

export type DateRange = 'today' | '7days' | '30days' | 'all';

interface TrafficOverview {
  totalVisits: number;
  uniqueVisitors: number;
  totalPageViews: number;
}

interface PagePerformance {
  page: string;
  count: number;
}

interface ReferrerData {
  referrer: string;
  count: number;
}

interface DeviceData {
  device: string;
  count: number;
}

interface BrowserData {
  browser: string;
  count: number;
}

interface DailyVisits {
  date: string;
  visits: number;
}

interface BookingSummaryData {
  total: number;
  byType: { type: string; count: number }[];
}

export function useInternalAnalytics(dateRange: DateRange) {
  const [loading, setLoading] = useState(true);
  const [trafficOverview, setTrafficOverview] = useState<TrafficOverview>({ totalVisits: 0, uniqueVisitors: 0, totalPageViews: 0 });
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([]);
  const [referrerData, setReferrerData] = useState<ReferrerData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [browserData, setBrowserData] = useState<BrowserData[]>([]);
  const [dailyVisits, setDailyVisits] = useState<DailyVisits[]>([]);
  const [bookingSummary, setBookingSummary] = useState<BookingSummaryData>({ total: 0, byType: [] });

  const getDateFilter = useCallback(() => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return startOfDay(now).toISOString();
      case '7days':
        return subDays(now, 7).toISOString();
      case '30days':
        return subDays(now, 30).toISOString();
      case 'all':
      default:
        return null;
    }
  }, [dateRange]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();

      // Fetch site visits
      let visitsQuery = supabase.from('site_visits').select('*');
      if (dateFilter) {
        visitsQuery = visitsQuery.gte('created_at', dateFilter);
      }
      const { data: visits } = await visitsQuery;

      // Calculate traffic overview
      const uniqueIPs = new Set(visits?.map(v => v.ip_hash) || []);
      setTrafficOverview({
        totalVisits: visits?.length || 0,
        uniqueVisitors: uniqueIPs.size,
        totalPageViews: visits?.length || 0
      });

      // Calculate referrer breakdown
      const referrerCounts: Record<string, number> = {};
      visits?.forEach(v => {
        const ref = v.referrer || 'direct';
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });
      setReferrerData(
        Object.entries(referrerCounts)
          .map(([referrer, count]) => ({ referrer, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Calculate device breakdown
      const deviceCounts: Record<string, number> = {};
      visits?.forEach(v => {
        const device = v.device || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      setDeviceData(
        Object.entries(deviceCounts)
          .map(([device, count]) => ({ device, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Calculate browser breakdown
      const browserCounts: Record<string, number> = {};
      visits?.forEach(v => {
        const browser = v.browser || 'unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });
      setBrowserData(
        Object.entries(browserCounts)
          .map(([browser, count]) => ({ browser, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Calculate daily visits for chart
      const dailyCounts: Record<string, number> = {};
      visits?.forEach(v => {
        const date = format(new Date(v.created_at), 'yyyy-MM-dd');
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });
      setDailyVisits(
        Object.entries(dailyCounts)
          .map(([date, visits]) => ({ date, visits }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30) // Last 30 days max
      );

      // Fetch page views
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('*')
        .order('count', { ascending: false })
        .limit(10);
      setPagePerformance(pageViews?.map(p => ({ page: p.page, count: p.count })) || []);

      // Fetch booking summary
      let bookingsQuery = supabase.from('bookings_summary').select('*');
      if (dateFilter) {
        bookingsQuery = bookingsQuery.gte('created_at', dateFilter);
      }
      const { data: bookings } = await bookingsQuery;

      const typeCounts: Record<string, number> = {};
      bookings?.forEach(b => {
        const type = b.booking_type || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      setBookingSummary({
        total: bookings?.length || 0,
        byType: Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [getDateFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    loading,
    trafficOverview,
    pagePerformance,
    referrerData,
    deviceData,
    browserData,
    dailyVisits,
    bookingSummary,
    refetch: fetchAnalytics
  };
}
