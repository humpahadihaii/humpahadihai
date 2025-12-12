import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { 
  useShareSettings, 
  useUpdateShareSettings, 
  useShareAudit, 
  usePurgeSocialCache,
  useShareAnalytics,
  ShareSettings,
  PlatformTemplate,
  generateShareUrl
} from "@/hooks/useShareSettings";
import { 
  Save, Eye, Globe, MessageCircle, Mail, Twitter, Linkedin, Facebook, Instagram,
  RefreshCw, Copy, ExternalLink, History, BarChart3, Trash2, AlertCircle, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { key: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-500' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { key: 'email', label: 'Email', icon: Mail, color: 'text-orange-500' },
];

const TEMPLATE_TOKENS = [
  { token: '{{page.title}}', desc: 'Page or entity title' },
  { token: '{{page.excerpt}}', desc: 'Short description' },
  { token: '{{entity.name}}', desc: 'Entity name' },
  { token: '{{site.name}}', desc: 'Site name' },
  { token: '{{site.suffix}}', desc: 'Title suffix' },
  { token: '{{page.url}}', desc: 'Full page URL' },
];

export default function AdminSharePreviewPage() {
  const { data: settings, isLoading } = useShareSettings();
  const updateSettings = useUpdateShareSettings();
  const { data: auditHistory } = useShareAudit({ limit: 20 });
  const { data: analytics } = useShareAnalytics(30);
  const purgeMutation = usePurgeSocialCache();
  
  const [defaults, setDefaults] = useState<any>({});
  const [templates, setTemplates] = useState<Record<string, PlatformTemplate>>({});
  const [purgeUrl, setPurgeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('defaults');

  useEffect(() => {
    if (settings) {
      setDefaults(settings.defaults || {});
      setTemplates(settings.templates || {});
    }
  }, [settings]);

  const handleSaveDefaults = async () => {
    await updateSettings.mutateAsync({ key: 'defaults', value: defaults });
  };

  const handleSaveTemplates = async () => {
    await updateSettings.mutateAsync({ key: 'templates', value: templates });
  };

  const handlePurgeCache = async () => {
    if (!purgeUrl) {
      toast.error('Enter a URL to purge');
      return;
    }
    const result = await purgeMutation.mutateAsync(purgeUrl);
    if (result?.debugUrls) {
      toast.info('Open debug tools to verify preview', {
        action: {
          label: 'Open FB Debugger',
          onClick: () => window.open(result.debugUrls.facebook, '_blank')
        }
      });
    }
  };

  const copyTestUrl = (platform: string) => {
    const url = generateShareUrl(window.location.origin, platform);
    navigator.clipboard.writeText(url);
    toast.success('Test URL copied to clipboard');
  };

  const updateTemplate = (platform: string, field: keyof PlatformTemplate, value: any) => {
    setTemplates(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Link Preview & Share Templates</h1>
            <p className="text-muted-foreground">
              Configure how pages appear when shared on social media
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="defaults">Default Preview</TabsTrigger>
            <TabsTrigger value="templates">Platform Templates</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
            <TabsTrigger value="audit">Audit History</TabsTrigger>
            <TabsTrigger value="analytics">Share Analytics</TabsTrigger>
            <TabsTrigger value="tools">Cache & Tools</TabsTrigger>
          </TabsList>

          {/* Default Preview Tab */}
          <TabsContent value="defaults" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Site-Wide Defaults
                </CardTitle>
                <CardDescription>
                  These values are used when a page doesn't have custom share preview settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      value={defaults.site_name || ''}
                      onChange={(e) => setDefaults({ ...defaults, site_name: e.target.value })}
                      placeholder="Hum Pahadi Haii"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title Suffix</Label>
                    <Input
                      value={defaults.title_suffix || ''}
                      onChange={(e) => setDefaults({ ...defaults, title_suffix: e.target.value })}
                      placeholder=" | Hum Pahadi Haii"
                    />
                    <p className="text-xs text-muted-foreground">Appended to all page titles</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Description</Label>
                  <Textarea
                    value={defaults.default_description || ''}
                    onChange={(e) => setDefaults({ ...defaults, default_description: e.target.value })}
                    placeholder="Discover Uttarakhand's rich culture, traditions, and natural beauty..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 150-160 characters ({defaults.default_description?.length || 0}/160)</p>
                </div>

                <ImageUpload
                  label="Default OG Image (1200×630)"
                  id="default-og-image"
                  value={defaults.default_image_url || ''}
                  onChange={(url) => setDefaults({ ...defaults, default_image_url: url })}
                />
                <p className="text-xs text-muted-foreground -mt-2">
                  Recommended size: 1200×630 pixels for optimal display on all platforms
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Twitter Handle</Label>
                    <Input
                      value={defaults.twitter_site || ''}
                      onChange={(e) => setDefaults({ ...defaults, twitter_site: e.target.value })}
                      placeholder="@humpahadihaii"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Locale</Label>
                    <Select
                      value={defaults.locale || 'en_IN'}
                      onValueChange={(value) => setDefaults({ ...defaults, locale: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_IN">English (India)</SelectItem>
                        <SelectItem value="en_US">English (US)</SelectItem>
                        <SelectItem value="hi_IN">Hindi (India)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveDefaults} disabled={updateSettings.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Defaults
                </Button>
              </CardContent>
            </Card>

            {/* Template Tokens Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template Tokens Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-3">
                  {TEMPLATE_TOKENS.map(({ token, desc }) => (
                    <div key={token} className="flex items-center gap-2 text-sm">
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">{token}</code>
                      <span className="text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {PLATFORMS.map(({ key, label, icon: Icon, color }) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className={`h-5 w-5 ${color}`} />
                      {label}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${key}-enabled`} className="text-sm">Enabled</Label>
                      <Switch
                        id={`${key}-enabled`}
                        checked={templates[key]?.enabled ?? true}
                        onCheckedChange={(checked) => updateTemplate(key, 'enabled', checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title Template</Label>
                      <Input
                        value={templates[key]?.title_template || ''}
                        onChange={(e) => updateTemplate(key, 'title_template', e.target.value)}
                        placeholder="{{page.title}}{{site.suffix}}"
                        disabled={!templates[key]?.enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description Template</Label>
                      <Input
                        value={templates[key]?.description_template || ''}
                        onChange={(e) => updateTemplate(key, 'description_template', e.target.value)}
                        placeholder="{{page.excerpt}}"
                        disabled={!templates[key]?.enabled}
                      />
                    </div>
                  </div>
                  
                  {key === 'twitter' && (
                    <div className="space-y-2">
                      <Label>Card Type</Label>
                      <Select
                        value={templates[key]?.card_type || 'summary_large_image'}
                        onValueChange={(value) => updateTemplate(key, 'card_type', value)}
                        disabled={!templates[key]?.enabled}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Summary</SelectItem>
                          <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {key === 'instagram' && (
                    <div className="space-y-2">
                      <Label>Default Hashtags</Label>
                      <Input
                        value={(templates[key]?.hashtags || []).join(', ')}
                        onChange={(e) => updateTemplate(key, 'hashtags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="HumPahadiHaii, Uttarakhand, Pahadi"
                        disabled={!templates[key]?.enabled}
                      />
                    </div>
                  )}

                  {key === 'email' && (
                    <>
                      <div className="space-y-2">
                        <Label>Subject Template</Label>
                        <Input
                          value={templates[key]?.subject_template || ''}
                          onChange={(e) => updateTemplate(key, 'subject_template', e.target.value)}
                          placeholder="Check out: {{page.title}}"
                          disabled={!templates[key]?.enabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body Template</Label>
                        <Textarea
                          value={templates[key]?.body_template || ''}
                          onChange={(e) => updateTemplate(key, 'body_template', e.target.value)}
                          placeholder="I thought you'd find this interesting:\n\n{{page.title}}\n{{page.excerpt}}\n\n{{page.url}}"
                          rows={3}
                          disabled={!templates[key]?.enabled}
                        />
                      </div>
                    </>
                  )}

                  <ImageUpload
                    label={`${label} Custom Image (Optional)`}
                    id={`${key}-image`}
                    value={templates[key]?.image_url || ''}
                    onChange={(url) => updateTemplate(key, 'image_url', url)}
                  />
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleSaveTemplates} disabled={updateSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save All Templates
            </Button>
          </TabsContent>

          {/* Live Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Facebook Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Facebook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {defaults.default_image_url ? (
                      <img src={defaults.default_image_url} alt="Preview" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground uppercase">humpahadihaii.in</p>
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {defaults.site_name || 'Page Title'}{defaults.title_suffix || ''}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {defaults.default_description || 'Description...'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => copyTestUrl('facebook')}>
                    <Copy className="h-3 w-3 mr-1" /> Copy Test URL
                  </Button>
                </CardContent>
              </Card>

              {/* Twitter Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Twitter className="h-5 w-5 text-sky-500" />
                    X (Twitter)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl overflow-hidden bg-white">
                    {defaults.default_image_url ? (
                      <img src={defaults.default_image_url} alt="Preview" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {defaults.site_name || 'Page Title'}{defaults.title_suffix || ''}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {defaults.default_description || 'Description...'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">humpahadihaii.in</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => copyTestUrl('twitter')}>
                    <Copy className="h-3 w-3 mr-1" /> Copy Test URL
                  </Button>
                </CardContent>
              </Card>

              {/* WhatsApp Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#e5ddd5] p-2 rounded-lg">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                      {defaults.default_image_url ? (
                        <img src={defaults.default_image_url} alt="Preview" className="w-full h-28 object-cover" />
                      ) : (
                        <div className="w-full h-28 bg-muted flex items-center justify-center">
                          <Eye className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs text-green-700 font-medium">humpahadihaii.in</p>
                        <h3 className="font-semibold text-xs line-clamp-1">
                          {defaults.site_name || 'Page Title'}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {defaults.default_description || 'Description...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => copyTestUrl('whatsapp')}>
                    <Copy className="h-3 w-3 mr-1" /> Copy Test URL
                  </Button>
                </CardContent>
              </Card>

              {/* LinkedIn Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    LinkedIn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {defaults.default_image_url ? (
                      <img src={defaults.default_image_url} alt="Preview" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-2 border-t">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {defaults.site_name || 'Page Title'}{defaults.title_suffix || ''}
                      </h3>
                      <p className="text-xs text-muted-foreground">humpahadihaii.in</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => copyTestUrl('linkedin')}>
                    <Copy className="h-3 w-3 mr-1" /> Copy Test URL
                  </Button>
                </CardContent>
              </Card>

              {/* Instagram Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    Instagram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5 rounded-lg">
                    <div className="bg-white rounded-lg overflow-hidden">
                      {defaults.default_image_url ? (
                        <img src={defaults.default_image_url} alt="Preview" className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-muted flex items-center justify-center">
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-semibold">humpahadihaii</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {defaults.default_description || 'Description...'}
                        </p>
                        {templates.instagram?.hashtags?.length > 0 && (
                          <p className="text-xs text-blue-500 mt-1">
                            {templates.instagram.hashtags.map(h => `#${h}`).join(' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => copyTestUrl('instagram')}>
                    <Copy className="h-3 w-3 mr-1" /> Copy Test URL
                  </Button>
                </CardContent>
              </Card>

              {/* Email Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-orange-500" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white p-3">
                    <p className="text-xs text-muted-foreground">Subject:</p>
                    <p className="text-sm font-medium mb-2">
                      {templates.email?.subject_template?.replace('{{page.title}}', defaults.site_name || 'Page Title') || 'Check out this page'}
                    </p>
                    <p className="text-xs text-muted-foreground">Body:</p>
                    <p className="text-xs whitespace-pre-line">
                      {templates.email?.body_template?.replace('{{page.title}}', defaults.site_name || 'Page Title')
                        .replace('{{page.excerpt}}', defaults.default_description?.slice(0, 80) || 'Description...')
                        .replace('{{page.url}}', 'https://humpahadihaii.in/...')
                        || 'I thought you might find this interesting...'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => copyTestUrl('email')}>
                    <Copy className="h-3 w-3 mr-1" /> Copy Test URL
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit History Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Changes
                </CardTitle>
                <CardDescription>
                  Audit log of all share preview setting changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {!auditHistory?.length ? (
                    <p className="text-muted-foreground text-center py-8">No changes recorded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {auditHistory.map((entry) => (
                        <div key={entry.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={entry.change_type === 'create' ? 'default' : entry.change_type === 'delete' ? 'destructive' : 'secondary'}>
                                {entry.change_type}
                              </Badge>
                              <span className="font-medium">{entry.entity_type}</span>
                              {entry.entity_id && <span className="text-xs text-muted-foreground">#{entry.entity_id.slice(0, 8)}</span>}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Changed by: {entry.profiles?.full_name || entry.profiles?.email || 'Unknown'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Shares (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{analytics?.total || 0}</p>
                </CardContent>
              </Card>
              {PLATFORMS.slice(0, 3).map(({ key, label, icon: Icon, color }) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{analytics?.byPlatform?.[key] || 0}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Shared Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analytics?.topEntities?.length ? (
                  <p className="text-muted-foreground text-center py-8">No share data yet</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topEntities.map((entity: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <Badge variant="outline">{entity.entity_type}</Badge>
                          <span className="ml-2 text-sm">{entity.entity_id?.slice(0, 8)}...</span>
                        </div>
                        <span className="font-semibold">{entity.count} shares</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cache & Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Purge Social Media Cache
                </CardTitle>
                <CardDescription>
                  Force social platforms to re-fetch your page's preview data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://humpahadihaii.in/villages/example"
                    value={purgeUrl}
                    onChange={(e) => setPurgeUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handlePurgeCache} disabled={purgeMutation.isPending}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${purgeMutation.isPending ? 'animate-spin' : ''}`} />
                    Purge Cache
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <a 
                    href="https://developers.facebook.com/tools/debug/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Facebook Debugger</p>
                      <p className="text-xs text-muted-foreground">Test & refresh FB previews</p>
                    </div>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://cards-dev.twitter.com/validator" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-sky-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Twitter Card Validator</p>
                      <p className="text-xs text-muted-foreground">Test Twitter cards</p>
                    </div>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/post-inspector/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">LinkedIn Inspector</p>
                      <p className="text-xs text-muted-foreground">Test LinkedIn previews</p>
                    </div>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Platform Cache Notes
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Facebook:</strong> Use the debugger above and click "Scrape Again"</li>
                    <li>• <strong>Twitter:</strong> Cache refreshes automatically within ~7 days</li>
                    <li>• <strong>WhatsApp:</strong> Clear chat cache or share to a new chat</li>
                    <li>• <strong>LinkedIn:</strong> Use Post Inspector to force refresh</li>
                    <li>• <strong>Telegram:</strong> Cache persists; use a different URL or wait 24h</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
