import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Key, 
  Sparkles, 
  Settings, 
  BarChart3, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Zap,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AIConfig {
  active_model: string;
  available_models: string[];
  api_enabled: boolean;
  rate_limit_per_minute: number;
  max_tokens_per_request: number;
}

interface UsageStats {
  today: { requests: number; tokens: number; cost: number };
  thisMonth: { requests: number; tokens: number; cost: number };
  total: { requests: number; tokens: number; cost: number };
}

const AdminAISettingsPage = () => {
  const { roles } = useAuth();
  const isSuperAdmin = roles.includes("super_admin");
  
  const [config, setConfig] = useState<AIConfig>({
    active_model: "gemini-2.5-flash",
    available_models: ["gemini-2.5-flash", "gemini-2.0-pro", "gemini-1.5-pro"],
    api_enabled: true,
    rate_limit_per_minute: 30,
    max_tokens_per_request: 8192,
  });
  const [usageStats, setUsageStats] = useState<UsageStats>({
    today: { requests: 0, tokens: 0, cost: 0 },
    thisMonth: { requests: 0, tokens: 0, cost: 0 },
    total: { requests: 0, tokens: 0, cost: 0 },
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchUsageStats();
    fetchRecentLogs();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_config")
        .select("*");

      if (error) throw error;

      if (data) {
        const configMap: Record<string, any> = {};
        data.forEach((row: any) => {
          try {
            configMap[row.setting_key] = typeof row.setting_value === 'string' 
              ? JSON.parse(row.setting_value) 
              : row.setting_value;
          } catch {
            configMap[row.setting_key] = row.setting_value;
          }
        });

        setConfig({
          active_model: configMap.active_model || "gemini-2.5-flash",
          available_models: configMap.available_models || ["gemini-2.5-flash", "gemini-2.0-pro", "gemini-1.5-pro"],
          api_enabled: configMap.api_enabled !== false,
          rate_limit_per_minute: configMap.rate_limit_per_minute || 30,
          max_tokens_per_request: configMap.max_tokens_per_request || 8192,
        });
      }
    } catch (error) {
      console.error("Error fetching AI config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Today's usage
      const { data: todayData } = await supabase
        .from("ai_usage_logs")
        .select("total_tokens, estimated_cost_usd")
        .gte("created_at", startOfDay)
        .eq("status", "success");

      // This month's usage
      const { data: monthData } = await supabase
        .from("ai_usage_logs")
        .select("total_tokens, estimated_cost_usd")
        .gte("created_at", startOfMonth)
        .eq("status", "success");

      // Total usage
      const { data: totalData } = await supabase
        .from("ai_usage_logs")
        .select("total_tokens, estimated_cost_usd")
        .eq("status", "success");

      const sumStats = (data: any[]) => ({
        requests: data?.length || 0,
        tokens: data?.reduce((sum, r) => sum + (r.total_tokens || 0), 0) || 0,
        cost: data?.reduce((sum, r) => sum + (parseFloat(r.estimated_cost_usd) || 0), 0) || 0,
      });

      setUsageStats({
        today: sumStats(todayData || []),
        thisMonth: sumStats(monthData || []),
        total: sumStats(totalData || []),
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const saveConfig = async (key: string, value: any) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can modify AI settings");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("ai_config")
        .upsert({
          setting_key: key,
          setting_value: JSON.stringify(value),
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: "setting_key" });

      if (error) throw error;
      toast.success("Settings updated");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleModelChange = async (model: string) => {
    setConfig({ ...config, active_model: model });
    await saveConfig("active_model", model);
  };

  const handleToggleAPI = async (enabled: boolean) => {
    setConfig({ ...config, api_enabled: enabled });
    await saveConfig("api_enabled", enabled);
  };

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI Settings & Usage
          </h1>
          <p className="text-muted-foreground">
            Configure Google Gemini AI and monitor usage
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage & Cost
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* API Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Status
                </CardTitle>
                <CardDescription>
                  Control AI generation availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Generation</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle to enable/disable all AI generation features
                    </p>
                  </div>
                  <Switch
                    checked={config.api_enabled}
                    onCheckedChange={handleToggleAPI}
                    disabled={!isSuperAdmin || isSaving}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {config.api_enabled ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-green-700">AI Generation is Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-700">AI Generation is Disabled</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Model Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Model Configuration
                </CardTitle>
                <CardDescription>
                  Select the Gemini model for content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Active Model</Label>
                  <Select 
                    value={config.active_model} 
                    onValueChange={handleModelChange}
                    disabled={!isSuperAdmin || isSaving}
                  >
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.available_models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    gemini-2.5-flash is recommended for balanced speed and quality
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium mb-2">Model Pricing (per 1M tokens):</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• gemini-2.5-flash: $0.075 input / $0.30 output</li>
                    <li>• gemini-2.0-pro: $1.25 input / $5.00 output</li>
                    <li>• gemini-1.5-pro: $1.25 input / $5.00 output</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* API Key Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Key
                </CardTitle>
                <CardDescription>
                  Gemini API key is stored securely in Lovable Cloud Secrets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium mb-2">Security Note:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>API key is stored in server-side secrets only</li>
                    <li>Never exposed to frontend or logs</li>
                    <li>To update, go to Lovable → Settings → Secrets</li>
                    <li>Add/update the <code className="bg-background px-1 rounded">GEMINI_API_KEY</code> secret</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-4">
            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(usageStats.today.requests)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(usageStats.today.tokens)} tokens
                  </p>
                  <p className="text-sm text-primary font-medium mt-1">
                    {formatCost(usageStats.today.cost)} estimated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(usageStats.thisMonth.requests)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(usageStats.thisMonth.tokens)} tokens
                  </p>
                  <p className="text-sm text-primary font-medium mt-1">
                    {formatCost(usageStats.thisMonth.cost)} estimated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    All Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(usageStats.total.requests)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(usageStats.total.tokens)} tokens
                  </p>
                  <p className="text-sm text-primary font-medium mt-1">
                    {formatCost(usageStats.total.cost)} estimated
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    All costs are estimates based on Google's published Gemini API pricing.
                    Actual charges may vary based on your Google Cloud billing.
                  </p>
                  <Button onClick={fetchUsageStats} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent AI Activity
                  </span>
                  <Button onClick={fetchRecentLogs} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {recentLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No AI activity yet</p>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={log.status === "success" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {log.status}
                            </Badge>
                            <span className="font-medium truncate">{log.action_type}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.user_email} • {log.model_used}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{formatNumber(log.total_tokens)} tokens</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!isSuperAdmin && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 text-sm text-yellow-700">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Only Super Admin can modify AI settings. You have view-only access.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAISettingsPage;
