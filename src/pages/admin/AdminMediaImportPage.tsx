import { useState, useCallback, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ImagePlus, History } from "lucide-react";
import { useMediaImport, CsvMapping } from "@/hooks/useMediaImport";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropZone,
  CsvColumnMapper,
  MetadataEditor,
  ValidationResults,
  ImportReview,
  ImportComplete,
} from "@/components/admin/MediaImport";

type WizardStep = "upload" | "mapping" | "validation" | "review" | "complete";

const STEP_LABELS = ["Upload", "Map & Edit", "Validate", "Review", "Complete"];

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
    setAssets,
  } = useMediaImport();

  const [step, setStep] = useState<WizardStep>("upload");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [csvMappings, setCsvMappings] = useState<CsvMapping[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pastJobs, setPastJobs] = useState<Array<{ id: string; status: string; created_at: string; total_files: number }>>([]);

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
    await commitJob(currentJob.id, true);
    setStep("complete");
  }, [currentJob, commitJob]);

  const handleRollback = useCallback(async () => {
    if (!currentJob) return;
    await rollbackJob(currentJob.id);
    setStep("upload");
    setSelectedFiles([]);
    setCsvMappings([]);
    setSelectedAssets(new Set());
  }, [currentJob, rollbackJob]);

  const handleStartNew = useCallback(() => {
    setStep("upload");
    setSelectedFiles([]);
    setCsvMappings([]);
    setSelectedAssets(new Set());
    setCurrentJob(null);
    setAssets([]);
  }, [setCurrentJob, setAssets]);

  const toggleAssetSelection = useCallback((id: string) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllAssets = useCallback(() => {
    setSelectedAssets(new Set(assets.map(a => a.id)));
  }, [assets]);

  const handleBulkUpdate = useCallback(async (updates: Array<{ id: string } & Record<string, unknown>>) => {
    if (!currentJob) return;
    await bulkUpdateAssets(currentJob.id, updates);
    setSelectedAssets(new Set());
  }, [currentJob, bulkUpdateAssets]);

  const stepIndex = STEP_LABELS.map(s => s.toLowerCase().replace(/ & /g, "").replace(/ /g, "")).indexOf(step === "mapping" ? "mapedit" : step);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImagePlus className="h-6 w-6" />
              Media Import
            </h1>
            <p className="text-muted-foreground">Bulk upload and manage images</p>
          </div>
        </div>

        <Tabs defaultValue="import">
          <TabsList>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              New Import
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-6 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center">
              {STEP_LABELS.map((label, idx) => (
                <div key={label} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx === stepIndex ? "bg-primary text-primary-foreground" :
                    idx < stepIndex ? "bg-green-600 text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`hidden sm:block ml-2 text-sm ${idx === stepIndex ? "font-medium" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {idx < STEP_LABELS.length - 1 && <div className="w-8 sm:w-12 h-0.5 bg-muted mx-2" />}
                </div>
              ))}
            </div>

            {/* Upload Step */}
            {step === "upload" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CsvColumnMapper mappings={csvMappings} onMappingsChange={setCsvMappings} />
                  <DropZone
                    files={selectedFiles}
                    onFilesChange={setSelectedFiles}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                  />
                  <Button className="w-full" size="lg" onClick={handleStartUpload} disabled={selectedFiles.length === 0 || uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import ({selectedFiles.length} files)
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Mapping Step */}
            {step === "mapping" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Map & Edit Metadata</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
                    <Button onClick={handleValidate} disabled={processing}>Validate & Continue</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MetadataEditor
                    assets={assets}
                    selectedAssets={selectedAssets}
                    onToggleSelect={toggleAssetSelection}
                    onSelectAll={selectAllAssets}
                    onClearSelection={() => setSelectedAssets(new Set())}
                    onUpdateAsset={updateAsset}
                    onBulkUpdate={handleBulkUpdate}
                    getPublicUrl={getPublicUrl}
                    filter={filterStatus}
                    onFilterChange={setFilterStatus}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </CardContent>
              </Card>
            )}

            {/* Validation Step */}
            {step === "validation" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Validation Results</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("mapping")}>Back</Button>
                    <Button onClick={() => setStep("review")}>Continue to Review</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ValidationResults
                    assets={assets}
                    errors={errors}
                    warningCount={currentJob?.warning_count || 0}
                    errorCount={currentJob?.error_count || 0}
                    getPublicUrl={getPublicUrl}
                    onRevalidate={handleValidate}
                    processing={processing}
                  />
                </CardContent>
              </Card>
            )}

            {/* Review Step */}
            {step === "review" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Final Review</CardTitle>
                  <Button variant="outline" onClick={() => setStep("validation")}>Back</Button>
                </CardHeader>
                <CardContent>
                  <ImportReview
                    assets={assets}
                    job={currentJob}
                    processing={processing}
                    onCommit={handleCommit}
                    onRollback={handleRollback}
                    isSuperAdmin={isSuperAdmin}
                    getPublicUrl={getPublicUrl}
                  />
                </CardContent>
              </Card>
            )}

            {/* Complete Step */}
            {step === "complete" && <ImportComplete job={currentJob} onStartNew={handleStartNew} />}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Import History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pastJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium font-mono text-sm">{job.id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleString()} • {job.total_files} files
                        </p>
                      </div>
                      <Badge variant={job.status === "committed" ? "default" : job.status === "rolled_back" ? "destructive" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                  {pastJobs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No import history yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
