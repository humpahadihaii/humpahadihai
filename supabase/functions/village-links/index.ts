import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit tracking (in-memory for edge function instance)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MINUTES = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const adminRoles = ['super_admin', 'admin', 'content_manager'];
    if (!profile || !adminRoles.includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {};

    // Route: POST /village-links/auto-link
    if (req.method === 'POST' && pathParts.includes('auto-link') && !pathParts.includes('commit')) {
      const { village_id, mode = 'fuzzy', radius_meters = 3000, limit = 50 } = body;

      if (!village_id) {
        return new Response(JSON.stringify({ error: 'village_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Rate limit check
      const rateLimitKey = `${village_id}`;
      const lastRun = rateLimitMap.get(rateLimitKey);
      const now = Date.now();
      if (lastRun && (now - lastRun) < RATE_LIMIT_MINUTES * 60 * 1000) {
        const waitMinutes = Math.ceil((RATE_LIMIT_MINUTES * 60 * 1000 - (now - lastRun)) / 60000);
        return new Response(JSON.stringify({ 
          error: `Rate limited. Please wait ${waitMinutes} minutes.` 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get village info
      const { data: village, error: villageError } = await supabase
        .from('villages')
        .select('id, name, district_id, latitude, longitude')
        .eq('id', village_id)
        .single();

      if (villageError || !village) {
        return new Response(JSON.stringify({ error: 'Village not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create job
      const { data: job, error: jobError } = await supabase
        .from('village_link_jobs')
        .insert({
          village_id,
          mode,
          radius_meters,
          status: 'queued',
          created_by: user.id
        })
        .select()
        .single();

      if (jobError) {
        console.error('Job creation error:', jobError);
        return new Response(JSON.stringify({ error: 'Failed to create job' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      rateLimitMap.set(rateLimitKey, now);

      // Process job asynchronously (using EdgeRuntime.waitUntil if available)
      const processJob = async () => {
        try {
          // Update status to running
          await supabase
            .from('village_link_jobs')
            .update({ status: 'running' })
            .eq('id', job.id);

          const suggestions: any[] = [];
          const villageName = village.name.toLowerCase();
          const districtId = village.district_id;

          // Get existing links to avoid duplicates
          const { data: existingLinks } = await supabase
            .from('village_links')
            .select('item_id, item_type')
            .eq('village_id', village_id);

          const linkedIds = new Set((existingLinks || []).map(l => `${l.item_type}:${l.item_id}`));

          // Find providers by district
          const { data: providers } = await supabase
            .from('tourism_providers')
            .select('id, name, district_id, village_id')
            .eq('is_active', true)
            .limit(limit);

          for (const p of providers || []) {
            if (linkedIds.has(`provider:${p.id}`)) continue;
            
            let confidence = 0;
            let source = mode;

            if (mode === 'fuzzy') {
              // Fuzzy name matching
              const providerName = p.name.toLowerCase();
              if (providerName.includes(villageName) || villageName.includes(providerName.split(' ')[0])) {
                confidence = 0.8;
              } else if (p.district_id === districtId) {
                confidence = 0.5;
              } else if (p.village_id === village_id) {
                confidence = 1.0;
              }
            } else if (mode === 'geo') {
              // District-based matching (simplified geo)
              if (p.village_id === village_id) {
                confidence = 1.0;
              } else if (p.district_id === districtId) {
                confidence = 0.6;
              }
            }

            if (confidence > 0.3) {
              suggestions.push({
                job_id: job.id,
                village_id,
                item_type: 'provider',
                item_id: p.id,
                confidence,
                source,
                candidate_data: { name: p.name }
              });
            }
          }

          // Find listings by district
          const { data: listings } = await supabase
            .from('tourism_listings')
            .select('id, title, village_id, provider_id')
            .eq('is_active', true)
            .limit(limit);

          for (const l of listings || []) {
            if (linkedIds.has(`listing:${l.id}`)) continue;

            let confidence = 0;
            const listingTitle = l.title.toLowerCase();

            if (listingTitle.includes(villageName)) {
              confidence = 0.7;
            } else if (l.village_id === village_id) {
              confidence = 1.0;
            }

            if (confidence > 0.3) {
              suggestions.push({
                job_id: job.id,
                village_id,
                item_type: 'listing',
                item_id: l.id,
                confidence,
                source: mode,
                candidate_data: { name: l.title }
              });
            }
          }

          // Find packages that might relate to village
          const { data: packages } = await supabase
            .from('travel_packages')
            .select('id, title, destination, region, village_ids')
            .eq('is_active', true)
            .limit(limit);

          for (const pkg of packages || []) {
            if (linkedIds.has(`package:${pkg.id}`)) continue;

            let confidence = 0;
            const pkgTitle = pkg.title.toLowerCase();
            const pkgDest = (pkg.destination || '').toLowerCase();

            if (pkgTitle.includes(villageName) || pkgDest.includes(villageName)) {
              confidence = 0.7;
            } else if (pkg.village_ids && pkg.village_ids.includes(village_id)) {
              confidence = 1.0;
            }

            if (confidence > 0.3) {
              suggestions.push({
                job_id: job.id,
                village_id,
                item_type: 'package',
                item_id: pkg.id,
                confidence,
                source: mode,
                candidate_data: { name: pkg.title }
              });
            }
          }

          // Find products
          const { data: products } = await supabase
            .from('local_products')
            .select('id, name, village_id')
            .eq('is_active', true)
            .limit(limit);

          for (const prod of products || []) {
            if (linkedIds.has(`product:${prod.id}`)) continue;

            let confidence = 0;
            const prodName = prod.name.toLowerCase();

            if (prodName.includes(villageName)) {
              confidence = 0.6;
            } else if (prod.village_id === village_id) {
              confidence = 1.0;
            }

            if (confidence > 0.3) {
              suggestions.push({
                job_id: job.id,
                village_id,
                item_type: 'product',
                item_id: prod.id,
                confidence,
                source: mode,
                candidate_data: { name: prod.name }
              });
            }
          }

          // Insert suggestions
          if (suggestions.length > 0) {
            await supabase
              .from('village_link_suggestions')
              .insert(suggestions);
          }

          // Update job as finished
          await supabase
            .from('village_link_jobs')
            .update({
              status: 'finished',
              completed_at: new Date().toISOString(),
              suggestion_count: suggestions.length
            })
            .eq('id', job.id);

        } catch (err) {
          console.error('Job processing error:', err);
          await supabase
            .from('village_link_jobs')
            .update({
              status: 'failed',
              error_message: err instanceof Error ? err.message : 'Unknown error'
            })
            .eq('id', job.id);
        }
      };

      // Run job in background (fire and forget)
      processJob();

      return new Response(JSON.stringify({ 
        jobId: job.id,
        status: 'queued',
        message: 'Auto-link job started'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route: GET /village-links/job/:jobId
    if (req.method === 'GET' && pathParts.includes('job')) {
      const jobId = pathParts[pathParts.indexOf('job') + 1];
      
      const { data: job, error } = await supabase
        .from('village_link_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: suggestions } = await supabase
        .from('village_link_suggestions')
        .select('*')
        .eq('job_id', jobId)
        .order('confidence', { ascending: false });

      return new Response(JSON.stringify({ job, suggestions: suggestions || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route: POST /village-links/commit
    if (req.method === 'POST' && pathParts.includes('commit')) {
      const { job_id, suggestion_ids } = body;

      if (!job_id || !suggestion_ids?.length) {
        return new Response(JSON.stringify({ error: 'job_id and suggestion_ids required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get suggestions
      const { data: suggestions, error: sugError } = await supabase
        .from('village_link_suggestions')
        .select('*')
        .in('id', suggestion_ids)
        .eq('job_id', job_id);

      if (sugError || !suggestions?.length) {
        return new Response(JSON.stringify({ error: 'Suggestions not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = { committed: 0, errors: [] as string[] };

      for (const sug of suggestions) {
        try {
          // Upsert link
          const { data: link, error: linkError } = await supabase
            .from('village_links')
            .upsert({
              village_id: sug.village_id,
              item_type: sug.item_type,
              item_id: sug.item_id,
              status: 'linked',
              created_by: user.id
            }, { onConflict: 'village_id,item_type,item_id' })
            .select()
            .single();

          if (linkError) throw linkError;

          // Write audit
          await supabase.from('village_link_audit').insert({
            village_id: sug.village_id,
            item_type: sug.item_type,
            item_id: sug.item_id,
            action: 'link',
            after_state: link,
            changed_by: user.id,
            reason: `Auto-linked from job ${job_id}`
          });

          // Mark suggestion as committed
          await supabase
            .from('village_link_suggestions')
            .update({ status: 'committed' })
            .eq('id', sug.id);

          results.committed++;
        } catch (err) {
          results.errors.push(`Failed to commit ${sug.item_type}:${sug.item_id}`);
        }
      }

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route: POST /village-links/bulk-import
    if (req.method === 'POST' && pathParts.includes('bulk-import')) {
      const { village_id, items } = body;

      if (!village_id || !items?.length) {
        return new Response(JSON.stringify({ error: 'village_id and items required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = { success: 0, errors: [] as { row: number; error: string }[] };
      const validTypes = ['provider', 'listing', 'package', 'product'];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const row = i + 1;

        // Validate
        if (!item.item_type || !validTypes.includes(item.item_type)) {
          results.errors.push({ row, error: `Invalid item_type: ${item.item_type}` });
          continue;
        }
        if (!item.item_id) {
          results.errors.push({ row, error: 'Missing item_id' });
          continue;
        }

        try {
          const { data: link, error } = await supabase
            .from('village_links')
            .upsert({
              village_id,
              item_type: item.item_type,
              item_id: item.item_id,
              promote: item.promote === true || item.promote === 'true',
              priority: parseInt(item.priority) || 0,
              status: 'linked',
              created_by: user.id
            }, { onConflict: 'village_id,item_type,item_id' })
            .select()
            .single();

          if (error) throw error;

          await supabase.from('village_link_audit').insert({
            village_id,
            item_type: item.item_type,
            item_id: item.item_id,
            action: 'link',
            after_state: link,
            changed_by: user.id,
            reason: 'Bulk import'
          });

          results.success++;
        } catch (err) {
          results.errors.push({ row, error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route: POST /village-links/rollback (SUPER_ADMIN only)
    if (req.method === 'POST' && pathParts.includes('rollback')) {
      if (profile.role !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Super admin required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { audit_id, reason } = body;

      if (!audit_id) {
        return new Response(JSON.stringify({ error: 'audit_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get audit entry
      const { data: audit, error: auditError } = await supabase
        .from('village_link_audit')
        .select('*')
        .eq('id', audit_id)
        .single();

      if (auditError || !audit) {
        return new Response(JSON.stringify({ error: 'Audit entry not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Revert based on action
        if (audit.action === 'link' || audit.action === 'update') {
          if (audit.before_state) {
            // Restore previous state
            await supabase
              .from('village_links')
              .upsert(audit.before_state, { onConflict: 'village_id,item_type,item_id' });
          } else {
            // Was a new link, so delete it
            await supabase
              .from('village_links')
              .delete()
              .eq('village_id', audit.village_id)
              .eq('item_type', audit.item_type)
              .eq('item_id', audit.item_id);
          }
        } else if (audit.action === 'unlink') {
          // Restore the link
          if (audit.before_state) {
            await supabase
              .from('village_links')
              .upsert({
                ...audit.before_state,
                status: 'linked'
              }, { onConflict: 'village_id,item_type,item_id' });
          }
        }

        // Log rollback action
        await supabase.from('village_link_audit').insert({
          village_id: audit.village_id,
          item_type: audit.item_type,
          item_id: audit.item_id,
          action: 'rollback',
          before_state: audit.after_state,
          after_state: audit.before_state,
          changed_by: user.id,
          reason: reason || `Rollback of audit ${audit_id}`
        });

        return new Response(JSON.stringify({ success: true, message: 'Rollback completed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Rollback failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Route: POST /village-links/purge (SUPER_ADMIN only)
    if (req.method === 'POST' && pathParts.includes('purge')) {
      if (profile.role !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Super admin required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { village_slug } = body;
      
      // Log purge request (actual CDN purge would depend on hosting setup)
      console.log(`Cache purge requested for village: ${village_slug}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Cache purge initiated for ${village_slug}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
