import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'all';
    const targetDate = url.searchParams.get('date') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Analytics worker running: action=${action}, date=${targetDate}`);

    const results: Record<string, unknown> = {};

    // 1. Extract session paths
    if (action === 'all' || action === 'paths') {
      const pathsResult = await extractSessionPaths(supabase, targetDate);
      results.paths = pathsResult;
    }

    // 2. Calculate funnel results
    if (action === 'all' || action === 'funnels') {
      const funnelsResult = await calculateFunnelResults(supabase, targetDate);
      results.funnels = funnelsResult;
    }

    // 3. Calculate retention cohorts
    if (action === 'all' || action === 'retention') {
      const retentionResult = await calculateRetentionCohorts(supabase, targetDate);
      results.retention = retentionResult;
    }

    // 4. Cleanup old data based on retention settings
    if (action === 'all' || action === 'cleanup') {
      const cleanupResult = await cleanupOldData(supabase);
      results.cleanup = cleanupResult;
    }

    console.log('Analytics worker completed:', results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics worker error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Extract session paths from events
async function extractSessionPaths(supabase: any, targetDate: string) {
  const startOfDay = `${targetDate}T00:00:00`;
  const endOfDay = `${targetDate}T23:59:59`;

  // Get all events for the day grouped by session
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('session_id, page_path, event_type, created_at')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return { error: error.message };
  }

  // Group events by session
  const sessionEvents: Record<string, any[]> = {};
  (events || []).forEach((event: any) => {
    if (!sessionEvents[event.session_id]) {
      sessionEvents[event.session_id] = [];
    }
    sessionEvents[event.session_id].push(event);
  });

  let pathsCreated = 0;
  const conversionEvents = ['booking', 'inquiry', 'purchase'];

  for (const [sessionId, sessionEvts] of Object.entries(sessionEvents)) {
    const pageViews = sessionEvts.filter(e => e.event_type === 'page_view');
    if (pageViews.length === 0) continue;

    const pathSequence = pageViews.map(e => e.page_path);
    const entryPage = pathSequence[0];
    const exitPage = pathSequence[pathSequence.length - 1];
    const hasConversion = sessionEvts.some(e => conversionEvents.includes(e.event_type));
    
    // Calculate duration
    const firstEvent = new Date(sessionEvts[0].created_at);
    const lastEvent = new Date(sessionEvts[sessionEvts.length - 1].created_at);
    const durationSeconds = Math.round((lastEvent.getTime() - firstEvent.getTime()) / 1000);

    // Upsert session path
    const { error: upsertError } = await supabase
      .from('analytics_session_paths')
      .upsert({
        session_id: sessionId,
        path_sequence: pathSequence,
        entry_page: entryPage,
        exit_page: exitPage,
        page_count: pathSequence.length,
        duration_seconds: durationSeconds,
        is_bounce: pathSequence.length === 1,
        has_conversion: hasConversion,
      }, { onConflict: 'session_id' });

    if (!upsertError) pathsCreated++;
  }

  return { sessions_processed: Object.keys(sessionEvents).length, paths_created: pathsCreated };
}

// Calculate funnel results for all active funnels
async function calculateFunnelResults(supabase: any, targetDate: string) {
  // Get all active funnels
  const { data: funnels, error: funnelsError } = await supabase
    .from('analytics_funnels')
    .select('*')
    .eq('is_active', true);

  if (funnelsError) {
    console.error('Error fetching funnels:', funnelsError);
    return { error: funnelsError.message };
  }

  if (!funnels || funnels.length === 0) {
    return { message: 'No active funnels' };
  }

  const startOfDay = `${targetDate}T00:00:00`;
  const endOfDay = `${targetDate}T23:59:59`;

  // Get session paths for the day
  const { data: paths } = await supabase
    .from('analytics_session_paths')
    .select('*')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);

  const sessionPaths = paths || [];
  let funnelsProcessed = 0;

  for (const funnel of funnels) {
    const steps = funnel.steps as Array<{ name: string; path_pattern: string }>;
    if (!steps || steps.length === 0) continue;

    const stepResults: Array<{ step: string; count: number; drop_off: number }> = [];
    let previousCount = sessionPaths.length;

    for (const step of steps) {
      const pattern = step.path_pattern;
      const matchingSessions = sessionPaths.filter((sp: any) => {
        return sp.path_sequence.some((path: string) => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(path);
          }
          return path === pattern || path.startsWith(pattern);
        });
      });

      const count = matchingSessions.length;
      stepResults.push({
        step: step.name,
        count,
        drop_off: previousCount - count,
      });
      previousCount = count;
    }

    const totalSessions = sessionPaths.length;
    const finalCount = stepResults[stepResults.length - 1]?.count || 0;
    const conversionRate = totalSessions > 0 ? (finalCount / totalSessions) * 100 : 0;

    // Upsert funnel result
    const { error: upsertError } = await supabase
      .from('analytics_funnel_results')
      .upsert({
        funnel_id: funnel.id,
        result_date: targetDate,
        step_results: stepResults,
        total_sessions: totalSessions,
        conversion_rate: conversionRate,
      }, { onConflict: 'funnel_id,result_date' });

    if (!upsertError) funnelsProcessed++;
  }

  return { funnels_processed: funnelsProcessed };
}

// Calculate retention cohorts
async function calculateRetentionCohorts(supabase: any, targetDate: string) {
  // Get unique visitors by first visit date (cohort)
  const { data: visits } = await supabase
    .from('page_unique_visits')
    .select('ip_hash, visit_date')
    .order('visit_date', { ascending: true });

  if (!visits || visits.length === 0) {
    return { message: 'No visits data' };
  }

  // Group visitors by their first visit date (cohort)
  const visitorFirstVisit: Record<string, string> = {};
  const cohortVisitors: Record<string, Set<string>> = {};

  (visits as any[]).forEach(visit => {
    const ipHash = visit.ip_hash;
    const visitDate = visit.visit_date;

    if (!visitorFirstVisit[ipHash]) {
      visitorFirstVisit[ipHash] = visitDate;
      if (!cohortVisitors[visitDate]) {
        cohortVisitors[visitDate] = new Set();
      }
      cohortVisitors[visitDate].add(ipHash);
    }
  });

  // Calculate retention for each cohort
  let cohortsProcessed = 0;

  for (const [cohortDate, visitors] of Object.entries(cohortVisitors)) {
    const cohortSize = visitors.size;
    if (cohortSize === 0) continue;

    // Calculate retention for days 1, 7, 14, 30
    const retentionDays = [1, 7, 14, 30];
    const retentionData: Record<string, number> = {};

    for (const days of retentionDays) {
      const targetRetentionDate = new Date(cohortDate);
      targetRetentionDate.setDate(targetRetentionDate.getDate() + days);
      const targetDateStr = targetRetentionDate.toISOString().split('T')[0];

      // Count how many cohort visitors returned on that day
      const returningVisitors = (visits as any[]).filter(v => 
        visitors.has(v.ip_hash) && v.visit_date === targetDateStr
      ).length;

      retentionData[`day_${days}`] = cohortSize > 0 ? (returningVisitors / cohortSize) * 100 : 0;
    }

    // Upsert retention cohort
    const { error } = await supabase
      .from('analytics_retention_cohorts')
      .upsert({
        cohort_date: cohortDate,
        cohort_size: cohortSize,
        retention_data: retentionData,
      }, { onConflict: 'cohort_date' });

    if (!error) cohortsProcessed++;
  }

  return { cohorts_processed: cohortsProcessed };
}

// Cleanup old data based on retention settings
async function cleanupOldData(supabase: any) {
  // Get retention settings
  const { data: settings } = await supabase
    .from('analytics_settings')
    .select('raw_event_retention_days, aggregate_retention_days')
    .single();

  const rawRetentionDays = settings?.raw_event_retention_days || 180;
  const aggregateRetentionDays = settings?.aggregate_retention_days || 730;

  const rawCutoff = new Date();
  rawCutoff.setDate(rawCutoff.getDate() - rawRetentionDays);
  const rawCutoffStr = rawCutoff.toISOString();

  const aggCutoff = new Date();
  aggCutoff.setDate(aggCutoff.getDate() - aggregateRetentionDays);
  const aggCutoffStr = aggCutoff.toISOString().split('T')[0];

  // Delete old raw events
  const { count: eventsDeleted } = await supabase
    .from('analytics_events')
    .delete()
    .lt('created_at', rawCutoffStr)
    .select('id', { count: 'exact', head: true });

  // Delete old session paths
  const { count: pathsDeleted } = await supabase
    .from('analytics_session_paths')
    .delete()
    .lt('created_at', rawCutoffStr)
    .select('id', { count: 'exact', head: true });

  // Delete old heatmap aggregates
  const { count: heatmapsDeleted } = await supabase
    .from('analytics_heatmap_aggregates')
    .delete()
    .lt('aggregate_date', aggCutoffStr)
    .select('id', { count: 'exact', head: true });

  return {
    events_deleted: eventsDeleted || 0,
    paths_deleted: pathsDeleted || 0,
    heatmaps_deleted: heatmapsDeleted || 0,
    raw_retention_days: rawRetentionDays,
    aggregate_retention_days: aggregateRetentionDays,
  };
}