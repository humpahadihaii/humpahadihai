import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Upload, Settings, Globe, Mail, Image } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import Papa from "papaparse";

const siteSettingsSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  primary_cta_text: z.string().min(1, "Primary CTA text is required"),
  primary_cta_url: z.string().min(1, "Primary CTA URL is required"),
  secondary_cta_text: z.string().min(1, "Secondary CTA text is required"),
  secondary_cta_url: z.string().min(1, "Secondary CTA URL is required"),
  hero_background_image: z.string().optional().nullable(),
  logo_image: z.string().optional().nullable(),
  meta_title: z.string().min(1, "Meta title is required"),
  meta_description: z.string().min(1, "Meta description is required"),
  instagram_url: z.string().optional().nullable(),
  youtube_url: z.string().optional().nullable(),
  facebook_url: z.string().optional().nullable(),
  twitter_url: z.string().optional().nullable(),
  email_contact: z.string().email().optional().nullable(),
  email_support: z.string().email().optional().nullable(),
  email_info: z.string().email().optional().nullable(),
  email_promotions: z.string().email().optional().nullable(),
  email_collabs: z.string().email().optional().nullable(),
  email_copyright: z.string().email().optional().nullable(),
  email_team: z.string().email().optional().nullable(),
  email_admin: z.string().email().optional().nullable(),
  email_post: z.string().email().optional().nullable(),
});

type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

export default function AdminSiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      site_name: "",
      tagline: "",
      primary_cta_text: "",
      primary_cta_url: "",
      secondary_cta_text: "",
      secondary_cta_url: "",
      hero_background_image: "",
      logo_image: "",
      meta_title: "",
      meta_description: "",
      instagram_url: "",
      youtube_url: "",
      facebook_url: "",
      twitter_url: "",
      email_contact: "",
      email_support: "",
      email_info: "",
      email_promotions: "",
      email_collabs: "",
      email_copyright: "",
      email_team: "",
      email_admin: "",
      email_post: "",
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_site_settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      toast.error("Failed to fetch site settings");
    } else if (data) {
      setSettingsId(data.id);
      form.reset({
        site_name: data.site_name || "",
        tagline: data.tagline || "",
        primary_cta_text: data.primary_cta_text || "",
        primary_cta_url: data.primary_cta_url || "",
        secondary_cta_text: data.secondary_cta_text || "",
        secondary_cta_url: data.secondary_cta_url || "",
        hero_background_image: data.hero_background_image || "",
        logo_image: data.logo_image || "",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        instagram_url: data.instagram_url || "",
        youtube_url: data.youtube_url || "",
        facebook_url: data.facebook_url || "",
        twitter_url: data.twitter_url || "",
        email_contact: data.email_contact || "",
        email_support: data.email_support || "",
        email_info: data.email_info || "",
        email_promotions: data.email_promotions || "",
        email_collabs: data.email_collabs || "",
        email_copyright: data.email_copyright || "",
        email_team: data.email_team || "",
        email_admin: data.email_admin || "",
        email_post: data.email_post || "",
      });
    }
    setLoading(false);
  };

  const onSubmit = async (data: SiteSettingsFormData) => {
    setSaving(true);
    
    const settingsData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (settingsId) {
      const { error } = await supabase
        .from("cms_site_settings")
        .update(settingsData)
        .eq("id", settingsId);

      if (error) {
        toast.error(`Failed to save: ${error.message}`);
      } else {
        toast.success("Site settings saved successfully");
      }
    } else {
      const { data: newData, error } = await supabase
        .from("cms_site_settings")
        .insert([settingsData])
        .select()
        .single();

      if (error) {
        toast.error(`Failed to save: ${error.message}`);
      } else {
        setSettingsId(newData.id);
        toast.success("Site settings created successfully");
      }
    }
    setSaving(false);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const row = results.data[0] as Record<string, string>;
        if (row) {
          form.reset({
            site_name: row.site_name || form.getValues("site_name"),
            tagline: row.tagline || form.getValues("tagline"),
            primary_cta_text: row.primary_cta_text || form.getValues("primary_cta_text"),
            primary_cta_url: row.primary_cta_url || form.getValues("primary_cta_url"),
            secondary_cta_text: row.secondary_cta_text || form.getValues("secondary_cta_text"),
            secondary_cta_url: row.secondary_cta_url || form.getValues("secondary_cta_url"),
            hero_background_image: row.hero_background_image || form.getValues("hero_background_image"),
            logo_image: row.logo_image || form.getValues("logo_image"),
            meta_title: row.meta_title || form.getValues("meta_title"),
            meta_description: row.meta_description || form.getValues("meta_description"),
            instagram_url: row.instagram_url || form.getValues("instagram_url"),
            youtube_url: row.youtube_url || form.getValues("youtube_url"),
            facebook_url: row.facebook_url || form.getValues("facebook_url"),
            twitter_url: row.twitter_url || form.getValues("twitter_url"),
            email_contact: row.email_contact || form.getValues("email_contact"),
            email_support: row.email_support || form.getValues("email_support"),
            email_info: row.email_info || form.getValues("email_info"),
            email_promotions: row.email_promotions || form.getValues("email_promotions"),
            email_collabs: row.email_collabs || form.getValues("email_collabs"),
            email_copyright: row.email_copyright || form.getValues("email_copyright"),
            email_team: row.email_team || form.getValues("email_team"),
            email_admin: row.email_admin || form.getValues("email_admin"),
            email_post: row.email_post || form.getValues("email_post"),
          });
          toast.success("CSV data imported - review and save");
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Site Settings</h1>
            <p className="text-muted-foreground">Manage global site configuration</p>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <Input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </span>
              </Button>
            </label>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Hero & Media
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Social Links
                </TabsTrigger>
                <TabsTrigger value="emails" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Emails
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic site information and SEO</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="site_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tagline *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primary_cta_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary CTA Text *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Explore Culture" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primary_cta_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary CTA URL *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="/culture" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="secondary_cta_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary CTA Text *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., View Gallery" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondary_cta_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary CTA URL *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="/gallery" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="meta_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meta_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description *</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hero">
                <Card>
                  <CardHeader>
                    <CardTitle>Hero & Media</CardTitle>
                    <CardDescription>Logo and hero background images</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="logo_image"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Site Logo"
                            value={field.value || ""}
                            onChange={field.onChange}
                            id="logo-image"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hero_background_image"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Hero Background Image"
                            value={field.value || ""}
                            onChange={field.onChange}
                            id="hero-bg-image"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Connect your social media profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="instagram_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="https://instagram.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="facebook_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="https://facebook.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="youtube_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="https://youtube.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twitter_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter/X URL</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="https://x.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emails">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Emails</CardTitle>
                    <CardDescription>Email addresses for different departments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="email_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>General Contact</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email_support"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email_info"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Information</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="email_promotions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promotions</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email_collabs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collaborations</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email_copyright"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Copyright</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="email_team"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email_admin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email_post"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Submissions</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
