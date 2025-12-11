import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Save, Loader2 } from "lucide-react";

type ContentField = "introduction" | "history" | "traditions" | "festivals" | "foods" | "recipes" | "handicrafts" | "artisans" | "stories" | "travel_tips";

const CONTENT_SECTIONS: { key: ContentField; label: string; description: string }[] = [
  { key: "introduction", label: "Introduction", description: "Overview of the village, its location, and significance" },
  { key: "history", label: "History", description: "Historical background and important events" },
  { key: "traditions", label: "Local Traditions", description: "Customs, rituals, and cultural practices" },
  { key: "festivals", label: "Festivals", description: "Celebrations and festivals observed in the village" },
  { key: "foods", label: "Local Foods", description: "Traditional dishes and local cuisine" },
  { key: "recipes", label: "Traditional Recipes", description: "Authentic recipes passed down generations" },
  { key: "handicrafts", label: "Handicrafts", description: "Traditional crafts and artisan work" },
  { key: "artisans", label: "Local Artisans", description: "Famous craftspeople and their specialties" },
  { key: "stories", label: "Stories & Folklore", description: "Local legends, myths, and stories" },
  { key: "travel_tips", label: "Travel Tips", description: "How to reach, best time to visit, accommodation" },
];

const AdminVillageContentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<Record<ContentField, string>>({
    introduction: "",
    history: "",
    traditions: "",
    festivals: "",
    foods: "",
    recipes: "",
    handicrafts: "",
    artisans: "",
    stories: "",
    travel_tips: "",
  });
  const [generatingField, setGeneratingField] = useState<ContentField | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: village, isLoading } = useQuery({
    queryKey: ["admin-village-content", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("villages")
        .select("*, districts(name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (village) {
      setContent({
        introduction: village.introduction || "",
        history: village.history || "",
        traditions: village.traditions || "",
        festivals: village.festivals || "",
        foods: village.foods || "",
        recipes: village.recipes || "",
        handicrafts: village.handicrafts || "",
        artisans: village.artisans || "",
        stories: village.stories || "",
        travel_tips: village.travel_tips || "",
      });
    }
  }, [village]);

  const saveMutation = useMutation({
    mutationFn: async (data: Record<ContentField, string>) => {
      const { error } = await supabase
        .from("villages")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Village content saved successfully");
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["admin-village-content", id] });
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
    },
  });

  const handleFieldChange = (field: ContentField, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const generateContent = async (field: ContentField) => {
    if (!village) return;
    setGeneratingField(field);

    try {
      const section = CONTENT_SECTIONS.find((s) => s.key === field);
      const districtName = village.districts?.name || "Uttarakhand";

      const prompt = `Generate detailed content about "${section?.label}" for ${village.name} village in ${districtName} district, Uttarakhand, India.

Context: ${section?.description}

Requirements:
- Write 2-3 paragraphs of authentic, informative content
- Include specific details relevant to Uttarakhand/Pahadi culture
- Be accurate and respectful of local traditions
- Use engaging, descriptive language

Generate the content:`;

      const { data, error } = await supabase.functions.invoke("ai-content", {
        body: {
          type: "village",
          action: "generate_section",
          input: { prompt, section: field, villageName: village.name, districtName },
        },
      });

      if (error) throw error;

      const generatedText = data?.content || data?.text || "";
      if (generatedText) {
        handleFieldChange(field, generatedText);
        toast.success(`${section?.label} content generated`);
      } else {
        throw new Error("No content returned");
      }
    } catch (error: any) {
      toast.error("Generation failed: " + error.message);
    } finally {
      setGeneratingField(null);
    }
  };

  const generateAllContent = async () => {
    if (!village) return;
    
    for (const section of CONTENT_SECTIONS) {
      if (!content[section.key]) {
        await generateContent(section.key);
        await new Promise((r) => setTimeout(r, 1000)); // Rate limit
      }
    }
    toast.success("All empty sections generated!");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!village) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Village not found</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{village.name}</h1>
              <p className="text-muted-foreground">
                {village.districts?.name} District • Edit village content
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateAllContent}
              disabled={!!generatingField}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate All Empty
            </Button>
            <Button
              onClick={() => saveMutation.mutate(content)}
              disabled={!hasChanges || saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="introduction" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-2">
            {CONTENT_SECTIONS.slice(0, 5).map((section) => (
              <TabsTrigger key={section.key} value={section.key}>
                {section.label}
                {!content[section.key] && (
                  <span className="ml-1 text-xs text-destructive">●</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsList className="flex flex-wrap h-auto gap-2">
            {CONTENT_SECTIONS.slice(5).map((section) => (
              <TabsTrigger key={section.key} value={section.key}>
                {section.label}
                {!content[section.key] && (
                  <span className="ml-1 text-xs text-destructive">●</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {CONTENT_SECTIONS.map((section) => (
            <TabsContent key={section.key} value={section.key}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{section.label}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateContent(section.key)}
                      disabled={generatingField === section.key}
                    >
                      {generatingField === section.key ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      AI Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={section.key}>{section.label} Content</Label>
                    <Textarea
                      id={section.key}
                      value={content[section.key]}
                      onChange={(e) => handleFieldChange(section.key, e.target.value)}
                      placeholder={`Enter ${section.label.toLowerCase()} content...`}
                      className="min-h-[300px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminVillageContentPage;
