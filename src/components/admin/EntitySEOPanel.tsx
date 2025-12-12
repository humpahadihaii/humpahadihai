import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PlatformPreviewSimulator } from "@/components/admin/PlatformPreviewSimulator";
import { AutoGenerateButton } from "@/components/admin/AutoGenerateButton";
import { 
  useEntityShareSettings, 
  useUpdateEntityShareSettings,
  useShareSettings,
  EntityShareSettings
} from "@/hooks/useShareSettings";
import { PLATFORM_LIMITS, calculatePreviewScore, Platform } from "@/lib/sharePreviewUtils";
import { 
  ChevronDown, Save, Globe, Facebook, Twitter, 
  MessageCircle, Linkedin, Instagram, AlertCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EntitySEOPanelProps {
  entityType: string;
  entityId: string | undefined;
  entityTitle?: string;
  entityDescription?: string;
  entityImage?: string;
  className?: string;
  defaultOpen?: boolean;
}

const PLATFORMS: { key: Platform; label: string; icon: typeof Facebook; color: string }[] = [
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { key: 'twitter', label: 'X/Twitter', icon: Twitter, color: 'text-sky-500' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
];

export function EntitySEOPanel({
  entityType,
  entityId,
  entityTitle = '',
  entityDescription = '',
  entityImage = '',
  className,
  defaultOpen = false
}: EntitySEOPanelProps) {
  const { data: globalSettings } = useShareSettings();
  const { data: entitySettings, isLoading } = useEntityShareSettings(entityType, entityId);
  const updateMutation = useUpdateEntityShareSettings();
  
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [form, setForm] = useState<Partial<EntityShareSettings>>({
    seo_title: '',
    seo_description: '',
    seo_image_url: '',
    share_templates: {}
  });
  const [useDefaults, setUseDefaults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (entitySettings) {
      setForm({
        seo_title: entitySettings.seo_title || '',
        seo_description: entitySettings.seo_description || '',
        seo_image_url: entitySettings.seo_image_url || '',
        seo_schema: entitySettings.seo_schema,
        share_templates: entitySettings.share_templates || {}
      });
    }
  }, [entitySettings]);

  const handleSave = async () => {
    if (!entityId) return;
    await updateMutation.mutateAsync({
      entityType,
      entityId,
      settings: form
    });
  };

  const handleAutoGenerate = (data: { title: string; description: string }) => {
    setForm(prev => ({
      ...prev,
      seo_title: data.title,
      seo_description: data.description
    }));
  };

  const getPreviewTitle = () => {
    return form.seo_title || entityTitle || 'Page Title';
  };

  const getPreviewDescription = () => {
    const desc = form.seo_description || entityDescription || '';
    return desc.slice(0, 160);
  };

  const getPreviewImage = () => {
    return form.seo_image_url || entityImage || globalSettings?.defaults?.default_image_url || '';
  };

  const titleLength = (form.seo_title || '').length;
  const descLength = (form.seo_description || '').length;
  
  const previewScore = calculatePreviewScore(
    form.seo_title || entityTitle || '',
    form.seo_description || entityDescription || '',
    form.seo_image_url || entityImage
  );

  if (!entityId) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO & Share Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Save the item first to configure SEO settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                SEO & Share Preview
                {previewScore.score >= 80 && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <Badge 
                  variant={previewScore.score >= 80 ? "default" : previewScore.score >= 50 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  Score: {previewScore.score}%
                </Badge>
              </CardTitle>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </div>
            <CardDescription>
              Customize how this page appears in search results and when shared
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {previewScore.issues.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Recommendations:</p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
                  {previewScore.issues.map((issue, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Tabs defaultValue="seo" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="seo">SEO Meta</TabsTrigger>
                <TabsTrigger value="social">Platform Overrides</TabsTrigger>
                <TabsTrigger value="preview">Live Preview</TabsTrigger>
              </TabsList>

              {/* SEO Meta Tab */}
              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>SEO Title</Label>
                    <span className={cn(
                      "text-xs",
                      titleLength > 60 ? "text-red-500" : titleLength > 50 ? "text-yellow-500" : "text-muted-foreground"
                    )}>
                      {titleLength}/60
                    </span>
                  </div>
                  <Input
                    value={form.seo_title || ''}
                    onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                    placeholder={entityTitle || 'Enter SEO title...'}
                  />
                  {!form.seo_title && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Will use "{entityTitle}" if left empty
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>SEO Description</Label>
                    <span className={cn(
                      "text-xs",
                      descLength > 160 ? "text-red-500" : descLength > 150 ? "text-yellow-500" : "text-muted-foreground"
                    )}>
                      {descLength}/160
                    </span>
                  </div>
                  <Textarea
                    value={form.seo_description || ''}
                    onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                    placeholder={entityDescription?.slice(0, 160) || 'Enter meta description...'}
                    rows={3}
                  />
                </div>

                <ImageUpload
                  label="OG Image (1200×630)"
                  id={`seo-image-${entityId}`}
                  value={form.seo_image_url || ''}
                  onChange={(url) => setForm({ ...form, seo_image_url: url })}
                />
                
                <div className="flex gap-2 pt-2">
                  <AutoGenerateButton
                    entityTitle={entityTitle || ''}
                    entityDescription={entityDescription || ''}
                    onGenerate={handleAutoGenerate}
                  />
                  <AutoGenerateButton
                    entityTitle={entityTitle || ''}
                    entityDescription={entityDescription || ''}
                    onGenerate={handleAutoGenerate}
                    useAI
                  />
                </div>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Override platform-specific templates. Character limits shown per platform.
                </p>
                
                {PLATFORMS.map(({ key, label, icon: Icon, color }) => {
                  const limits = PLATFORM_LIMITS[key];
                  return (
                    <div key={key} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", color)} />
                          {label}
                          <span className="text-xs text-muted-foreground">
                            (Title: {limits.title}, Desc: {limits.description})
                          </span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Use defaults</span>
                          <Switch
                            checked={useDefaults[key] ?? true}
                            onCheckedChange={(checked) => {
                              setUseDefaults({ ...useDefaults, [key]: checked });
                              if (checked) {
                                const newTemplates = { ...form.share_templates };
                                delete newTemplates[key];
                                setForm({ ...form, share_templates: newTemplates });
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {!useDefaults[key] && (
                        <div className="grid gap-2 pt-2">
                          <Input
                            placeholder="Custom title..."
                            value={form.share_templates?.[key]?.title_template || ''}
                            onChange={(e) => setForm({
                              ...form,
                              share_templates: {
                                ...form.share_templates,
                                [key]: { ...form.share_templates?.[key], title_template: e.target.value }
                              }
                            })}
                          />
                          <Input
                            placeholder="Custom description..."
                            value={form.share_templates?.[key]?.description_template || ''}
                            onChange={(e) => setForm({
                              ...form,
                              share_templates: {
                                ...form.share_templates,
                                [key]: { ...form.share_templates?.[key], description_template: e.target.value }
                              }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4 mt-4">
                {/* Google Search Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Google Search Result</Label>
                  <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                    <p className="text-sm text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                      {getPreviewTitle()}{globalSettings?.defaults?.title_suffix || ''}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">humpahadihaii.in › {entityType}s › ...</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {getPreviewDescription()}
                    </p>
                  </div>
                </div>

                {/* Platform Previews */}
                <PlatformPreviewSimulator
                  title={getPreviewTitle()}
                  description={getPreviewDescription()}
                  image={getPreviewImage()}
                  siteName={globalSettings?.defaults?.site_name}
                  titleSuffix={globalSettings?.defaults?.title_suffix}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={handleSave} disabled={updateMutation.isPending} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save SEO Settings'}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
