import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Trash2, Database, Clock, AlertTriangle, Settings } from "lucide-react";
import { format } from "date-fns";

interface AnalyticsSettings {
  id: string;
  analytics_enabled: boolean;
  anonymize_ip: boolean;
  raw_event_retention_days: number;
  aggregate_retention_days: number;
  enable_heatmaps: boolean;
  heatmap_sampling_rate: number;
  enable_click_tracking: boolean;
  enable_scroll_tracking: boolean;
  opt_out_cookie_name: string;
}

interface BigQueryExport {
  id: string;
  export_type: string;
  date_from: string;
  date_to: string;
  status: string;
  records_exported: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export function DataManagement() {
  const queryClient = useQueryClient();
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [purgeConfirm, setPurgeConfirm] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['analytics-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data as AnalyticsSettings;
    }
  });

  const { data: bigqueryExports } = useQuery({
    queryKey: ['bigquery-exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_bigquery_exports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as BigQueryExport[];
    }
  });

  const { data: dataCounts } = useQuery({
    queryKey: ['analytics-data-counts'],
    queryFn: async () => {
      const [events, visits, geo] = await Promise.all([
        supabase.from('analytics_events').select('id', { count: 'exact', head: true }),
        supabase.from('site_visits').select('id', { count: 'exact', head: true }),
        supabase.from('analytics_geo_aggregates').select('id', { count: 'exact', head: true })
      ]);
      return {
        events: events.count || 0,
        sessions: 0,
        visits: visits.count || 0,
        geo: geo.count || 0
      };
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<AnalyticsSettings>) => {
      const { error } = await supabase
        .from('analytics_settings')
        .update(updates)
        .eq('id', settings!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-settings'] });
      toast.success('Settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    }
  });

  const purgeMutation = useMutation({
    mutationFn: async (type: 'events' | 'sessions' | 'all') => {
      const retentionDays = settings?.raw_event_retention_days || 180;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      if (type === 'events' || type === 'all') {
        await supabase
          .from('analytics_events')
          .delete()
          .lt('created_at', cutoffDate.toISOString());
      }
      // Sessions cleanup handled by analytics worker
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-data-counts'] });
      setIsPurgeOpen(false);
      setPurgeConfirm('');
      toast.success('Data purged successfully');
    },
    onError: (error) => {
      toast.error('Failed to purge data: ' + error.message);
    }
  });

  const triggerBigQueryExport = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase.functions.invoke('analytics-export', {
        body: {
          action: 'export_to_bigquery',
          export_type: 'detailed',
          date_from: thirtyDaysAgo.toISOString().split('T')[0],
          date_to: today.toISOString().split('T')[0]
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bigquery-exports'] });
      if (data.success) {
        toast.success(`Exported ${data.records_exported} records to BigQuery`);
      } else {
        toast.info(data.message || 'Export queued');
      }
    },
    onError: (error) => {
      toast.error('BigQuery export failed: ' + error.message);
    }
  });

  if (isLoading) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Management & Privacy</h2>
      </div>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Configure privacy-first analytics settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics Enabled</Label>
              <p className="text-sm text-muted-foreground">Master switch for all analytics tracking</p>
            </div>
            <Switch
              checked={settings?.analytics_enabled}
              onCheckedChange={(checked) => updateSettingsMutation.mutate({ analytics_enabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Anonymize IP</Label>
              <p className="text-sm text-muted-foreground">Hash IP addresses before storing (recommended)</p>
            </div>
            <Switch
              checked={settings?.anonymize_ip}
              onCheckedChange={(checked) => updateSettingsMutation.mutate({ anonymize_ip: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Heatmaps Enabled</Label>
              <p className="text-sm text-muted-foreground">Capture click position data for heatmaps</p>
            </div>
            <Switch
              checked={settings?.enable_heatmaps}
              onCheckedChange={(checked) => updateSettingsMutation.mutate({ enable_heatmaps: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Click Tracking</Label>
              <p className="text-sm text-muted-foreground">Track element clicks for behavior analysis</p>
            </div>
            <Switch
              checked={settings?.enable_click_tracking}
              onCheckedChange={(checked) => updateSettingsMutation.mutate({ enable_click_tracking: checked })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heatmap Sampling Rate (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={settings?.heatmap_sampling_rate || 10}
                onChange={(e) => updateSettingsMutation.mutate({ heatmap_sampling_rate: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Lower = less data, better performance</p>
            </div>
            <div>
              <Label>Opt-out Cookie Name</Label>
              <Input
                value={settings?.opt_out_cookie_name || 'analytics_opt_out'}
                onChange={(e) => updateSettingsMutation.mutate({ opt_out_cookie_name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Users with this cookie are not tracked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retention Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Data Retention
          </CardTitle>
          <CardDescription>Configure how long data is retained</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Raw Event Retention (days)</Label>
              <Input
                type="number"
                min={30}
                max={730}
                value={settings?.raw_event_retention_days || 180}
                onChange={(e) => updateSettingsMutation.mutate({ raw_event_retention_days: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Default: 180 days (6 months)</p>
            </div>
            <div>
              <Label>Aggregate Retention (days)</Label>
              <Input
                type="number"
                min={365}
                max={1825}
                value={settings?.aggregate_retention_days || 730}
                onChange={(e) => updateSettingsMutation.mutate({ aggregate_retention_days: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Default: 730 days (2 years)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Storage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold">{dataCounts?.events.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold">{dataCounts?.sessions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold">{dataCounts?.visits.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Site Visits</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold">{dataCounts?.geo.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Geo Records</div>
            </div>
          </div>

          <div className="mt-4">
            <Dialog open={isPurgeOpen} onOpenChange={setIsPurgeOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Purge Old Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Purge Analytics Data
                  </DialogTitle>
                </DialogHeader>
                <Alert variant="destructive">
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This will permanently delete analytics data older than {settings?.raw_event_retention_days || 180} days.
                    This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  <div>
                    <Label>Type "PURGE" to confirm</Label>
                    <Input
                      value={purgeConfirm}
                      onChange={(e) => setPurgeConfirm(e.target.value)}
                      placeholder="PURGE"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPurgeOpen(false)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    disabled={purgeConfirm !== 'PURGE' || purgeMutation.isPending}
                    onClick={() => purgeMutation.mutate('all')}
                  >
                    Purge Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* BigQuery Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            BigQuery Integration
          </CardTitle>
          <CardDescription>Export analytics data to Google BigQuery for advanced analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Manual Export</p>
              <p className="text-sm text-muted-foreground">Export last 30 days of data to BigQuery</p>
            </div>
            <Button onClick={() => triggerBigQueryExport.mutate()} disabled={triggerBigQueryExport.isPending}>
              Export Now
            </Button>
          </div>

          {bigqueryExports && bigqueryExports.length > 0 && (
            <div className="mt-4">
              <Label>Recent Exports</Label>
              <div className="space-y-2 mt-2">
                {bigqueryExports.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{exp.export_type}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {exp.date_from} to {exp.date_to}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={exp.status === 'completed' ? 'default' : exp.status === 'failed' ? 'destructive' : 'secondary'}>
                        {exp.status}
                      </Badge>
                      {exp.records_exported && (
                        <span className="text-sm text-muted-foreground">{exp.records_exported} records</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
