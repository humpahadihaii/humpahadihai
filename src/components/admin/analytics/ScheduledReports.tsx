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
import { Calendar, Plus, Trash2, Play, Download, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

interface ScheduledReport {
  id: string;
  name: string;
  description: string | null;
  report_type: string;
  schedule: string;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  date_range: string;
  export_format: string;
  delivery_method: string;
  recipient_emails: string[] | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

interface ReportHistory {
  id: string;
  scheduled_report_id: string;
  executed_at: string;
  status: string;
  records_count: number | null;
  file_url: string | null;
  file_size: number | null;
  error_message: string | null;
  duration_ms: number | null;
}

export function ScheduledReports() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: 'summary',
    schedule: 'daily',
    day_of_week: 1,
    day_of_month: 1,
    time_of_day: '09:00',
    date_range: 'last_7_days',
    export_format: 'csv',
    delivery_method: 'email',
    recipient_emails: ''
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_scheduled_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ScheduledReport[];
    }
  });

  const { data: history } = useQuery({
    queryKey: ['report-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_report_history')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ReportHistory[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const nextRun = calculateNextRun(data.schedule, data.time_of_day, data.day_of_week, data.day_of_month);
      
      const { error } = await supabase.from('analytics_scheduled_reports').insert({
        name: data.name,
        description: data.description || null,
        report_type: data.report_type,
        schedule: data.schedule,
        day_of_week: data.schedule === 'weekly' ? data.day_of_week : null,
        day_of_month: data.schedule === 'monthly' ? data.day_of_month : null,
        time_of_day: data.time_of_day + ':00',
        date_range: data.date_range,
        export_format: data.export_format,
        delivery_method: data.delivery_method,
        recipient_emails: data.recipient_emails ? data.recipient_emails.split(',').map(e => e.trim()) : null,
        next_run_at: nextRun.toISOString()
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      setIsCreateOpen(false);
      toast.success('Report scheduled successfully');
    },
    onError: (error) => {
      toast.error('Failed to create report: ' + error.message);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('analytics_scheduled_reports')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('analytics_scheduled_reports')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Report deleted');
    }
  });

  const runNowMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const { data, error } = await supabase.functions.invoke('analytics-export', {
        body: { action: 'run_single_report', report_id: reportId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['report-history'] });
      toast.success(`Report executed: ${data.result?.status}`);
    },
    onError: (error) => {
      toast.error('Failed to run report: ' + error.message);
    }
  });

  const exportNowMutation = useMutation({
    mutationFn: async ({ exportType, dateRange }: { exportType: string; dateRange: string }) => {
      const today = new Date();
      const startDate = new Date(today);
      
      if (dateRange === 'last_7_days') startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === 'last_30_days') startDate.setDate(startDate.getDate() - 30);
      
      const { data, error } = await supabase.functions.invoke('analytics-export', {
        body: {
          action: 'export_data',
          export_type: exportType,
          date_from: startDate.toISOString().split('T')[0],
          date_to: today.toISOString().split('T')[0],
          format: 'csv'
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // If CSV was returned, download it
      if (typeof data === 'string') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
      toast.success('Export completed');
    },
    onError: (error) => {
      toast.error('Failed to export: ' + error.message);
    }
  });

  const getReportName = (reportId: string) => {
    return reports?.find(r => r.id === reportId)?.name || 'Unknown Report';
  };

  if (isLoading) {
    return <div className="p-4">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scheduled Reports & Exports</h2>
        <div className="flex gap-2">
          <Select onValueChange={(v) => exportNowMutation.mutate({ exportType: v, dateRange: 'last_7_days' })}>
            <SelectTrigger className="w-40">
              <Download className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Quick Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary Report</SelectItem>
              <SelectItem value="detailed">Detailed Events</SelectItem>
              <SelectItem value="geo">Geo Report</SelectItem>
              <SelectItem value="funnel">Funnel Report</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label>Report Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Weekly Traffic Summary"
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
                    <Label>Report Type</Label>
                    <Select value={formData.report_type} onValueChange={(v) => setFormData({ ...formData, report_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="geo">Geographic</SelectItem>
                        <SelectItem value="funnel">Funnels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Schedule</Label>
                    <Select value={formData.schedule} onValueChange={(v) => setFormData({ ...formData, schedule: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.schedule === 'weekly' && (
                  <div>
                    <Label>Day of Week</Label>
                    <Select value={String(formData.day_of_week)} onValueChange={(v) => setFormData({ ...formData, day_of_week: Number(v) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.schedule === 'monthly' && (
                  <div>
                    <Label>Day of Month</Label>
                    <Input
                      type="number"
                      min={1}
                      max={28}
                      value={formData.day_of_month}
                      onChange={(e) => setFormData({ ...formData, day_of_month: Number(e.target.value) })}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.time_of_day}
                      onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Date Range</Label>
                    <Select value={formData.date_range} onValueChange={(v) => setFormData({ ...formData, date_range: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Format</Label>
                    <Select value={formData.export_format} onValueChange={(v) => setFormData({ ...formData, export_format: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delivery</Label>
                    <Select value={formData.delivery_method} onValueChange={(v) => setFormData({ ...formData, delivery_method: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="storage">Cloud Storage</SelectItem>
                        <SelectItem value="bigquery">BigQuery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.delivery_method === 'email' && (
                  <div>
                    <Label>Recipient Emails (comma-separated)</Label>
                    <Input
                      value={formData.recipient_emails}
                      onChange={(e) => setFormData({ ...formData, recipient_emails: e.target.value })}
                      placeholder="admin@example.com"
                    />
                  </div>
                )}
                <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending || !formData.name}>
                  Schedule Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports?.length === 0 ? (
            <p className="text-muted-foreground">No reports scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {reports?.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{report.name}</span>
                      <Badge variant={report.is_active ? 'default' : 'secondary'}>
                        {report.is_active ? 'Active' : 'Paused'}
                      </Badge>
                      <Badge variant="outline">{report.schedule}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.report_type} report • {report.date_range.replace('_', ' ')} • {report.export_format.toUpperCase()}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {report.last_run_at && (
                        <span>Last run: {format(new Date(report.last_run_at), 'PPp')}</span>
                      )}
                      {report.next_run_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Next: {format(new Date(report.next_run_at), 'PPp')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runNowMutation.mutate(report.id)}
                      disabled={runNowMutation.isPending}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={report.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: report.id, is_active: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(report.id)}
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

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Execution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history?.length === 0 ? (
            <p className="text-muted-foreground">No reports have been executed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Report</th>
                    <th className="text-left p-2">Executed</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Records</th>
                    <th className="text-right p-2">Duration</th>
                    <th className="text-right p-2">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {history?.map((h) => (
                    <tr key={h.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{getReportName(h.scheduled_report_id)}</td>
                      <td className="p-2">{format(new Date(h.executed_at), 'PPp')}</td>
                      <td className="p-2">
                        <Badge variant={h.status === 'completed' ? 'default' : h.status === 'failed' ? 'destructive' : 'secondary'}>
                          {h.status}
                        </Badge>
                      </td>
                      <td className="text-right p-2">{h.records_count?.toLocaleString() || '-'}</td>
                      <td className="text-right p-2">{h.duration_ms ? `${h.duration_ms}ms` : '-'}</td>
                      <td className="text-right p-2">
                        {h.file_url && (
                          <a href={h.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 inline" />
                          </a>
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

function calculateNextRun(schedule: string, time: string, dayOfWeek: number, dayOfMonth: number): Date {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date(now);

  switch (schedule) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      const daysUntil = ((dayOfWeek - now.getDay() + 7) % 7) || 7;
      next.setDate(next.getDate() + daysUntil);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(dayOfMonth);
      break;
  }

  next.setHours(hours, minutes, 0, 0);
  return next;
}
