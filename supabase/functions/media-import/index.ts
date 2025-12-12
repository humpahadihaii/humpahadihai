import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface ImportJobRequest {
  action: "start" | "status" | "update-asset" | "commit" | "rollback" | "validate" | "bulk-update";
  jobId?: string;
  assetId?: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const userRoles = roles?.map(r => r.role) || [];
    const isAdmin = userRoles.includes("super_admin") || userRoles.includes("admin");
    const isContentManager = userRoles.includes("content_manager");

    if (!isAdmin && !isContentManager) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ImportJobRequest = await req.json();
    const { action, jobId, assetId, data } = body;

    // Get user email for audit
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const userEmail = profile?.email || user.email;
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    switch (action) {
      case "start": {
        // Create new import job
        const { data: job, error } = await supabase
          .from("media_import_jobs")
          .insert({
            status: "pending",
            created_by: user.id,
            settings: data?.settings || {},
            csv_mapping: data?.csvMapping || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Log audit
        await supabase.from("media_import_audit").insert({
          job_id: job.id,
          action: "started",
          actor_id: user.id,
          actor_email: userEmail,
          details: { settings: data?.settings },
          ip_address: clientIp,
          user_agent: userAgent,
        });

        return new Response(JSON.stringify({ job }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "status": {
        if (!jobId) {
          return new Response(JSON.stringify({ error: "Job ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: job, error: jobError } = await supabase
          .from("media_import_jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (jobError) throw jobError;

        const { data: assets } = await supabase
          .from("media_assets")
          .select("*")
          .eq("job_id", jobId)
          .order("created_at", { ascending: true });

        const { data: errors } = await supabase
          .from("media_import_errors")
          .select("*")
          .eq("job_id", jobId)
          .order("created_at", { ascending: true });

        return new Response(JSON.stringify({ job, assets: assets || [], errors: errors || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update-asset": {
        if (!assetId) {
          return new Response(JSON.stringify({ error: "Asset ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData = data as Record<string, unknown>;
        
        // Content managers can only update unpublished assets
        if (isContentManager && !isAdmin) {
          const { data: asset } = await supabase
            .from("media_assets")
            .select("is_published, created_by")
            .eq("id", assetId)
            .single();

          if (asset?.is_published || asset?.created_by !== user.id) {
            return new Response(JSON.stringify({ error: "Cannot modify this asset" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        const { data: updatedAsset, error } = await supabase
          .from("media_assets")
          .update(updateData)
          .eq("id", assetId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ asset: updatedAsset }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "bulk-update": {
        if (!jobId || !data?.updates) {
          return new Response(JSON.stringify({ error: "Job ID and updates required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updates = data.updates as Array<{ id: string; [key: string]: unknown }>;
        const results = [];

        for (const update of updates) {
          const { id, ...updateFields } = update;
          const { data: asset, error } = await supabase
            .from("media_assets")
            .update(updateFields)
            .eq("id", id)
            .eq("job_id", jobId)
            .select()
            .single();

          if (!error) {
            results.push(asset);
          }
        }

        await supabase.from("media_import_audit").insert({
          job_id: jobId,
          action: "metadata_updated",
          actor_id: user.id,
          actor_email: userEmail,
          details: { updated_count: results.length },
          ip_address: clientIp,
          user_agent: userAgent,
        });

        return new Response(JSON.stringify({ updated: results.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "validate": {
        if (!jobId) {
          return new Response(JSON.stringify({ error: "Job ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get all assets for this job
        const { data: assets } = await supabase
          .from("media_assets")
          .select("*")
          .eq("job_id", jobId);

        const validationResults = [];
        let warningCount = 0;
        let errorCount = 0;

        for (const asset of assets || []) {
          const errors: string[] = [];
          const warnings: string[] = [];

          // Check for entity mapping
          if (!asset.entity_type || asset.entity_type === "unlinked") {
            warnings.push("No entity linked");
          }

          // Check for required metadata
          if (!asset.title) {
            warnings.push("Missing title");
          }

          // Check for duplicate fingerprint
          if (asset.fingerprint) {
            const { data: duplicates } = await supabase
              .from("media_assets")
              .select("id, filename, entity_type, entity_id")
              .eq("fingerprint", asset.fingerprint)
              .neq("id", asset.id)
              .limit(1);

            if (duplicates && duplicates.length > 0) {
              warnings.push(`Possible duplicate: ${duplicates[0].filename}`);
            }
          }

          const status = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "valid";
          if (status === "error") errorCount++;
          if (status === "warning") warningCount++;

          await supabase
            .from("media_assets")
            .update({
              validation_status: status,
              validation_errors: [...errors, ...warnings],
            })
            .eq("id", asset.id);

          validationResults.push({
            id: asset.id,
            status,
            errors,
            warnings,
          });
        }

        // Update job counts
        await supabase
          .from("media_import_jobs")
          .update({
            status: "ready",
            warning_count: warningCount,
            error_count: errorCount,
          })
          .eq("id", jobId);

        await supabase.from("media_import_audit").insert({
          job_id: jobId,
          action: "validated",
          actor_id: user.id,
          actor_email: userEmail,
          details: { warning_count: warningCount, error_count: errorCount },
          ip_address: clientIp,
          user_agent: userAgent,
        });

        return new Response(JSON.stringify({ results: validationResults, warningCount, errorCount }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "commit": {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Only Admin/Super Admin can commit imports" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (!jobId) {
          return new Response(JSON.stringify({ error: "Job ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get job
        const { data: job } = await supabase
          .from("media_import_jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (!job || job.status === "committed") {
          return new Response(JSON.stringify({ error: "Job not found or already committed" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get assets to publish
        const publishAll = data?.publishAll === true;
        const assetIds = data?.assetIds as string[] | undefined;

        let query = supabase
          .from("media_assets")
          .update({
            is_published: true,
            publish_status: "published",
          })
          .eq("job_id", jobId);

        if (!publishAll && assetIds?.length) {
          query = query.in("id", assetIds);
        }

        const { data: publishedAssets, error: publishError } = await query.select();
        if (publishError) throw publishError;

        // Update job status
        await supabase
          .from("media_import_jobs")
          .update({
            status: "committed",
            committed_at: new Date().toISOString(),
            committed_by: user.id,
            success_count: publishedAssets?.length || 0,
          })
          .eq("id", jobId);

        await supabase.from("media_import_audit").insert({
          job_id: jobId,
          action: "committed",
          actor_id: user.id,
          actor_email: userEmail,
          details: { published_count: publishedAssets?.length || 0 },
          ip_address: clientIp,
          user_agent: userAgent,
        });

        return new Response(JSON.stringify({ 
          success: true, 
          publishedCount: publishedAssets?.length || 0 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "rollback": {
        if (!userRoles.includes("super_admin")) {
          return new Response(JSON.stringify({ error: "Only Super Admin can rollback imports" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (!jobId) {
          return new Response(JSON.stringify({ error: "Job ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get all assets for this job
        const { data: assets } = await supabase
          .from("media_assets")
          .select("storage_path, optimized_paths")
          .eq("job_id", jobId);

        // Delete files from storage
        const pathsToDelete: string[] = [];
        for (const asset of assets || []) {
          if (asset.storage_path) pathsToDelete.push(asset.storage_path);
          if (asset.optimized_paths) {
            Object.values(asset.optimized_paths as Record<string, string>).forEach(p => {
              if (p) pathsToDelete.push(p);
            });
          }
        }

        if (pathsToDelete.length > 0) {
          await supabase.storage.from("media-imports").remove(pathsToDelete);
          await supabase.storage.from("media").remove(pathsToDelete);
        }

        // Delete assets and errors
        await supabase.from("media_assets").delete().eq("job_id", jobId);
        await supabase.from("media_import_errors").delete().eq("job_id", jobId);

        // Update job status
        await supabase
          .from("media_import_jobs")
          .update({
            status: "rolled_back",
            rolled_back_at: new Date().toISOString(),
            rolled_back_by: user.id,
          })
          .eq("id", jobId);

        await supabase.from("media_import_audit").insert({
          job_id: jobId,
          action: "rolled_back",
          actor_id: user.id,
          actor_email: userEmail,
          details: { deleted_assets: assets?.length || 0, deleted_files: pathsToDelete.length },
          ip_address: clientIp,
          user_agent: userAgent,
        });

        return new Response(JSON.stringify({ 
          success: true, 
          deletedAssets: assets?.length || 0,
          deletedFiles: pathsToDelete.length 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    console.error("Media import error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
