import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, format } from 'date-fns';

export type DateRange = 'today' | '7days' | '30days' | 'all';

interface AdminActivity {
  id: string;
  created_at: string;
  user_id: string;
  user_email: string;
  entity_type: string;
  entity_id: string;
  action: string;
  summary: string;
  metadata: Record<string, unknown> | null;
}

interface ImpersonationLog {
  id: string;
  super_admin_id: string;
  impersonated_user_id: string;
  started_at: string;
  ended_at: string | null;
  reason: string | null;
}

interface BackendStats {
  totalAdminActions: number;
  totalImpersonations: number;
  activeImpersonations: number;
  errorCount: number;
}

export function useBackendAnalytics(dateRange: DateRange) {
  const [loading, setLoading] = useState(true);
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([]);
  const [impersonationLogs, setImpersonationLogs] = useState<ImpersonationLog[]>([]);
  const [backendStats, setBackendStats] = useState<BackendStats>({
    totalAdminActions: 0,
    totalImpersonations: 0,
    activeImpersonations: 0,
    errorCount: 0,
  });
  const [activityByAction, setActivityByAction] = useState<{ action: string; count: number }[]>([]);
  const [activityByEntity, setActivityByEntity] = useState<{ entity: string; count: number }[]>([]);
  const [dailyActivity, setDailyActivity] = useState<{ date: string; count: number }[]>([]);

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

      // Fetch admin activities
      let activitiesQuery = supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (dateFilter) {
        activitiesQuery = activitiesQuery.gte('created_at', dateFilter);
      }
      
      const { data: activities } = await activitiesQuery;
      setAdminActivities((activities as AdminActivity[]) || []);

      // Fetch impersonation logs
      let impersonationsQuery = supabase
        .from('admin_impersonations')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (dateFilter) {
        impersonationsQuery = impersonationsQuery.gte('started_at', dateFilter);
      }
      
      const { data: impersonations } = await impersonationsQuery;
      setImpersonationLogs((impersonations as ImpersonationLog[]) || []);

      // Calculate stats
      const activeImps = impersonations?.filter(i => !i.ended_at) || [];
      
      setBackendStats({
        totalAdminActions: activities?.length || 0,
        totalImpersonations: impersonations?.length || 0,
        activeImpersonations: activeImps.length,
        errorCount: 0, // Would need error_logs table
      });

      // Activity by action type
      const actionCounts: Record<string, number> = {};
      activities?.forEach(a => {
        const action = a.action || 'unknown';
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });
      setActivityByAction(
        Object.entries(actionCounts)
          .map(([action, count]) => ({ action, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Activity by entity type
      const entityCounts: Record<string, number> = {};
      activities?.forEach(a => {
        const entity = a.entity_type || 'unknown';
        entityCounts[entity] = (entityCounts[entity] || 0) + 1;
      });
      setActivityByEntity(
        Object.entries(entityCounts)
          .map(([entity, count]) => ({ entity, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Daily activity chart
      const dailyCounts: Record<string, number> = {};
      activities?.forEach(a => {
        const date = format(new Date(a.created_at), 'yyyy-MM-dd');
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });
      setDailyActivity(
        Object.entries(dailyCounts)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30)
      );

    } catch (error) {
      console.error('Failed to fetch backend analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [getDateFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    loading,
    adminActivities,
    impersonationLogs,
    backendStats,
    activityByAction,
    activityByEntity,
    dailyActivity,
    refetch: fetchAnalytics,
  };
}
