import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MediaAsset {
  id: string;
  job_id: string | null;
  filename: string;
  original_filename: string;
  storage_path: string;
  thumbnail_path: string | null;
  optimized_paths: Record<string, string>;
  entity_type: string | null;
  entity_id: string | null;
  title: string | null;
  caption: string | null;
  credit: string | null;
  alt_text: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  exif: Record<string, unknown> | null;
  geolat: number | null;
  geolng: number | null;
  is_published: boolean;
  publish_status: string;
  fingerprint: string | null;
  phash: string | null;
  validation_status: string;
  validation_errors: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportJob {
  id: string;
  status: string;
  total_files: number;
  processed_files: number;
  success_count: number;
  warning_count: number;
  error_count: number;
  csv_mapping: Record<string, unknown> | null;
  settings: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  committed_at: string | null;
  committed_by: string | null;
  rolled_back_at: string | null;
  rolled_back_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ImportError {
  id: string;
  job_id: string;
  asset_id: string | null;
  filename: string;
  error_type: string;
  error_code: string | null;
  error_message: string;
  error_details: Record<string, unknown> | null;
  is_recoverable: boolean;
  created_at: string;
}

export interface CsvMapping {
  filename: string;
  entity_type?: string;
  entity_slug_or_id?: string;
  title?: string;
  caption?: string;
  credit?: string;
  tags?: string;
  geolat?: string;
  geolng?: string;
  publish?: string;
}

export function useMediaImport() {
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const callImportApi = useCallback(async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await supabase.functions.invoke("media-import", {
      body,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) throw response.error;
    return response.data;
  }, []);

  const startJob = useCallback(async (settings?: Record<string, unknown>, csvMapping?: CsvMapping[]) => {
    try {
      const result = await callImportApi({
        action: "start",
        data: { settings, csvMapping },
      });
      setCurrentJob(result.job);
      setAssets([]);
      setErrors([]);
      return result.job;
    } catch (error: unknown) {
      toast.error("Failed to start import job");
      throw error;
    }
  }, [callImportApi]);

  const uploadFiles = useCallback(async (files: File[], jobId: string, csvMappings?: CsvMapping[]) => {
    setUploading(true);
    setUploadProgress(0);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUploading(false);
      throw new Error("Not authenticated");
    }

    const uploadedAssets: MediaAsset[] = [];
    const csvMap = new Map(csvMappings?.map(m => [m.filename.toLowerCase(), m]));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${jobId}/${crypto.randomUUID()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("media-imports")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        // Get CSV mapping if available
        const mapping = csvMap.get(file.name.toLowerCase());

        // Compute simple hash (SHA-256 would require crypto API)
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fingerprint = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Create asset record
        const assetData = {
          job_id: jobId,
          filename: fileName,
          original_filename: file.name,
          storage_path: fileName,
          size_bytes: file.size,
          mime_type: file.type,
          fingerprint,
          entity_type: mapping?.entity_type || "unlinked",
          title: mapping?.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          caption: mapping?.caption || null,
          credit: mapping?.credit || null,
          tags: mapping?.tags?.split(";").map(t => t.trim()).filter(Boolean) || [],
          geolat: mapping?.geolat ? parseFloat(mapping.geolat) : null,
          geolng: mapping?.geolng ? parseFloat(mapping.geolng) : null,
          created_by: session.user.id,
        };

        const { data: asset, error: assetError } = await supabase
          .from("media_assets")
          .insert(assetData)
          .select()
          .single();

        if (!assetError && asset) {
          uploadedAssets.push(asset as MediaAsset);
        }

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Update job with total files
      await supabase
        .from("media_import_jobs")
        .update({
          status: "uploading",
          total_files: files.length,
          processed_files: uploadedAssets.length,
          started_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      setAssets(prev => [...prev, ...uploadedAssets]);
      toast.success(`Uploaded ${uploadedAssets.length} of ${files.length} files`);
      return uploadedAssets;
    } finally {
      setUploading(false);
    }
  }, []);

  const getJobStatus = useCallback(async (jobId: string) => {
    try {
      const result = await callImportApi({
        action: "status",
        jobId,
      });
      setCurrentJob(result.job);
      setAssets(result.assets || []);
      setErrors(result.errors || []);
      return result;
    } catch (error) {
      console.error("Failed to get job status:", error);
      throw error;
    }
  }, [callImportApi]);

  const updateAsset = useCallback(async (assetId: string, data: Partial<MediaAsset>) => {
    try {
      const result = await callImportApi({
        action: "update-asset",
        assetId,
        data,
      });
      setAssets(prev => prev.map(a => a.id === assetId ? result.asset : a));
      return result.asset;
    } catch (error) {
      toast.error("Failed to update asset");
      throw error;
    }
  }, [callImportApi]);

  const bulkUpdateAssets = useCallback(async (jobId: string, updates: Array<{ id: string; [key: string]: unknown }>) => {
    try {
      const result = await callImportApi({
        action: "bulk-update",
        jobId,
        data: { updates },
      });
      toast.success(`Updated ${result.updated} assets`);
      await getJobStatus(jobId);
      return result;
    } catch (error) {
      toast.error("Failed to bulk update assets");
      throw error;
    }
  }, [callImportApi, getJobStatus]);

  const validateJob = useCallback(async (jobId: string) => {
    setProcessing(true);
    try {
      const result = await callImportApi({
        action: "validate",
        jobId,
      });
      await getJobStatus(jobId);
      toast.success(`Validation complete: ${result.warningCount} warnings, ${result.errorCount} errors`);
      return result;
    } catch (error) {
      toast.error("Validation failed");
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [callImportApi, getJobStatus]);

  const commitJob = useCallback(async (jobId: string, publishAll: boolean = true, assetIds?: string[]) => {
    setProcessing(true);
    try {
      const result = await callImportApi({
        action: "commit",
        jobId,
        data: { publishAll, assetIds },
      });
      await getJobStatus(jobId);
      toast.success(`Import committed: ${result.publishedCount} assets published`);
      return result;
    } catch (error) {
      toast.error("Failed to commit import");
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [callImportApi, getJobStatus]);

  const rollbackJob = useCallback(async (jobId: string) => {
    setProcessing(true);
    try {
      const result = await callImportApi({
        action: "rollback",
        jobId,
      });
      setCurrentJob(null);
      setAssets([]);
      setErrors([]);
      toast.success(`Rollback complete: ${result.deletedAssets} assets removed`);
      return result;
    } catch (error) {
      toast.error("Failed to rollback import");
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [callImportApi]);

  const getPublicUrl = useCallback((storagePath: string, bucket: string = "media") => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
  }, []);

  return {
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
  };
}
