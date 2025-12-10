import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Search, FolderUp, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import Papa from "papaparse";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { districtsExcelConfig } from "@/lib/excelConfigs";

const districtSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  overview: z.string().min(10, "Overview must be at least 10 characters"),
  region: z.string().optional(),
  geography: z.string().optional(),
  population: z.string().optional(),
  cultural_identity: z.string().optional(),
  famous_specialties: z.string().optional(),
  local_languages: z.string().optional(),
  connectivity: z.string().optional(),
  best_time_to_visit: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  image_url: z.string().optional(),
  banner_image: z.string().optional(),
  status: z.enum(["draft", "review", "published"]),
  sort_order: z.string().optional(),
});

type DistrictFormData = z.infer<typeof districtSchema>;

interface District {
  id: string;
  name: string;
  slug: string;
  overview: string;
  region?: string | null;
  geography?: string | null;
  population?: string | null;
  cultural_identity?: string | null;
  famous_specialties?: string | null;
  local_languages?: string | null;
  connectivity?: string | null;
  best_time_to_visit?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  banner_image?: string | null;
  status: string;
  sort_order?: number | null;
  created_at: string;
  updated_at: string;
  highlights?: string | null;
}

interface CensusRow {
  State_Code?: string;
  District_Code?: string;
  "Sub District Code"?: string;
  "Town/Village Code"?: string;
  Level?: string;
  Name?: string;
  "Total/Rural/Urban"?: string;
  "Total Population Person"?: string;
  District_Name?: string;
  "Sub District Name"?: string;
  [key: string]: string | undefined;
}

interface ImportResult {
  imported: number;
  skipped: number;
  skippedDistricts: string[];
  errors: string[];
}

export default function AdminDistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  
  // Census Import State
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const excel = useExcelOperations(districtsExcelConfig);

  const form = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      name: "",
      slug: "",
      overview: "",
      region: "",
      geography: "",
      population: "",
      cultural_identity: "",
      famous_specialties: "",
      local_languages: "",
      connectivity: "",
      best_time_to_visit: "",
      latitude: "",
      longitude: "",
      image_url: "",
      banner_image: "",
      status: "draft",
      sort_order: "0",
    },
  });

  // Create district lookup map
  const districtLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    districts.forEach((d) => {
      // Normalize district names for matching (lowercase, trim)
      lookup[d.name.toLowerCase().trim()] = d.id;
      // Also try without common suffixes
      const normalized = d.name.toLowerCase().trim().replace(/\s+district$/i, "");
      lookup[normalized] = d.id;
    });
    return lookup;
  }, [districts]);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch districts");
    } else {
      setDistricts(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: DistrictFormData) => {
    const districtData: any = {
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      sort_order: data.sort_order ? parseInt(data.sort_order, 10) : 0,
    };

    if (editingDistrict) {
      const { error } = await supabase
        .from("districts")
        .update(districtData)
        .eq("id", editingDistrict.id);

      if (error) {
        console.error("District update error:", error);
        toast.error(`Failed to update: ${error.message || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("District updated successfully");
        fetchDistricts();
        setDialogOpen(false);
        setEditingDistrict(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("districts").insert(districtData);

      if (error) {
        console.error("District insert error:", error);
        toast.error(`Failed to create: ${error.message || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("District created successfully");
        fetchDistricts();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    form.reset({
      ...district,
      region: district.region || "",
      latitude: district.latitude?.toString() || "",
      longitude: district.longitude?.toString() || "",
      sort_order: district.sort_order?.toString() || "0",
      status: (district.status as "draft" | "review" | "published") || "draft",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this district?")) return;

    const { error } = await supabase.from("districts").delete().eq("id", id);

    if (error) {
      console.error("District delete error:", error);
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`, {
        description: error.details || error.hint,
      });
    } else {
      toast.success("District deleted successfully");
      fetchDistricts();
    }
  };

  const filteredDistricts = districts.filter((district) =>
    district.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Census Import Functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setImportResult(null);
    } else if (file) {
      toast.error("Please select a valid CSV file");
    }
  };

  const findDistrictId = useCallback((districtName: string): string | null => {
    if (!districtName) return null;
    const normalized = districtName.toLowerCase().trim();
    
    // Direct match
    if (districtLookup[normalized]) {
      return districtLookup[normalized];
    }
    
    // Try without "district" suffix
    const withoutSuffix = normalized.replace(/\s+district$/i, "");
    if (districtLookup[withoutSuffix]) {
      return districtLookup[withoutSuffix];
    }
    
    // Fuzzy match - find closest
    for (const [key, id] of Object.entries(districtLookup)) {
      if (key.includes(withoutSuffix) || withoutSuffix.includes(key)) {
        return id;
      }
    }
    
    return null;
  }, [districtLookup]);

  const processCSV = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file first");
      return;
    }

    setImporting(true);
    setImportProgress(0);
    setCurrentBatch(0);
    setImportResult(null);

    Papa.parse<CensusRow>(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        
        // Filter for VILLAGE level and Rural
        const villageRows = rows.filter((row) => {
          const level = row.Level?.toUpperCase().trim();
          const totalRuralUrban = row["Total/Rural/Urban"]?.trim();
          return level === "VILLAGE" && totalRuralUrban === "Rural";
        });

        if (villageRows.length === 0) {
          toast.error("No valid village rows found in CSV");
          setImporting(false);
          return;
        }

        // Process and validate rows
        const validVillages: Array<{
          name: string;
          slug: string;
          district_id: string;
          population: number | null;
          tehsil: string | null;
          introduction: string;
          status: string;
        }> = [];
        const skippedDistrictsSet = new Set<string>();
        const errors: string[] = [];

        for (const row of villageRows) {
          const districtName = row.District_Name || row["District Name"] || "";
          const villageName = row.Name?.trim() || "";
          const populationStr = row["Total Population Person"] || row["TOT_P"] || "0";
          const tehsil = row["Sub District Name"] || row["Sub-District Name"] || null;

          if (!villageName) continue;

          const districtId = findDistrictId(districtName);
          
          if (!districtId) {
            skippedDistrictsSet.add(districtName);
            continue;
          }

          validVillages.push({
            name: villageName,
            slug: generateSlug(villageName) + "-" + Date.now().toString(36).slice(-4),
            district_id: districtId,
            population: parseInt(populationStr.replace(/,/g, ""), 10) || null,
            tehsil: tehsil?.trim() || null,
            introduction: `${villageName} is a village in Uttarakhand.`,
            status: "published",
          });
        }

        if (validVillages.length === 0) {
          toast.error("No villages could be matched to existing districts");
          setImportResult({
            imported: 0,
            skipped: villageRows.length,
            skippedDistricts: Array.from(skippedDistrictsSet),
            errors: ["No matching districts found for any village in the CSV"],
          });
          setImporting(false);
          return;
        }

        // Batch insert
        const BATCH_SIZE = 2000;
        const batches = Math.ceil(validVillages.length / BATCH_SIZE);
        setTotalBatches(batches);
        
        let importedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < batches; i++) {
          setCurrentBatch(i + 1);
          setImportProgress(((i + 1) / batches) * 100);
          
          const batch = validVillages.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
          
          const { error } = await supabase
            .from("villages")
            .insert(batch);

          if (error) {
            console.error(`Batch ${i + 1} error:`, error);
            errors.push(`Batch ${i + 1}: ${error.message}`);
            errorCount += batch.length;
          } else {
            importedCount += batch.length;
          }
        }

        setImportResult({
          imported: importedCount,
          skipped: skippedDistrictsSet.size > 0 ? villageRows.length - validVillages.length : 0,
          skippedDistricts: Array.from(skippedDistrictsSet),
          errors,
        });

        if (importedCount > 0) {
          toast.success(`Successfully imported ${importedCount.toLocaleString()} villages!`);
        }
        
        setImporting(false);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast.error("Failed to parse CSV file");
        setImporting(false);
      },
    });
  };

  const resetImport = () => {
    setCsvFile(null);
    setImportResult(null);
    setImportProgress(0);
    setCurrentBatch(0);
    setTotalBatches(0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Districts Management</h1>
            <p className="text-muted-foreground">Manage all 13 districts of Uttarakhand</p>
          </div>
          <div className="flex gap-2">
            <ExcelImportExportButtons
              onExport={() => excel.exportToExcel(filteredDistricts)}
              onImportClick={() => setExcelImportOpen(true)}
              exporting={excel.exporting}
              importing={excel.importing}
            />
            {/* Census Import Button */}
            <Dialog open={importDialogOpen} onOpenChange={(open) => {
              setImportDialogOpen(open);
              if (!open) resetImport();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderUp className="mr-2 h-4 w-4" />
                  Import Census Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Import Villages from Census 2011 CSV</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {!importing && !importResult && (
                    <>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload Census 2011 CSV file
                        </p>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                      
                      {csvFile && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="flex-1 text-sm truncate">{csvFile.name}</span>
                          <Badge variant="secondary">{(csvFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Expected columns:</strong></p>
                        <ul className="list-disc list-inside">
                          <li>Level (filtered for "VILLAGE")</li>
                          <li>Total/Rural/Urban (filtered for "Rural")</li>
                          <li>Name → village name</li>
                          <li>District_Name → matches to your districts</li>
                          <li>Total Population Person → population</li>
                          <li>Sub District Name → tehsil</li>
                        </ul>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          <AlertCircle className="inline h-3 w-3 mr-1" />
                          Only villages with matching districts will be imported. Districts not in your system will be skipped.
                        </p>
                      </div>

                      <Button 
                        onClick={processCSV} 
                        disabled={!csvFile}
                        className="w-full"
                      >
                        Start Import
                      </Button>
                    </>
                  )}

                  {importing && (
                    <div className="space-y-4 py-8">
                      <div className="text-center">
                        <p className="text-lg font-medium mb-2">Importing Villages...</p>
                        <p className="text-sm text-muted-foreground">
                          Batch {currentBatch} of {totalBatches}
                        </p>
                      </div>
                      <Progress value={importProgress} className="h-3" />
                      <p className="text-xs text-center text-muted-foreground">
                        Please don't close this window
                      </p>
                    </div>
                  )}

                  {importResult && (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        {importResult.imported > 0 ? (
                          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                        ) : (
                          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                        )}
                        <h3 className="text-lg font-semibold">Import Complete</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="pt-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{importResult.imported.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Villages Imported</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 text-center">
                            <p className="text-2xl font-bold text-amber-600">{importResult.skipped.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Rows Skipped</p>
                          </CardContent>
                        </Card>
                      </div>

                      {importResult.skippedDistricts.length > 0 && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium mb-2">Skipped Districts (not in system):</p>
                          <div className="flex flex-wrap gap-1">
                            {importResult.skippedDistricts.slice(0, 10).map((d) => (
                              <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                            ))}
                            {importResult.skippedDistricts.length > 10 && (
                              <Badge variant="outline" className="text-xs">
                                +{importResult.skippedDistricts.length - 10} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {importResult.errors.length > 0 && (
                        <div className="bg-destructive/10 p-3 rounded-lg">
                          <p className="text-sm font-medium text-destructive mb-2">Errors:</p>
                          <ul className="text-xs text-destructive space-y-1">
                            {importResult.errors.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button onClick={resetImport} variant="outline" className="w-full">
                        Import Another File
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Add District Button */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingDistrict(null); form.reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add District
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingDistrict ? "Edit District" : "Add New District"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District Name *</FormLabel>
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
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug *</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="overview"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overview *</FormLabel>
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
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="any" placeholder="30.0668" />
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
                              <Input {...field} type="number" step="any" placeholder="79.0193" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="geography"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geography</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="population"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Population</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 7,14,816" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="local_languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local Languages</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Hindi, Garhwali" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cultural_identity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cultural Identity</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="famous_specialties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Famous Specialties</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="connectivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Connectivity</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} placeholder="Nearest airport, railway station, highways..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="best_time_to_visit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Best Time to Visit</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., March to June, September to November" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Thumbnail Image"
                            value={field.value || ""}
                            onChange={field.onChange}
                            id="district-thumbnail"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="banner_image"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Banner Image"
                            value={field.value || ""}
                            onChange={field.onChange}
                            id="district-banner"
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
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

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingDistrict ? "Update" : "Create"}
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
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
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
                    <TableHead>Population</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistricts.map((district) => (
                    <TableRow key={district.id}>
                      <TableCell className="font-medium">{district.name}</TableCell>
                      <TableCell>{district.population || "N/A"}</TableCell>
                      <TableCell>{district.local_languages || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={district.status === "published" ? "default" : "secondary"}>
                          {district.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(district)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(district.id)}
                        >
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
