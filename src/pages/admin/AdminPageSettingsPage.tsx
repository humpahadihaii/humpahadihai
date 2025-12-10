import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface FAQItem {
  question: string;
  answer: string;
}

interface HeroBullet {
  icon?: string;
  text: string;
}

interface PageSetting {
  id?: string;
  page_key: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_bullets: HeroBullet[];
  hero_cta_label: string | null;
  hero_cta_link: string | null;
  intro_text: string | null;
  bottom_seo_text: string | null;
  custom_section_title: string | null;
  custom_section_description: string | null;
  custom_section_cta_label: string | null;
  custom_section_cta_link: string | null;
  faqs: FAQItem[];
  meta_title: string | null;
  meta_description: string | null;
}

const PAGE_CONFIGS = [
  { key: "marketplace", label: "Marketplace Page", description: "Tourism Marketplace (/marketplace)" },
  { key: "travel-packages", label: "Travel Packages Page", description: "Travel Packages (/travel-packages)" },
];

export default function AdminPageSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("marketplace");
  const [formData, setFormData] = useState<Partial<PageSetting>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_settings")
        .select("*")
        .order("page_key");
      if (error) throw error;
      return data.map(item => ({
        ...item,
        hero_bullets: Array.isArray(item.hero_bullets) 
          ? (item.hero_bullets as any[]).map(b => ({ icon: b?.icon, text: b?.text || '' }))
          : [],
        faqs: Array.isArray(item.faqs) 
          ? (item.faqs as any[]).map(f => ({ question: f?.question || '', answer: f?.answer || '' }))
          : [],
      })) as PageSetting[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PageSetting>) => {
      const existing = settings?.find(s => s.page_key === activeTab);
      const payload = {
        hero_title: data.hero_title || null,
        hero_subtitle: data.hero_subtitle || null,
        hero_image_url: data.hero_image_url || null,
        hero_bullets: data.hero_bullets || [],
        hero_cta_label: data.hero_cta_label || null,
        hero_cta_link: data.hero_cta_link || null,
        intro_text: data.intro_text || null,
        bottom_seo_text: data.bottom_seo_text || null,
        custom_section_title: data.custom_section_title || null,
        custom_section_description: data.custom_section_description || null,
        custom_section_cta_label: data.custom_section_cta_label || null,
        custom_section_cta_link: data.custom_section_cta_link || null,
        faqs: data.faqs || [],
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
      };
      
      if (existing?.id) {
        const { error } = await supabase
          .from("page_settings")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("page_settings")
          .insert({ page_key: activeTab, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-settings"] });
      queryClient.invalidateQueries({ queryKey: ["page-settings"] });
      toast.success("Page settings saved successfully!");
    },
    onError: (error) => {
      console.error("Error saving:", error);
      toast.error("Failed to save settings");
    },
  });

  useEffect(() => {
    const current = settings?.find(s => s.page_key === activeTab);
    if (current) {
      setFormData(current);
    } else {
      setFormData({ page_key: activeTab, hero_bullets: [], faqs: [] });
    }
  }, [activeTab, settings]);

  const addBullet = () => {
    setFormData(prev => ({
      ...prev,
      hero_bullets: [...(prev.hero_bullets || []), { text: "" }],
    }));
  };

  const updateBullet = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      hero_bullets: (prev.hero_bullets || []).map((b, i) => i === index ? { ...b, text } : b),
    }));
  };

  const removeBullet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hero_bullets: (prev.hero_bullets || []).filter((_, i) => i !== index),
    }));
  };

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: (prev.faqs || []).map((f, i) => i === index ? { ...f, [field]: value } : f),
    }));
  };

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Page Settings</h1>
        <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {PAGE_CONFIGS.map(page => (
            <TabsTrigger key={page.key} value={page.key}>{page.label}</TabsTrigger>
          ))}
        </TabsList>

        {PAGE_CONFIGS.map(page => (
          <TabsContent key={page.key} value={page.key} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Configure the hero section at the top of the page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={formData.hero_title || ""}
                      onChange={e => setFormData({ ...formData, hero_title: e.target.value })}
                      placeholder="Enter hero title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Image</Label>
                    <ImageUpload
                      value={formData.hero_image_url || ""}
                      onChange={url => setFormData({ ...formData, hero_image_url: url })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea
                    value={formData.hero_subtitle || ""}
                    onChange={e => setFormData({ ...formData, hero_subtitle: e.target.value })}
                    placeholder="Enter hero subtitle/description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Hero Bullets</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addBullet}>
                      <Plus className="h-4 w-4 mr-1" /> Add Bullet
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(formData.hero_bullets || []).map((bullet, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={bullet.text}
                          onChange={e => updateBullet(index, e.target.value)}
                          placeholder="Bullet point text"
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeBullet(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hero CTA Label</Label>
                    <Input
                      value={formData.hero_cta_label || ""}
                      onChange={e => setFormData({ ...formData, hero_cta_label: e.target.value })}
                      placeholder="e.g., Get Started"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero CTA Link</Label>
                    <Input
                      value={formData.hero_cta_link || ""}
                      onChange={e => setFormData({ ...formData, hero_cta_link: e.target.value })}
                      placeholder="e.g., /contact"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Request Section</CardTitle>
                <CardDescription>CTA section for custom travel requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={formData.custom_section_title || ""}
                    onChange={e => setFormData({ ...formData, custom_section_title: e.target.value })}
                    placeholder="e.g., Need Something Custom?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Description</Label>
                  <Textarea
                    value={formData.custom_section_description || ""}
                    onChange={e => setFormData({ ...formData, custom_section_description: e.target.value })}
                    placeholder="Description text"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Button Label</Label>
                    <Input
                      value={formData.custom_section_cta_label || ""}
                      onChange={e => setFormData({ ...formData, custom_section_cta_label: e.target.value })}
                      placeholder="e.g., Submit a Request"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Link</Label>
                    <Input
                      value={formData.custom_section_cta_link || ""}
                      onChange={e => setFormData({ ...formData, custom_section_cta_link: e.target.value })}
                      placeholder="e.g., /contact"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQ Section</CardTitle>
                <CardDescription>Frequently asked questions displayed on the page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
                    <Plus className="h-4 w-4 mr-1" /> Add FAQ
                  </Button>
                </div>
                <div className="space-y-4">
                  {(formData.faqs || []).map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <Label>Question {index + 1}</Label>
                          <Input
                            value={faq.question}
                            onChange={e => updateFAQ(index, "question", e.target.value)}
                            placeholder="Enter question"
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFAQ(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Answer</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={e => updateFAQ(index, "answer", e.target.value)}
                          placeholder="Enter answer"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  {(formData.faqs || []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No FAQs added yet. Click "Add FAQ" to add one.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Search engine optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={formData.meta_title || ""}
                    onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Page title for search engines"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={formData.meta_description || ""}
                    onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Page description for search engines (max 160 chars)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bottom SEO Text</Label>
                  <Textarea
                    value={formData.bottom_seo_text || ""}
                    onChange={e => setFormData({ ...formData, bottom_seo_text: e.target.value })}
                    placeholder="SEO-rich content block at the bottom of the page"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
}
