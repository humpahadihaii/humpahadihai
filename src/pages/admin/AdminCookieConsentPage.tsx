import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Cookie, Settings, BarChart3, RefreshCw, Save, AlertTriangle } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface ConsentSettings {
  id: string;
  banner_title: string;
  banner_description: string;
  categories: Record<string, {
    enabled: boolean;
    locked: boolean;
    title: string;
    description: string;
  }>;
  accept_all_text: string;
  reject_all_text: string;
  manage_text: string;
  save_text: string;
  privacy_policy_url: string;
  cookie_policy_url: string;
  consent_expiry_days: number;
  policy_version: number;
  force_reconsent: boolean;
  banner_position: string;
  theme: string;
}

interface ConsentStats {
  consent_date: string;
  accepted_all: number;
  rejected_all: number;
  customized: number;
  analytics_accepted: number;
  marketing_accepted: number;
  preferences_accepted: number;
}

export default function AdminCookieConsentPage() {
  const [settings, setSettings] = useState<ConsentSettings | null>(null);
  const [stats, setStats] = useState<ConsentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('cookie_consent_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      if (data) {
        setSettings({
          ...data,
          categories: data.categories as ConsentSettings['categories']
        } as ConsentSettings);
      }
    } catch (e) {
      console.error('Failed to fetch settings:', e);
      toast.error('Failed to load consent settings');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('cookie_consent_stats')
        .select('*')
        .gte('consent_date', thirtyDaysAgo)
        .order('consent_date', { ascending: false });
      
      if (error) throw error;
      setStats(data || []);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('cookie_consent_settings')
        .update({
          banner_title: settings.banner_title,
          banner_description: settings.banner_description,
          categories: settings.categories,
          accept_all_text: settings.accept_all_text,
          reject_all_text: settings.reject_all_text,
          manage_text: settings.manage_text,
          save_text: settings.save_text,
          privacy_policy_url: settings.privacy_policy_url,
          cookie_policy_url: settings.cookie_policy_url,
          consent_expiry_days: settings.consent_expiry_days,
          banner_position: settings.banner_position,
          theme: settings.theme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      
      if (error) throw error;
      toast.success('Consent settings saved');
    } catch (e) {
      console.error('Failed to save settings:', e);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function forceReconsent() {
    if (!settings) return;
    
    try {
      const { error } = await supabase
        .from('cookie_consent_settings')
        .update({
          policy_version: settings.policy_version + 1,
          force_reconsent: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      
      if (error) throw error;
      setSettings(prev => prev ? { 
        ...prev, 
        policy_version: prev.policy_version + 1,
        force_reconsent: true 
      } : null);
      toast.success('All visitors will be prompted to reconsent');
    } catch (e) {
      console.error('Failed to force reconsent:', e);
      toast.error('Failed to trigger reconsent');
    }
  }

  async function clearForceReconsent() {
    if (!settings) return;
    
    try {
      const { error } = await supabase
        .from('cookie_consent_settings')
        .update({
          force_reconsent: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      
      if (error) throw error;
      setSettings(prev => prev ? { ...prev, force_reconsent: false } : null);
      toast.success('Force reconsent cleared');
    } catch (e) {
      console.error('Failed to clear reconsent:', e);
    }
  }

  const updateCategory = (key: string, field: string, value: unknown) => {
    if (!settings) return;
    setSettings(prev => prev ? {
      ...prev,
      categories: {
        ...prev.categories,
        [key]: {
          ...prev.categories[key],
          [field]: value,
        }
      }
    } : null);
  };

  // Calculate totals
  const totalAcceptAll = stats.reduce((sum, s) => sum + (s.accepted_all || 0), 0);
  const totalRejectAll = stats.reduce((sum, s) => sum + (s.rejected_all || 0), 0);
  const totalCustomized = stats.reduce((sum, s) => sum + (s.customized || 0), 0);
  const totalResponses = totalAcceptAll + totalRejectAll + totalCustomized;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cookie className="h-6 w-6" />
              Cookie Consent Settings
            </h1>
            <p className="text-muted-foreground">
              Manage cookie consent banner and privacy preferences
            </p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {settings?.force_reconsent && (
          <div className="bg-warning/10 border border-warning rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">Force reconsent is active - all visitors will be prompted</span>
            </div>
            <Button variant="outline" size="sm" onClick={clearForceReconsent}>
              Clear Flag
            </Button>
          </div>
        )}

        <Tabs defaultValue="banner">
          <TabsList>
            <TabsTrigger value="banner">
              <Settings className="h-4 w-4 mr-2" />
              Banner Settings
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Cookie className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="banner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banner Content</CardTitle>
                <CardDescription>Customize the consent banner text and appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Banner Title</Label>
                    <Input
                      value={settings?.banner_title || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, banner_title: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={settings?.banner_position || 'bottom'}
                      onValueChange={(value) => setSettings(prev => prev ? { ...prev, banner_position: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Bottom Bar</SelectItem>
                        <SelectItem value="top">Top Bar</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left Card</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={settings?.banner_description || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, banner_description: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Accept All Button</Label>
                    <Input
                      value={settings?.accept_all_text || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, accept_all_text: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reject All Button</Label>
                    <Input
                      value={settings?.reject_all_text || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, reject_all_text: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manage Button</Label>
                    <Input
                      value={settings?.manage_text || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, manage_text: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Save Button</Label>
                    <Input
                      value={settings?.save_text || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, save_text: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Privacy Policy URL</Label>
                    <Input
                      value={settings?.privacy_policy_url || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, privacy_policy_url: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cookie Policy URL</Label>
                    <Input
                      value={settings?.cookie_policy_url || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, cookie_policy_url: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Consent Expiry (days)</Label>
                    <Input
                      type="number"
                      value={settings?.consent_expiry_days || 365}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, consent_expiry_days: parseInt(e.target.value) || 365 } : null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Force Reconsent</CardTitle>
                <CardDescription>Require all visitors to consent again (e.g., after policy update)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Current Policy Version: <strong>{settings?.policy_version}</strong></p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Incrementing the version will prompt all visitors to reconsent
                    </p>
                  </div>
                  <Button variant="destructive" onClick={forceReconsent}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Force Reconsent
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {settings?.categories && Object.entries(settings.categories).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{key} Cookies</CardTitle>
                    {!category.locked && (
                      <Switch
                        checked={category.enabled}
                        onCheckedChange={(checked) => updateCategory(key, 'enabled', checked)}
                      />
                    )}
                    {category.locked && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Always Enabled</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Display Title</Label>
                      <Input
                        value={category.title}
                        onChange={(e) => updateCategory(key, 'title', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={category.description}
                      onChange={(e) => updateCategory(key, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalResponses}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Accepted All</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{totalAcceptAll}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalResponses > 0 ? ((totalAcceptAll / totalResponses) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rejected All</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">{totalRejectAll}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalResponses > 0 ? ((totalRejectAll / totalResponses) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Customized</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{totalCustomized}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalResponses > 0 ? ((totalCustomized / totalResponses) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daily Consent Activity (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No consent data yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-right py-2">Accept All</th>
                          <th className="text-right py-2">Reject All</th>
                          <th className="text-right py-2">Customized</th>
                          <th className="text-right py-2">Analytics</th>
                          <th className="text-right py-2">Marketing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((stat) => (
                          <tr key={stat.consent_date} className="border-b">
                            <td className="py-2">{format(new Date(stat.consent_date), 'MMM dd, yyyy')}</td>
                            <td className="text-right text-green-600">{stat.accepted_all}</td>
                            <td className="text-right text-red-600">{stat.rejected_all}</td>
                            <td className="text-right text-blue-600">{stat.customized}</td>
                            <td className="text-right">{stat.analytics_accepted}</td>
                            <td className="text-right">{stat.marketing_accepted}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}