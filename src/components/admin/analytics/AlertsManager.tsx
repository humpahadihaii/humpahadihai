import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Plus, Trash2, Play, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface AlertConfig {
  id: string;
  name: string;
  description: string | null;
  metric: string;
  condition: string;
  threshold: number;
  comparison_period: string;
  page_filter: string | null;
  notification_channels: string[];
  recipient_emails: string[] | null;
  recipient_phones: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface AlertLog {
  id: string;
  alert_config_id: string;
  triggered_at: string;
  metric_value: number;
  threshold_value: number;
  comparison_value: number;
  notification_status: Record<string, string>;
  message: string;
  acknowledged_at: string | null;
}

export function AlertsManager() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metric: 'unique_visitors',
    condition: 'greater_than',
    threshold: 100,
    comparison_period: 'previous_day',
    page_filter: '',
    notification_channels: ['email'],
    recipient_emails: '',
    recipient_phones: ''
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alert-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_alert_configs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AlertConfig[];
    }
  });

  const { data: alertLogs } = useQuery({
    queryKey: ['alert-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_alert_logs')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as AlertLog[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('analytics_alert_configs').insert({
        name: data.name,
        description: data.description || null,
        metric: data.metric,
        condition: data.condition,
        threshold: data.threshold,
        comparison_period: data.comparison_period,
        page_filter: data.page_filter || null,
        notification_channels: data.notification_channels,
        recipient_emails: data.recipient_emails ? data.recipient_emails.split(',').map(e => e.trim()) : null,
        recipient_phones: data.recipient_phones ? data.recipient_phones.split(',').map(p => p.trim()) : null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-configs'] });
      setIsCreateOpen(false);
      toast.success('Alert created successfully');
      setFormData({
        name: '',
        description: '',
        metric: 'unique_visitors',
        condition: 'greater_than',
        threshold: 100,
        comparison_period: 'previous_day',
        page_filter: '',
        notification_channels: ['email'],
        recipient_emails: '',
        recipient_phones: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to create alert: ' + error.message);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('analytics_alert_configs')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-configs'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('analytics_alert_configs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-configs'] });
      toast.success('Alert deleted');
    }
  });

  const runAlertsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-alerts', {
        body: { action: 'check_alerts' }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alert-logs'] });
      toast.success(`Checked ${data.alerts_checked} alerts, ${data.alerts_triggered} triggered`);
    },
    onError: (error) => {
      toast.error('Failed to run alerts: ' + error.message);
    }
  });

  const getAlertName = (alertId: string) => {
    return alerts?.find(a => a.id === alertId)?.name || 'Unknown Alert';
  };

  if (isLoading) {
    return <div className="p-4">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Alert Configuration</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => runAlertsMutation.mutate()} disabled={runAlertsMutation.isPending}>
            <Play className="w-4 h-4 mr-2" />
            Run Alerts Now
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Alert Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Low traffic alert"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Metric</Label>
                    <Select value={formData.metric} onValueChange={(v) => setFormData({ ...formData, metric: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unique_visitors">Unique Visitors</SelectItem>
                        <SelectItem value="page_views">Page Views</SelectItem>
                        <SelectItem value="sessions">Sessions</SelectItem>
                        <SelectItem value="conversions">Conversions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="change_percent">Change % (±)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Threshold</Label>
                    <Input
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Compare To</Label>
                    <Select value={formData.comparison_period} onValueChange={(v) => setFormData({ ...formData, comparison_period: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="previous_day">Previous Day</SelectItem>
                        <SelectItem value="previous_week">Previous Week</SelectItem>
                        <SelectItem value="previous_month">Previous Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Page Filter (optional)</Label>
                  <Input
                    value={formData.page_filter}
                    onChange={(e) => setFormData({ ...formData, page_filter: e.target.value })}
                    placeholder="/villages/badrinath"
                  />
                </div>
                <div>
                  <Label>Recipient Emails (comma-separated)</Label>
                  <Input
                    value={formData.recipient_emails}
                    onChange={(e) => setFormData({ ...formData, recipient_emails: e.target.value })}
                    placeholder="admin@example.com, team@example.com"
                  />
                </div>
                <div>
                  <Label>Recipient Phones (comma-separated, for WhatsApp)</Label>
                  <Input
                    value={formData.recipient_phones}
                    onChange={(e) => setFormData({ ...formData, recipient_phones: e.target.value })}
                    placeholder="+919876543210"
                  />
                </div>
                <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending || !formData.name}>
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Configured Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configured Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts?.length === 0 ? (
            <p className="text-muted-foreground">No alerts configured yet.</p>
          ) : (
            <div className="space-y-4">
              {alerts?.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{alert.name}</span>
                      <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.metric} {alert.condition.replace('_', ' ')} {alert.threshold}
                      {alert.page_filter && ` on ${alert.page_filter}`}
                    </p>
                    <div className="flex gap-2">
                      {alert.notification_channels.map((ch) => (
                        <Badge key={ch} variant="outline">{ch}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: alert.id, is_active: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(alert.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alert History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertLogs?.length === 0 ? (
            <p className="text-muted-foreground">No alerts have been triggered yet.</p>
          ) : (
            <div className="space-y-2">
              {alertLogs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getAlertName(log.alert_config_id)}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.triggered_at), 'PPp')}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                    <div className="flex gap-2">
                      {Object.entries(log.notification_status || {}).map(([channel, status]) => (
                        <Badge key={channel} variant={status === 'sent' ? 'default' : 'destructive'}>
                          {channel}: {status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.acknowledged_at ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
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
