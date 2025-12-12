import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSharePreview, SiteSharePreview } from "@/hooks/useSharePreview";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Save, Eye, Globe, MessageCircle, Mail, Twitter, Linkedin, Facebook } from "lucide-react";
import { toast } from "sonner";

export default function AdminSharePreviewPage() {
  const { loading, settings, updateSettings } = useSiteSharePreview();
  const [form, setForm] = useState<Partial<SiteSharePreview>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(form);
    setSaving(false);
  };

  const updateTemplate = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      templates: {
        ...(prev.templates || {}),
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
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
              Configure how your pages appear when shared on social media
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="defaults" className="space-y-4">
          <TabsList>
            <TabsTrigger value="defaults">Default Preview</TabsTrigger>
            <TabsTrigger value="templates">Share Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

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
                <div className="space-y-2">
                  <Label>Default Title</Label>
                  <Input
                    value={form.default_title || ''}
                    onChange={(e) => setForm({ ...form, default_title: e.target.value })}
                    placeholder="Hum Pahadi Haii - Celebrating Uttarakhand's Culture"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
                </div>

                <ImageUpload
                  label="Default Preview Image"
                  id="default-share-image"
                  value={form.default_image_url || ''}
                  onChange={(url) => setForm({ ...form, default_image_url: url })}
                />
                <p className="text-xs text-muted-foreground -mt-2">Recommended: 1200x630 pixels for best display on social media</p>

                <div className="space-y-2">
                  <Label>Default Description</Label>
                  <Textarea
                    value={form.default_description || ''}
                    onChange={(e) => setForm({ ...form, default_description: e.target.value })}
                    placeholder="Discover Uttarakhand's rich culture..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>OG Type</Label>
                    <Select
                      value={form.og_type || 'website'}
                      onValueChange={(value) => setForm({ ...form, og_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="place">Place</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Twitter Card</Label>
                    <Select
                      value={form.twitter_card || 'summary_large_image'}
                      onValueChange={(value) => setForm({ ...form, twitter_card: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Twitter Handle</Label>
                    <Input
                      value={form.twitter_site || ''}
                      onChange={(e) => setForm({ ...form, twitter_site: e.target.value })}
                      placeholder="@humpahadihaii"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Share Message Templates
                </CardTitle>
                <CardDescription>
                  Customize the message for each platform. Use placeholders: {'{entity_title}'}, {'{entity_description}'}, {'{short_url}'}, {'{site_name}'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    WhatsApp Template
                  </Label>
                  <Textarea
                    value={form.templates?.whatsapp || ''}
                    onChange={(e) => updateTemplate('whatsapp', e.target.value)}
                    placeholder="Check out {entity_title} on Hum Pahadi Haii! {short_url}"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook Template
                  </Label>
                  <Textarea
                    value={form.templates?.facebook || ''}
                    onChange={(e) => updateTemplate('facebook', e.target.value)}
                    placeholder="{entity_title}"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" />
                    X (Twitter) Template
                  </Label>
                  <Textarea
                    value={form.templates?.twitter || ''}
                    onChange={(e) => updateTemplate('twitter', e.target.value)}
                    placeholder="{entity_title} - {short_url}"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn Template
                  </Label>
                  <Textarea
                    value={form.templates?.linkedin || ''}
                    onChange={(e) => updateTemplate('linkedin', e.target.value)}
                    placeholder="{entity_title} on Hum Pahadi Haii"
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-orange-500" />
                      Email Subject
                    </Label>
                    <Input
                      value={form.templates?.email_subject || ''}
                      onChange={(e) => updateTemplate('email_subject', e.target.value)}
                      placeholder="{entity_title} - Hum Pahadi Haii"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={form.templates?.email_body || ''}
                      onChange={(e) => updateTemplate('email_body', e.target.value)}
                      placeholder="I thought you might like this: {entity_title}&#10;&#10;{entity_description}&#10;&#10;View here: {short_url}"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Facebook Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Facebook Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {form.default_image_url ? (
                      <img
                        src={form.default_image_url}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-muted flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground uppercase">humpahadihaii.in</p>
                      <h3 className="font-semibold text-sm line-clamp-2">{form.default_title || 'Page Title'}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {form.default_description || 'Page description will appear here...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Twitter Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Twitter className="h-5 w-5 text-sky-500" />
                    X (Twitter) Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl overflow-hidden bg-white">
                    {form.default_image_url ? (
                      <img
                        src={form.default_image_url}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-muted flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2">{form.default_title || 'Page Title'}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {form.default_description || 'Page description will appear here...'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">humpahadihaii.in</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    WhatsApp Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#e5ddd5] p-3 rounded-lg">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm max-w-[280px]">
                      {form.default_image_url ? (
                        <img
                          src={form.default_image_url}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-muted flex items-center justify-center">
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs text-green-700 font-medium">humpahadihaii.in</p>
                        <h3 className="font-semibold text-sm line-clamp-2">{form.default_title || 'Page Title'}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {form.default_description || 'Page description...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* LinkedIn Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    LinkedIn Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {form.default_image_url ? (
                      <img
                        src={form.default_image_url}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-muted flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-3 border-t">
                      <h3 className="font-semibold text-sm line-clamp-2">{form.default_title || 'Page Title'}</h3>
                      <p className="text-xs text-muted-foreground">humpahadihaii.in</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}