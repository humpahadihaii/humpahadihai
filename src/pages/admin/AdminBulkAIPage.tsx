import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileText,
  Layers,
  MapPin,
  AlertTriangle
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  district_name?: string;
  category_name?: string;
  has_overview?: boolean;
  has_history?: boolean;
}

interface BulkJob {
  id: string;
  status: string;
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  total_tokens_used: number;
  estimated_cost_usd: number;
  created_at: string;
}

const GENERATION_SECTIONS = [
  { value: "short_intro", label: "Overview / Short Introduction" },
  { value: "cultural_significance", label: "Cultural Significance" },
  { value: "origin_history", label: "History & Origin" },
  { value: "faqs", label: "FAQs (5 Questions)" },
  { value: "seo", label: "SEO Title & Description" },
];

export default function AdminBulkAIPage() {
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [filterDistrict, setFilterDistrict] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [targetSection, setTargetSection] = useState<string>("short_intro");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [processLog, setProcessLog] = useState<{ id: string; title: string; status: "success" | "failed" | "processing"; message?: string }[]>([]);
  
  const [recentJobs, setRecentJobs] = useState<BulkJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
    fetchRecentJobs();
  }, []);

  useEffect(() => {
    fetchContentItems();
  }, [filterDistrict, filterCategory]);

  const fetchFilters = async () => {
    try {
      const [districtsRes, categoriesRes] = await Promise.all([
        supabase.from("districts").select("id, name").eq("status", "published").order("name"),
        supabase.from("content_categories").select("id, name").eq("status", "published").order("name"),
      ]);

      if (districtsRes.data) setDistricts(districtsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContentItems = async () => {
    try {
      let query = supabase
        .from("cultural_content")
        .select(`
          id, 
          title, 
          short_intro,
          origin_history,
          districts!inner(name),
          content_categories!inner(name)
        `)
        .eq("status", "published")
        .order("title")
        .limit(200);

      if (filterDistrict !== "all") {
        query = query.eq("district_id", filterDistrict);
      }
      if (filterCategory !== "all") {
        query = query.eq("category_id", filterCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const items: ContentItem[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        district_name: item.districts?.name,
        category_name: item.content_categories?.name,
        has_overview: !!item.short_intro,
        has_history: !!item.origin_history,
      }));

      setContentItems(items);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content items");
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_bulk_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === contentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(contentItems.map((i) => i.id));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const startBulkGeneration = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    setSuccessCount(0);
    setFailedCount(0);
    setTotalTokens(0);
    setEstimatedCost(0);
    setProcessLog([]);

    const { data: { user } } = await supabase.auth.getUser();

    // Create bulk job record
    const { data: jobData, error: jobError } = await supabase
      .from("ai_bulk_jobs")
      .insert({
        user_id: user?.id,
        user_email: user?.email,
        job_type: "selected_items",
        target_section: targetSection,
        target_ids: selectedItems,
        total_items: selectedItems.length,
        status: "processing",
      })
      .select()
      .single();

    if (jobError) {
      toast.error("Failed to create bulk job");
      setIsProcessing(false);
      return;
    }

    const jobId = jobData.id;
    let successfulItems = 0;
    let failedItems = 0;
    let totalTokensUsed = 0;
    let totalCost = 0;
    const errorLog: any[] = [];

    for (let i = 0; i < selectedItems.length; i++) {
      const itemId = selectedItems[i];
      const item = contentItems.find((c) => c.id === itemId);
      
      if (!item) continue;

      setProcessLog((prev) => [
        ...prev,
        { id: itemId, title: item.title, status: "processing" },
      ]);

      try {
        // Fetch full item details
        const { data: fullItem } = await supabase
          .from("cultural_content")
          .select(`
            *,
            districts(name),
            content_categories(name)
          `)
          .eq("id", itemId)
          .single();

        if (!fullItem) throw new Error("Item not found");

        // Generate content
        const { data: aiResult, error: aiError } = await supabase.functions.invoke("ai-content", {
          body: {
            type: "cultural",
            action: `generate_${targetSection}`,
            inputs: {
              title: fullItem.title,
              districtName: fullItem.districts?.name || "Uttarakhand",
              category: fullItem.content_categories?.name || "Culture",
              subcategory: "",
            },
          },
        });

        if (aiError || aiResult?.error) {
          throw new Error(aiResult?.error || aiError?.message || "AI generation failed");
        }

        const content = aiResult.content;
        const usage = aiResult.usage;

        if (usage) {
          totalTokensUsed += usage.totalTokens || 0;
          totalCost += usage.estimatedCost || 0;
        }

        // Update content item with generated content (as draft)
        const updateData: Record<string, any> = {};
        
        if (targetSection === "short_intro") {
          updateData.short_intro = content;
        } else if (targetSection === "cultural_significance") {
          updateData.cultural_significance = content;
        } else if (targetSection === "origin_history") {
          updateData.origin_history = content;
        } else if (targetSection === "faqs") {
          try {
            updateData.faqs = JSON.parse(content);
          } catch {
            updateData.faqs = [{ question: "Generated content", answer: content }];
          }
        } else if (targetSection === "seo") {
          const seoTitle = content.match(/SEO_TITLE:\s*(.+)/i)?.[1]?.trim();
          const metaDesc = content.match(/META_DESCRIPTION:\s*(.+)/i)?.[1]?.trim();
          if (seoTitle) updateData.seo_title = seoTitle;
          if (metaDesc) updateData.seo_description = metaDesc;
        }

        await supabase
          .from("cultural_content")
          .update(updateData)
          .eq("id", itemId);

        successfulItems++;
        setSuccessCount(successfulItems);
        setProcessLog((prev) =>
          prev.map((p) => (p.id === itemId ? { ...p, status: "success" } : p))
        );

        // Rate limiting - wait 2 seconds between requests
        if (i < selectedItems.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        failedItems++;
        setFailedCount(failedItems);
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errorLog.push({ id: itemId, title: item.title, error: errorMsg });
        setProcessLog((prev) =>
          prev.map((p) => (p.id === itemId ? { ...p, status: "failed", message: errorMsg } : p))
        );
      }

      setProcessedCount(i + 1);
      setProgress(((i + 1) / selectedItems.length) * 100);
      setTotalTokens(totalTokensUsed);
      setEstimatedCost(totalCost);
    }

    // Update job record
    await supabase
      .from("ai_bulk_jobs")
      .update({
        status: "completed",
        processed_items: selectedItems.length,
        successful_items: successfulItems,
        failed_items: failedItems,
        total_tokens_used: totalTokensUsed,
        estimated_cost_usd: totalCost,
        error_log: errorLog,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    setIsProcessing(false);
    fetchRecentJobs();
    
    toast.success(
      `Bulk generation complete: ${successfulItems} successful, ${failedItems} failed`
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Bulk AI Generation
          </h1>
          <p className="text-muted-foreground">
            Generate content for multiple items at once using Gemini AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Filters & Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  Filter Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Districts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Generate Section</Label>
                    <Select value={targetSection} onValueChange={setTargetSection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENERATION_SECTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Select Content Items ({contentItems.length})
                  </span>
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedItems.length === contentItems.length ? "Deselect All" : "Select All"}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedItems.length} items selected for generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {contentItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No content items found. Try adjusting filters.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {contentItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            selectedItems.includes(item.id) ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.district_name} • {item.category_name}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {item.has_overview && (
                              <Badge variant="secondary" className="text-xs">Has Overview</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: Actions & Progress */}
          <div className="space-y-4">
            {/* Start Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={startBulkGeneration}
                  disabled={isProcessing || selectedItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Generation ({selectedItems.length} items)
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">
                      {processedCount} / {selectedItems.length} processed
                    </p>
                  </div>
                )}

                {(successCount > 0 || failedCount > 0) && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {successCount} successful
                    </div>
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      {failedCount} failed
                    </div>
                  </div>
                )}

                {totalTokens > 0 && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p>Tokens used: {totalTokens.toLocaleString()}</p>
                    <p>Estimated cost: ${estimatedCost.toFixed(4)}</p>
                  </div>
                )}

                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-2 text-yellow-600" />
                  <span className="text-yellow-700">
                    Generated content is saved directly. Review before publishing.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Process Log */}
            {processLog.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Process Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1 text-sm">
                      {processLog.map((log) => (
                        <div key={log.id} className="flex items-center gap-2 py-1">
                          {log.status === "processing" && (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          )}
                          {log.status === "success" && (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          )}
                          {log.status === "failed" && (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="truncate flex-1">{log.title}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  {recentJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No bulk jobs yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recentJobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="text-xs p-2 rounded bg-muted/50">
                          <div className="flex justify-between">
                            <Badge variant={job.status === "completed" ? "default" : "secondary"}>
                              {job.status}
                            </Badge>
                            <span>{job.successful_items}/{job.total_items}</span>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
