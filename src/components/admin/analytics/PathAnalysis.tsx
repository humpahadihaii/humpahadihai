import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, Route, LogIn, LogOut, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";

interface SessionPath {
  id: string;
  session_id: string;
  path_sequence: string[];
  entry_page: string;
  exit_page: string;
  page_count: number;
  duration_seconds: number;
  is_bounce: boolean;
  has_conversion: boolean;
  created_at: string;
}

export function PathAnalysis() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'converted' | 'bounced'>('all');

  // Fetch session paths
  const { data: paths, isLoading, refetch } = useQuery({
    queryKey: ['analytics-session-paths', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('analytics_session_paths' as any)
        .select('*')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(500)) as { data: SessionPath[] | null; error: any };

      if (error) throw error;
      return data || [];
    },
  });

  // Filter paths
  const filteredPaths = useMemo(() => {
    if (!paths) return [];
    switch (filterType) {
      case 'converted':
        return paths.filter(p => p.has_conversion);
      case 'bounced':
        return paths.filter(p => p.is_bounce);
      default:
        return paths;
    }
  }, [paths, filterType]);

  // Calculate path statistics
  const stats = useMemo(() => {
    if (!paths || paths.length === 0) return null;

    const totalSessions = paths.length;
    const bounces = paths.filter(p => p.is_bounce).length;
    const conversions = paths.filter(p => p.has_conversion).length;
    const avgDuration = paths.reduce((sum, p) => sum + p.duration_seconds, 0) / totalSessions;
    const avgPageCount = paths.reduce((sum, p) => sum + p.page_count, 0) / totalSessions;

    // Top entry pages
    const entryPages: Record<string, number> = {};
    paths.forEach(p => {
      entryPages[p.entry_page] = (entryPages[p.entry_page] || 0) + 1;
    });
    const topEntryPages = Object.entries(entryPages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Top exit pages
    const exitPages: Record<string, number> = {};
    paths.forEach(p => {
      exitPages[p.exit_page] = (exitPages[p.exit_page] || 0) + 1;
    });
    const topExitPages = Object.entries(exitPages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Common paths (full sequence)
    const pathCounts: Record<string, number> = {};
    paths.forEach(p => {
      const pathKey = p.path_sequence.slice(0, 4).join(' → ');
      pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1;
    });
    const commonPaths = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalSessions,
      bounceRate: (bounces / totalSessions) * 100,
      conversionRate: (conversions / totalSessions) * 100,
      avgDuration,
      avgPageCount,
      topEntryPages,
      topExitPages,
      commonPaths,
    };
  }, [paths]);

  // Run path extraction
  const runPathExtraction = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-worker?action=paths&date=${endDate}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to extract paths');
      await refetch();
      toast.success('Path extraction completed');
    } catch {
      toast.error('Failed to extract paths');
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Path Analysis</h2>
          <p className="text-sm text-muted-foreground">Understand how users navigate your site</p>
        </div>
        <Button variant="outline" onClick={runPathExtraction}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Extract Paths
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[150px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px]"
          />
        </div>
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.bounceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Bounce Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.avgPageCount.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Avg Pages/Session</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Entry Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Top Entry Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-2">
                {stats?.topEntryPages.map(([page, count], i) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1" title={page}>{page}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exit Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Top Exit Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-2">
                {stats?.topExitPages.map(([page, count], i) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1" title={page}>{page}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Paths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Route className="h-4 w-4" />
              Common Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-2 text-xs">
                {stats?.commonPaths.slice(0, 5).map(([path, count], i) => (
                  <div key={path} className="flex items-center justify-between gap-2">
                    <span className="truncate flex-1 text-muted-foreground" title={path}>{path}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Individual Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Showing {filteredPaths.length} sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredPaths.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No session data available</p>
              <p className="text-sm">Click "Extract Paths" to process session data</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredPaths.slice(0, 50).map(path => (
                <div key={path.id} className="p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={path.is_bounce ? 'destructive' : 'secondary'}>
                        {path.page_count} pages
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(path.duration_seconds)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {path.has_conversion ? (
                        <Badge className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Converted
                        </Badge>
                      ) : path.is_bounce ? (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Bounced
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-1 text-xs">
                    {path.path_sequence.slice(0, 6).map((page, i) => (
                      <span key={i} className="flex items-center">
                        <span className="bg-muted px-2 py-0.5 rounded truncate max-w-[150px]" title={page}>
                          {page}
                        </span>
                        {i < Math.min(path.path_sequence.length - 1, 5) && (
                          <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                        )}
                      </span>
                    ))}
                    {path.path_sequence.length > 6 && (
                      <span className="text-muted-foreground">+{path.path_sequence.length - 6} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}