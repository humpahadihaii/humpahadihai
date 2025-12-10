import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Search, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import AIVillageDescription from "@/components/admin/AIVillageDescription";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { villagesExcelConfig } from "@/lib/excelConfigs";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

const villageSchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().min(2, "Slug required"),
  district_id: z.string().min(1, "District required"),
  introduction: z.string().min(10, "Introduction required"),
  history: z.string().optional(),
  traditions: z.string().optional(),
  festivals: z.string().optional(),
  foods: z.string().optional(),
  handicrafts: z.string().optional(),
  population: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  thumbnail_url: z.string().optional(),
  status: z.enum(["draft", "review", "published"]),
});

type VillageFormData = z.infer<typeof villageSchema>;

interface Village {
  id: string;
  name: string;
  slug: string;
  district_id: string;
  introduction: string;
  history?: string | null;
  traditions?: string | null;
  festivals?: string | null;
  foods?: string | null;
  handicrafts?: string | null;
  population?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  thumbnail_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  districts?: { name: string };
}

interface District {
  id: string;
  name: string;
}

export default function AdminVillagesPage() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedDistrictForAI, setSelectedDistrictForAI] = useState<string>("");
  const [importOpen, setImportOpen] = useState(false);
  const excel = useExcelOperations(villagesExcelConfig);
  const { logCreate, logUpdate, logDelete } = useAdminActivityLogger();

  const form = useForm<VillageFormData>({
    resolver: zodResolver(villageSchema),
    defaultValues: {
      name: "",
      slug: "",
      district_id: "",
      introduction: "",
      history: "",
      traditions: "",
      festivals: "",
      foods: "",
      handicrafts: "",
      population: "",
      latitude: "",
      longitude: "",
      thumbnail_url: "",
      status: "draft",
    },
  });

  useEffect(() => {
    fetchDistricts();
    fetchVillages();
  }, []);

  const fetchDistricts = async () => {
    const { data } = await supabase
      .from("districts")
      .select("id, name")
      .order("name");
    if (data) setDistricts(data);
  };

  const fetchVillages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("villages")
      .select("*, districts(name)")
      .order("name");

    if (error) {
      toast.error("Failed to fetch villages");
    } else {
      setVillages(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: VillageFormData) => {
    const villageData: any = {
      ...data,
      population: data.population ? parseInt(data.population) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    };

    if (editingVillage) {
      const { error } = await supabase
        .from("villages")
        .update(villageData)
        .eq("id", editingVillage.id);

      if (error) {
        toast.error("Failed to update village");
      } else {
        toast.success("Village updated successfully");
        logUpdate("village", editingVillage.id, data.name);
        fetchVillages();
        setDialogOpen(false);
        setEditingVillage(null);
        form.reset();
      }
    } else {
      const { data: insertedData, error } = await supabase.from("villages").insert(villageData).select().single();

      if (error) {
        toast.error("Failed to create village");
      } else {
        toast.success("Village created successfully");
        if (insertedData) logCreate("village", insertedData.id, data.name);
        fetchVillages();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (village: Village) => {
    setEditingVillage(village);
    form.reset({
      name: village.name,
      slug: village.slug,
      district_id: village.district_id,
      introduction: village.introduction,
      history: village.history || "",
      traditions: village.traditions || "",
      festivals: village.festivals || "",
      foods: village.foods || "",
      handicrafts: village.handicrafts || "",
      population: village.population?.toString() || "",
      latitude: village.latitude?.toString() || "",
      longitude: village.longitude?.toString() || "",
      thumbnail_url: village.thumbnail_url || "",
      status: (village.status as "draft" | "review" | "published") || "draft",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const village = villages.find(v => v.id === id);
    const { error } = await supabase.from("villages").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete village");
    } else {
      toast.success("Village deleted");
      logDelete("village", id, village?.name);
      fetchVillages();
    }
  };

  const handleAISuggest = async () => {
    if (!selectedDistrictForAI) return;
    
    const district = districts.find(d => d.id === selectedDistrictForAI);
    if (!district) return;
    
    setAiGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to use AI features");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: "villages",
          districtName: district.name,
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const result = await response.json();
      const villagesData = result.villages || [];

      if (villagesData.length === 0) {
        toast.error("No villages generated. Please try again.");
        return;
      }

      // Insert generated villages
      let insertedCount = 0;
      for (const v of villagesData) {
        const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const { error } = await supabase.from("villages").insert({
          name: v.name,
          slug,
          district_id: selectedDistrictForAI,
          introduction: v.description || `A village in ${district.name} district.`,
          status: "draft",
        });
        if (!error) insertedCount++;
      }

      toast.success(`Added ${insertedCount} villages to ${district.name}. Please review and edit.`);
      setAiDialogOpen(false);
      setSelectedDistrictForAI("");
      fetchVillages();
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate villages. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredVillages = villages.filter((village) => {
    const matchesSearch = village.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === "all" || village.district_id === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Villages Management</h1>
            <p className="text-muted-foreground">Manage villages across all districts</p>
          </div>
          <div className="flex gap-2">
            <ExcelImportExportButtons
              onExport={() => excel.exportToExcel(filteredVillages)}
              onImportClick={() => setImportOpen(true)}
              exporting={excel.exporting}
              importing={excel.importing}
            />
            {/* AI Suggest Button */}
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI: Suggest Villages
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Village Suggestions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      AI-generated data requires review. Please verify village names and descriptions before publishing.
                    </AlertDescription>
                  </Alert>
                  <div>
                    <label className="text-sm font-medium">Select District</label>
                    <Select value={selectedDistrictForAI} onValueChange={setSelectedDistrictForAI}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAISuggest} 
                    disabled={!selectedDistrictForAI || aiGenerating}
                    className="w-full"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Villages
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingVillage(null); form.reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Village
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVillage ? "Edit Village" : "Add New Village"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Village Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.setValue("slug", generateSlug(e.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select district" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {districts.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="introduction"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Introduction *</FormLabel>
                          <AIVillageDescription
                            villageName={form.watch("name") || "Village"}
                            districtName={districts.find(d => d.id === form.watch("district_id"))?.name || "District"}
                            onContentGenerated={(content) => {
                              if (content.introduction) form.setValue("introduction", content.introduction);
                              if (content.history) form.setValue("history", content.history);
                              if (content.traditions) form.setValue("traditions", content.traditions);
                              if (content.festivals) form.setValue("festivals", content.festivals);
                              if (content.foods) form.setValue("foods", content.foods);
                              if (content.handicrafts) form.setValue("handicrafts", content.handicrafts);
                            }}
                          />
                        </div>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>History</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="traditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Traditions</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="festivals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Festivals</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="foods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foods</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="handicrafts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handicrafts</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="population"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Population</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="any" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="any" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="thumbnail_url"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Village Thumbnail"
                            value={field.value || ""}
                            onChange={field.onChange}
                            id="village-thumbnail"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingVillage ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search villages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Population</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVillages.map((village) => (
                    <TableRow key={village.id}>
                      <TableCell className="font-medium">{village.name}</TableCell>
                      <TableCell>{village.districts?.name}</TableCell>
                      <TableCell>{village.population || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={village.status === "published" ? "default" : "secondary"}>
                          {village.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(village)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(village.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
