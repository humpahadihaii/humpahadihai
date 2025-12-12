import { useState, useCallback, useRef, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  Download,
  RotateCcw,
  Save,
  Eye,
  Trash2,
  FileSpreadsheet,
  ImagePlus
} from "lucide-react";
import { useMediaImport, MediaAsset, CsvMapping } from "@/hooks/useMediaImport";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const ENTITY_TYPES = [
  { value: "village", label: "Village" },
  { value: "district", label: "District" },
  { value: "provider", label: "Provider" },
  { value: "listing", label: "Listing" },
  { value: "event", label: "Event" },
  { value: "product", label: "Product" },
  { value: "gallery", label: "Gallery" },
  { value: "unlinked", label: "Unlinked" },
];

type WizardStep = "upload" | "mapping" | "validation" | "review" | "complete";

export default function AdminMediaImportPage() {
  const { isSuperAdmin } = useAuth();
  const {
    currentJob,
    assets,
    errors,
    uploading,
    processing,
    uploadProgress,
    startJob,
    uploadFiles,
    getJobStatus,
    updateAsset,
    bulkUpdateAssets,
    validateJob,
    commitJob,
    rollbackJob,
    getPublicUrl,
    setCurrentJob,
  } = useMediaImport();

  const [step, setStep] = useState<WizardStep>("upload");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [csvMappings, setCsvMappings] = useState<CsvMapping[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [bulkEntityType, setBulkEntityType] = useState<string>("");
  const [bulkTags, setBulkTags] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [pastJobs, setPastJobs] = useState<Array<{ id: string; status: string; created_at: string; total_files: number }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Load past jobs
  useEffect(() => {
    const loadPastJobs = async () => {
      const { data } = await supabase
        .from("media_import_jobs")
        .select("id, status, created_at, total_files")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setPastJobs(data);
    };
    loadPastJobs();
  }, [currentJob]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => 
      ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(f.type)
    );
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<CsvMapping>(sheet);
      setCsvMappings(jsonData);
      toast.success(`Loaded ${jsonData.length} mappings from CSV`);
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleStartUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    try {
      const job = await startJob({}, csvMappings);
      await uploadFiles(selectedFiles, job.id, csvMappings);
      await getJobStatus(job.id);
      setStep("mapping");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }, [selectedFiles, csvMappings, startJob, uploadFiles, getJobStatus]);

  const handleValidate = useCallback(async () => {
    if (!currentJob) return;
    await validateJob(currentJob.id);
    setStep("validation");
  }, [currentJob, validateJob]);

  const handleCommit = useCallback(async () => {
    if (!currentJob) return;
    const assetIds = selectedAssets.size > 0 ? Array.from(selectedAssets) : undefined;
    await commitJob(currentJob.id, selectedAssets.size === 0, assetIds);
    setStep("complete");
  }, [currentJob, selectedAssets, commitJob]);

  const handleRollback = useCallback(async () => {
    if (!currentJob) return;
    await rollbackJob(currentJob.id);
    setStep("upload");
    setSelectedFiles([]);
    setCsvMappings([]);
    setSelectedAssets(new Set());
  }, [currentJob, rollbackJob]);

  const handleBulkAssign = useCallback(async () => {
    if (!currentJob || selectedAssets.size === 0) return;
    
    const updates = Array.from(selectedAssets).map(id => ({
      id,
      ...(bulkEntityType && { entity_type: bulkEntityType }),
      ...(bulkTags && { tags: bulkTags.split(",").map(t => t.trim()) }),
    }));

    await bulkUpdateAssets(currentJob.id, updates);
    setSelectedAssets(new Set());
    setBulkEntityType("");
    setBulkTags("");
  }, [currentJob, selectedAssets, bulkEntityType, bulkTags, bulkUpdateAssets]);

  const toggleAssetSelection = useCallback((assetId: string) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  }, []);

  const selectAllAssets = useCallback(() => {
    setSelectedAssets(new Set(filteredAssets.map(a => a.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAssets(new Set());
  }, []);

  const downloadTemplate = useCallback(() => {
    const template = [
      {
        filename: "example.jpg",
        entity_type: "village",
        entity_slug_or_id: "bageshwar",
        title: "Bageshwar Temple",
        caption: "Sunset at temple",
        credit: "Photo: Raj",
        tags: "temple;sunset",
        geolat: "30.12345",
        geolng: "79.12345",
        publish: "true"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mapping");
    XLSX.writeFile(wb, "media-import-template.xlsx");
  }, []);

  const downloadErrorReport = useCallback(() => {
    if (errors.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(errors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, `import-errors-${currentJob?.id}.xlsx`);
  }, [errors, currentJob]);

  const filteredAssets = assets.filter(asset => {
    if (filterStatus === "all") return true;
    if (filterStatus === "unmapped") return !asset.entity_type || asset.entity_type === "unlinked";
    if (filterStatus === "warnings") return asset.validation_status === "warning";
    if (filterStatus === "errors") return asset.validation_status === "error";
    return true;
  });

  const renderUploadStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="h-5 w-5" />
          Bulk Photo Import
        </CardTitle>
        <CardDescription>
          Upload multiple photos at once with optional CSV mapping
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Template */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">CSV Mapping (Optional)</p>
            <p className="text-sm text-muted-foreground">
              Download template to pre-map files to entities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => csvInputRef.current?.click()}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>
        </div>

        {csvMappings.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ {csvMappings.length} mappings loaded from CSV
            </p>
          </div>
        )}

        {/* Drop Zone */}
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(f => f.type.startsWith("image/"));
            setSelectedFiles(prev => [...prev, ...validFiles]);
          }}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">Drag & drop photos here</p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse (JPG, PNG, WebP, AVIF)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{selectedFiles.length} files selected</p>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-48 border rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2">
                {selectedFiles.slice(0, 50).map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
                {selectedFiles.length > 50 && (
                  <div className="aspect-square rounded bg-muted flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      +{selectedFiles.length - 50} more
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleStartUpload}
          disabled={selectedFiles.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Start Import ({selectedFiles.length} files)
            </>
          )}
        </Button>

        {uploading && (
          <Progress value={uploadProgress} className="h-2" />
        )}
      </CardContent>
    </Card>
  );

  const renderMappingStep = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Map & Edit Metadata</CardTitle>
            <CardDescription>
              Assign entities and edit metadata for uploaded photos
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button onClick={handleValidate} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Validate & Continue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bulk Actions */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedAssets.size} selected</span>
            <Select value={bulkEntityType} onValueChange={setBulkEntityType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Tags (comma-separated)"
              value={bulkTags}
              onChange={(e) => setBulkTags(e.target.value)}
              className="w-48"
            />
            <Button size="sm" onClick={handleBulkAssign}>
              Apply to Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({assets.length})</SelectItem>
              <SelectItem value="unmapped">Unmapped</SelectItem>
              <SelectItem value="warnings">Warnings</SelectItem>
              <SelectItem value="errors">Errors</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={selectAllAssets}>
            Select All
          </Button>
        </div>

        {/* Assets Table */}
        <ScrollArea className="h-[500px] border rounded-lg">
          <div className="space-y-2 p-2">
            {filteredAssets.map(asset => (
              <AssetRow
                key={asset.id}
                asset={asset}
                selected={selectedAssets.has(asset.id)}
                onToggle={() => toggleAssetSelection(asset.id)}
                onUpdate={(data) => updateAsset(asset.id, data)}
                getPublicUrl={getPublicUrl}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderValidationStep = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Review warnings and errors before committing
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("mapping")}>
              Back to Mapping
            </Button>
            <Button onClick={() => setStep("review")}>
              Continue to Review
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {assets.filter(a => a.validation_status === "valid").length}
            </p>
            <p className="text-sm text-muted-foreground">Valid</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-600">
              {currentJob?.warning_count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-600">
              {currentJob?.error_count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Errors</p>
          </div>
        </div>

        {/* Issues List */}
        <ScrollArea className="h-[400px] border rounded-lg">
          <div className="space-y-2 p-4">
            {assets.filter(a => a.validation_errors.length > 0).map(asset => (
              <div key={asset.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <img
                  src={getPublicUrl(asset.storage_path, "media-imports")}
                  alt={asset.title || asset.filename}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{asset.original_filename}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {asset.validation_errors.map((err, idx) => (
                      <Badge 
                        key={idx} 
                        variant={asset.validation_status === "error" ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {err}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Final Review</CardTitle>
            <CardDescription>
              Review and commit the import
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("validation")}>
              Back
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-6 bg-muted rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">Import Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{assets.length}</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {assets.filter(a => a.validation_status === "valid").length}
              </p>
              <p className="text-sm text-muted-foreground">Ready</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-600">
                {currentJob?.warning_count || 0}
              </p>
              <p className="text-sm text-muted-foreground">With Warnings</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {assets.filter(a => a.entity_type && a.entity_type !== "unlinked").length}
              </p>
              <p className="text-sm text-muted-foreground">Linked</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <Button size="lg" onClick={handleCommit} disabled={processing}>
            {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Commit Import & Publish All
          </Button>

          {errors.length > 0 && (
            <Button variant="outline" onClick={downloadErrorReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Error Report
            </Button>
          )}

          {isSuperAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rollback Import
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rollback Import?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all uploaded files and database records for this import job. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRollback}>
                    Rollback
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-6 w-6" />
          Import Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <p className="text-lg mb-4">
            Successfully published {currentJob?.success_count || 0} assets
          </p>
          <Button onClick={() => {
            setStep("upload");
            setSelectedFiles([]);
            setCsvMappings([]);
            setCurrentJob(null);
          }}>
            Start New Import
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <Tabs defaultValue="import">
          <TabsList>
            <TabsTrigger value="import">New Import</TabsTrigger>
            <TabsTrigger value="history">Import History</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {(["upload", "mapping", "validation", "review", "complete"] as WizardStep[]).map((s, idx) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? "bg-primary text-primary-foreground" : 
                    (["upload", "mapping", "validation", "review", "complete"].indexOf(step) > idx) ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < 4 && <div className="w-12 h-0.5 bg-muted mx-2" />}
                </div>
              ))}
            </div>

            {step === "upload" && renderUploadStep()}
            {step === "mapping" && renderMappingStep()}
            {step === "validation" && renderValidationStep()}
            {step === "review" && renderReviewStep()}
            {step === "complete" && renderCompleteStep()}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Past Imports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pastJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{job.id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleString()} • {job.total_files} files
                        </p>
                      </div>
                      <Badge variant={job.status === "committed" ? "default" : job.status === "rolled_back" ? "destructive" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Asset Row Component
function AssetRow({ 
  asset, 
  selected, 
  onToggle, 
  onUpdate,
  getPublicUrl 
}: { 
  asset: MediaAsset; 
  selected: boolean; 
  onToggle: () => void; 
  onUpdate: (data: Partial<MediaAsset>) => void;
  getPublicUrl: (path: string, bucket?: string) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(asset.title || "");
  const [entityType, setEntityType] = useState(asset.entity_type || "unlinked");

  const handleSave = () => {
    onUpdate({ title, entity_type: entityType });
    setEditing(false);
  };

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border ${selected ? "border-primary bg-primary/5" : ""}`}>
      <Checkbox checked={selected} onCheckedChange={onToggle} />
      <img
        src={getPublicUrl(asset.storage_path, "media-imports")}
        alt={asset.title || asset.filename}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Title"
              className="h-8"
            />
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <>
            <p className="font-medium truncate">{asset.title || asset.original_filename}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {asset.entity_type || "unlinked"}
              </Badge>
              {asset.validation_status === "warning" && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              {asset.validation_status === "error" && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </>
        )}
      </div>
      {!editing && (
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
      )}
    </div>
  );
}
