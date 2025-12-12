import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";

export type DateRange = 'today' | '7d' | '30d' | '90d' | 'all';

interface ReferralData {
  ref_source: string;
  full_url: string;
  page_type: string;
  visited_at: string;
}

interface SourceBreakdown {
  source: string;
  count: number;
  percentage: number;
}

interface TrendData {
  date: string;
  count: number;
}

interface TopPage {
  url: string;
  page_type: string;
  count: number;
}

interface ShareAnalytics {
  totalReferrals: number;
  uniqueVisitors: number;
  sourceBreakdown: SourceBreakdown[];
  trendData: TrendData[];
  topPages: TopPage[];
  viralityScore: number;
}

const SOURCE_LABELS: Record<string, string> = {
  wa: 'WhatsApp',
  fb: 'Facebook',
  ig: 'Instagram',
  yt: 'YouTube',
  tw: 'X (Twitter)',
  ln: 'LinkedIn',
  email: 'Email',
  copy: 'Copy Link'
};

export function useShareAnalytics(dateRange: DateRange = '30d') {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ShareAnalytics>({
    totalReferrals: 0,
    uniqueVisitors: 0,
    sourceBreakdown: [],
    trendData: [],
    topPages: [],
    viralityScore: 0
  });

  const getDateFilter = useCallback(() => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return startOfDay(now).toISOString();
      case '7d':
        return subDays(now, 7).toISOString();
      case '30d':
        return subDays(now, 30).toISOString();
      case '90d':
        return subDays(now, 90).toISOString();
      case 'all':
        return null;
      default:
        return subDays(now, 30).toISOString();
    }
  }, [dateRange]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      
      let query = supabase
        .from('share_referrals')
        .select('*')
        .order('visited_at', { ascending: false });

      if (dateFilter) {
        query = query.gte('visited_at', dateFilter);
      }

      const { data: referrals, error } = await query;

      if (error) {
        console.error('Error fetching share analytics:', error);
        setLoading(false);
        return;
      }

      const referralData = (referrals || []) as ReferralData[];

      // Calculate unique visitors by IP hash
      const uniqueIPs = new Set(
        referralData
          .map(r => (r as any).ip_hash)
          .filter((hash): hash is string => !!hash && hash.trim() !== '')
      );

      // Source breakdown
      const sourceCountsMap: Record<string, number> = {};
      referralData.forEach(r => {
        sourceCountsMap[r.ref_source] = (sourceCountsMap[r.ref_source] || 0) + 1;
      });

      const totalReferrals = referralData.length;
      const sourceBreakdown: SourceBreakdown[] = Object.entries(sourceCountsMap)
        .map(([source, count]) => ({
          source: SOURCE_LABELS[source] || source,
          count,
          percentage: totalReferrals > 0 ? Math.round((count / totalReferrals) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Trend data (by day)
      const trendMap: Record<string, number> = {};
      referralData.forEach(r => {
        const day = format(new Date(r.visited_at), 'yyyy-MM-dd');
        trendMap[day] = (trendMap[day] || 0) + 1;
      });

      const trendData: TrendData[] = Object.entries(trendMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top pages
      const pageCountsMap: Record<string, { url: string; page_type: string; count: number }> = {};
      referralData.forEach(r => {
        const key = r.full_url;
        if (!pageCountsMap[key]) {
          pageCountsMap[key] = { url: r.full_url, page_type: r.page_type, count: 0 };
        }
        pageCountsMap[key].count++;
      });

      const topPages: TopPage[] = Object.values(pageCountsMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Fetch share click events for virality score
      const { data: shareEvents } = await supabase
        .from('internal_events')
        .select('*')
        .eq('event_name', 'share_click')
        .gte('created_at', dateFilter || '1970-01-01');

      const totalShares = shareEvents?.length || 0;
      const viralityScore = totalShares > 0 
        ? Math.round((uniqueIPs.size / totalShares) * 100) 
        : 0;

      setAnalytics({
        totalReferrals,
        uniqueVisitors: uniqueIPs.size,
        sourceBreakdown,
        trendData,
        topPages,
        viralityScore
      });

    } catch (error) {
      console.error('Error in share analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [getDateFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    loading,
    ...analytics,
    refetch: fetchAnalytics
  };
}

export function useShareSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('social_share_settings')
      .select('*')
      .single();

    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<any>) => {
    const { error } = await supabase
      .from('social_share_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('singleton_flag', true);

    if (!error) {
      await fetchSettings();
      return true;
    }
    return false;
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    loading,
    settings,
    updateSettings,
    refetch: fetchSettings
  };
}
