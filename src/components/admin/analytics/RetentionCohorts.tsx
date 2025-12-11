import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RetentionCohort {
  id: string;
  cohort_date: string;
  cohort_size: number;
  retention_data: {
    day_1?: number;
    day_7?: number;
    day_14?: number;
    day_30?: number;
  };
}

function getRetentionColor(percent: number): string {
  if (percent >= 50) return 'bg-green-500';
  if (percent >= 30) return 'bg-green-400';
  if (percent >= 20) return 'bg-yellow-400';
  if (percent >= 10) return 'bg-orange-400';
  return 'bg-red-400';
}

export function RetentionCohorts() {
  // Fetch retention cohorts
  const { data: cohorts, isLoading, refetch } = useQuery({
    queryKey: ['analytics-retention-cohorts'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await (supabase
        .from('analytics_retention_cohorts' as any)
        .select('*')
        .gte('cohort_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('cohort_date', { ascending: false })
        .limit(30)) as { data: RetentionCohort[] | null; error: any };

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate aggregates
  const aggregates = useMemo(() => {
    if (!cohorts || cohorts.length === 0) return null;

    const totalUsers = cohorts.reduce((sum, c) => sum + c.cohort_size, 0);
    const avgDay1 = cohorts.reduce((sum, c) => sum + (c.retention_data?.day_1 || 0), 0) / cohorts.length;
    const avgDay7 = cohorts.reduce((sum, c) => sum + (c.retention_data?.day_7 || 0), 0) / cohorts.length;
    const avgDay30 = cohorts.reduce((sum, c) => sum + (c.retention_data?.day_30 || 0), 0) / cohorts.length;

    return { totalUsers, avgDay1, avgDay7, avgDay30 };
  }, [cohorts]);

  // Run retention calculation
  const runRetentionCalc = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-worker?action=retention`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to calculate retention');
      await refetch();
      toast.success('Retention cohorts calculated');
    } catch {
      toast.error('Failed to calculate retention');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Retention Cohorts</h2>
          <p className="text-sm text-muted-foreground">Track how users return over time</p>
        </div>
        <Button variant="outline" onClick={runRetentionCalc}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recalculate
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{aggregates?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day 1 Retention</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{aggregates?.avgDay1?.toFixed(1) || 0}%</div>
            )}
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day 7 Retention</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{aggregates?.avgDay7?.toFixed(1) || 0}%</div>
            )}
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day 30 Retention</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{aggregates?.avgDay30?.toFixed(1) || 0}%</div>
            )}
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Analysis</CardTitle>
          <CardDescription>
            Each row represents users who first visited on that date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : cohorts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No cohort data available</p>
              <p className="text-sm">Click "Recalculate" to generate retention data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Cohort Date</th>
                    <th className="text-center py-3 px-2 font-medium">Users</th>
                    <th className="text-center py-3 px-2 font-medium">Day 1</th>
                    <th className="text-center py-3 px-2 font-medium">Day 7</th>
                    <th className="text-center py-3 px-2 font-medium">Day 14</th>
                    <th className="text-center py-3 px-2 font-medium">Day 30</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts?.map(cohort => (
                    <tr key={cohort.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        {new Date(cohort.cohort_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="text-center py-3 px-2">
                        <Badge variant="outline">{cohort.cohort_size}</Badge>
                      </td>
                      <td className="text-center py-3 px-2">
                        {cohort.retention_data?.day_1 != null ? (
                          <span className={`inline-block px-2 py-1 rounded text-white text-xs ${getRetentionColor(cohort.retention_data.day_1)}`}>
                            {cohort.retention_data.day_1.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {cohort.retention_data?.day_7 != null ? (
                          <span className={`inline-block px-2 py-1 rounded text-white text-xs ${getRetentionColor(cohort.retention_data.day_7)}`}>
                            {cohort.retention_data.day_7.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {cohort.retention_data?.day_14 != null ? (
                          <span className={`inline-block px-2 py-1 rounded text-white text-xs ${getRetentionColor(cohort.retention_data.day_14)}`}>
                            {cohort.retention_data.day_14.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {cohort.retention_data?.day_30 != null ? (
                          <span className={`inline-block px-2 py-1 rounded text-white text-xs ${getRetentionColor(cohort.retention_data.day_30)}`}>
                            {cohort.retention_data.day_30.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}