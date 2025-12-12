import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEntitySharePreview, useSiteSharePreview, EntitySharePreview } from "@/hooks/useSharePreview";
import { ChevronDown, Share2, Eye, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface SharePreviewPanelProps {
  entityType: string;
  entityId: string | null;
  entityTitle?: string;
  entityDescription?: string;
  entityImage?: string;
  className?: string;
}

export function SharePreviewPanel({
  entityType,
  entityId,
  entityTitle,
  entityDescription,
  entityImage,
  className,
}: SharePreviewPanelProps) {
  const { loading: siteLoading, settings: siteSettings } = useSiteSharePreview();
  const { loading, preview, savePreview, revertToDefault } = useEntitySharePreview(entityType, entityId);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<EntitySharePreview>>({
    use_default: true,
    title: '',
    description: '',
    image_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preview) {
      setForm({
        use_default: preview.use_default,
        title: preview.title || '',
        description: preview.description || '',
        image_url: preview.image_url || '',
        templates: preview.templates,
      });
    } else {
      setForm({
        use_default: true,
        title: '',
        description: '',
        image_url: '',
      });
    }
  }, [preview]);

  const handleSave = async () => {
    setSaving(true);
    await savePreview(form);
    setSaving(false);
  };

  const handleRevert = async () => {
    await revertToDefault();
  };

  const resolvedTitle = form.use_default 
    ? (entityTitle || siteSettings?.default_title || '')
    : (form.title || entityTitle || siteSettings?.default_title || '');

  const resolvedDescription = form.use_default
    ? (entityDescription || siteSettings?.default_description || '')
    : (form.description || entityDescription || siteSettings?.default_description || '');

  const resolvedImage = form.use_default
    ? (entityImage || siteSettings?.default_image_url || '')
    : (form.image_url || entityImage || siteSettings?.default_image_url || '');

  if (!entityId) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                <div>
                  <CardTitle className="text-base">Share Preview Settings</CardTitle>
                  <CardDescription className="text-xs">
                    Customize how this page appears when shared
                  </CardDescription>
                </div>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {(loading || siteLoading) ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Use Site Defaults</Label>
                    <p className="text-xs text-muted-foreground">
                      Inherit title, description, and image from entity or site defaults
                    </p>
                  </div>
                  <Switch
                    checked={form.use_default}
                    onCheckedChange={(checked) => setForm({ ...form, use_default: checked })}
                  />
                </div>

                {!form.use_default && (
                  <div className="space-y-4 border-l-2 border-primary/20 pl-4">
                    <div className="space-y-2">
                      <Label>Custom Title</Label>
                      <Input
                        value={form.title || ''}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder={entityTitle || 'Enter custom title...'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Description</Label>
                      <Textarea
                        value={form.description || ''}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder={entityDescription || 'Enter custom description...'}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Image URL</Label>
                      <Input
                        value={form.image_url || ''}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}

                {/* Mini Preview */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Label>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="flex">
                      {resolvedImage ? (
                        <img
                          src={resolvedImage}
                          alt="Preview"
                          className="w-24 h-24 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-muted flex items-center justify-center flex-shrink-0">
                          <Eye className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-2 min-w-0">
                        <p className="text-xs text-muted-foreground">humpahadihaii.in</p>
                        <h4 className="font-semibold text-sm line-clamp-1">{resolvedTitle}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{resolvedDescription}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  {preview && (
                    <Button variant="outline" onClick={handleRevert} size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Revert to Default
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}