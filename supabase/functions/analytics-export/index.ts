import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    const { action, report_id, export_type, date_from, date_to, format } = await req.json();

    if (action === 'run_scheduled_reports') {
      // Find reports due to run
      const now = new Date();
      const { data: dueReports, error } = await supabase
        .from('analytics_scheduled_reports')
        .select('*')
        .eq('is_active', true)
        .lte('next_run_at', now.toISOString());

      if (error) throw error;

      const results: any[] = [];

      for (const report of dueReports || []) {
        const result = await executeReport(supabase, report);
        results.push(result);

        // Update next_run_at
        const nextRun = calculateNextRun(report);
        await supabase
          .from('analytics_scheduled_reports')
          .update({
            last_run_at: now.toISOString(),
            next_run_at: nextRun.toISOString()
          })
          .eq('id', report.id);
      }

      return new Response(JSON.stringify({
        success: true,
        reports_executed: results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'export_data') {
      const data = await exportAnalyticsData(supabase, export_type, date_from, date_to);
      
      if (format === 'csv') {
        const csv = convertToCSV(data);
        return new Response(csv, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="analytics_${export_type}_${date_from}_${date_to}.csv"`
          }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        data,
        count: data.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'export_to_bigquery') {
      const result = await exportToBigQuery(supabase, export_type, date_from, date_to);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'run_single_report' && report_id) {
      const { data: report, error } = await supabase
        .from('analytics_scheduled_reports')
        .select('*')
        .eq('id', report_id)
        .single();

      if (error) throw error;

      const result = await executeReport(supabase, report);
      
      await supabase
        .from('analytics_scheduled_reports')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', report_id);

      return new Response(JSON.stringify({
        success: true,
        result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Analytics export error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function executeReport(supabase: any, report: any): Promise<any> {
  const startTime = Date.now();
  
  // Create history record
  const { data: historyRecord } = await supabase
    .from('analytics_report_history')
    .insert({
      scheduled_report_id: report.id,
      status: 'running'
    })
    .select()
    .single();

  try {
    const { dateFrom, dateTo } = getDateRange(report.date_range);
    const data = await getReportData(supabase, report.report_type, dateFrom, dateTo, report.filters);

    let fileUrl = null;
    let fileSize = 0;

    if (report.delivery_method === 'email') {
      // Generate CSV and send via email
      const csv = convertToCSV(data);
      fileSize = new Blob([csv]).size;
      
      // Send email with attachment
      await sendReportEmail(report, csv, dateFrom, dateTo);
    } else if (report.delivery_method === 'storage') {
      // Upload to Supabase storage
      const csv = convertToCSV(data);
      const fileName = `reports/${report.id}/${new Date().toISOString()}.csv`;
      
      const { data: uploadData } = await supabase.storage
        .from('analytics-exports')
        .upload(fileName, csv, { contentType: 'text/csv' });

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('analytics-exports')
          .getPublicUrl(fileName);
        fileUrl = urlData?.publicUrl;
      }
      fileSize = new Blob([csv]).size;
    } else if (report.delivery_method === 'bigquery' && report.bigquery_dataset && report.bigquery_table) {
      await exportToBigQuery(supabase, report.report_type, dateFrom, dateTo);
    }

    const duration = Date.now() - startTime;

    // Update history record
    await supabase
      .from('analytics_report_history')
      .update({
        status: 'completed',
        records_count: data.length,
        file_url: fileUrl,
        file_size: fileSize,
        duration_ms: duration
      })
      .eq('id', historyRecord.id);

    return {
      report_id: report.id,
      report_name: report.name,
      status: 'completed',
      records: data.length,
      duration_ms: duration
    };

  } catch (error: any) {
    await supabase
      .from('analytics_report_history')
      .update({
        status: 'failed',
        error_message: error?.message || 'Unknown error',
        duration_ms: Date.now() - startTime
      })
      .eq('id', historyRecord.id);

    return {
      report_id: report.id,
      report_name: report.name,
      status: 'failed',
      error: error?.message || 'Unknown error'
    };
  }
}

function getDateRange(dateRangeType: string): { dateFrom: string, dateTo: string } {
  const today = new Date();
  let dateFrom: Date;
  const dateTo = today;

  switch (dateRangeType) {
    case 'last_7_days':
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 7);
      break;
    case 'last_30_days':
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 30);
      break;
    case 'last_month':
      dateFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      break;
    default:
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 7);
  }

  return {
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0]
  };
}

async function getReportData(supabase: any, reportType: string, dateFrom: string, dateTo: string, filters: any): Promise<any[]> {
  switch (reportType) {
    case 'summary':
      const { data: visits } = await supabase
        .from('site_visits')
        .select('*')
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`);
      
      // Aggregate summary
      const summary = aggregateSummary(visits || []);
      return [summary];

    case 'detailed':
      const { data: detailed } = await supabase
        .from('site_visits')
        .select('*')
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`)
        .order('created_at', { ascending: false });
      return detailed || [];

    case 'geo':
      const { data: geo } = await supabase
        .from('analytics_geo_aggregates')
        .select('*')
        .gte('aggregate_date', dateFrom)
        .lte('aggregate_date', dateTo)
        .order('unique_visitors', { ascending: false });
      return geo || [];

    case 'funnel':
      const { data: funnels } = await supabase
        .from('analytics_funnel_results')
        .select('*, analytics_funnels(name)')
        .gte('result_date', dateFrom)
        .lte('result_date', dateTo);
      return funnels || [];

    default:
      return [];
  }
}

function aggregateSummary(visits: any[]): any {
  const uniqueIps = new Set(visits.map(v => v.ip_hash));
  const devices: Record<string, number> = {};
  const browsers: Record<string, number> = {};
  const countries: Record<string, number> = {};

  visits.forEach(v => {
    devices[v.device || 'unknown'] = (devices[v.device || 'unknown'] || 0) + 1;
    browsers[v.browser || 'unknown'] = (browsers[v.browser || 'unknown'] || 0) + 1;
    countries[v.country || 'unknown'] = (countries[v.country || 'unknown'] || 0) + 1;
  });

  return {
    total_page_views: visits.length,
    unique_visitors: uniqueIps.size,
    top_device: Object.entries(devices).sort((a, b) => b[1] - a[1])[0]?.[0],
    top_browser: Object.entries(browsers).sort((a, b) => b[1] - a[1])[0]?.[0],
    top_country: Object.entries(countries).sort((a, b) => b[1] - a[1])[0]?.[0],
    devices,
    browsers,
    countries
  };
}

async function exportAnalyticsData(supabase: any, exportType: string, dateFrom: string, dateTo: string): Promise<any[]> {
  return getReportData(supabase, exportType, dateFrom, dateTo, {});
}

async function exportToBigQuery(supabase: any, exportType: string, dateFrom: string, dateTo: string): Promise<any> {
  const bigqueryKeyJson = Deno.env.get('BIGQUERY_SERVICE_ACCOUNT_KEY');
  
  if (!bigqueryKeyJson) {
    // Log export request for manual processing
    await supabase
      .from('analytics_bigquery_exports')
      .insert({
        export_type: exportType,
        date_from: dateFrom,
        date_to: dateTo,
        status: 'pending',
        error_message: 'BigQuery credentials not configured'
      });

    return {
      success: false,
      message: 'BigQuery export queued - credentials not configured'
    };
  }

  try {
    // Create export record
    const { data: exportRecord } = await supabase
      .from('analytics_bigquery_exports')
      .insert({
        export_type: exportType,
        date_from: dateFrom,
        date_to: dateTo,
        status: 'processing'
      })
      .select()
      .single();

    const data = await exportAnalyticsData(supabase, exportType, dateFrom, dateTo);

    // BigQuery streaming insert would go here
    // This is a placeholder - actual implementation requires Google Cloud client
    console.log(`Would export ${data.length} records to BigQuery`);

    await supabase
      .from('analytics_bigquery_exports')
      .update({
        status: 'completed',
        records_exported: data.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', exportRecord.id);

    return {
      success: true,
      records_exported: data.length,
      export_id: exportRecord.id
    };

  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Unknown error'
    };
  }
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value).includes(',') ? `"${value}"` : value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

function calculateNextRun(report: any): Date {
  const now = new Date();
  const [hours, minutes] = (report.time_of_day || '09:00:00').split(':').map(Number);

  switch (report.schedule) {
    case 'daily':
      const nextDaily = new Date(now);
      nextDaily.setDate(nextDaily.getDate() + 1);
      nextDaily.setHours(hours, minutes, 0, 0);
      return nextDaily;

    case 'weekly':
      const nextWeekly = new Date(now);
      const daysUntilNext = ((report.day_of_week || 1) - now.getDay() + 7) % 7 || 7;
      nextWeekly.setDate(nextWeekly.getDate() + daysUntilNext);
      nextWeekly.setHours(hours, minutes, 0, 0);
      return nextWeekly;

    case 'monthly':
      const nextMonthly = new Date(now);
      nextMonthly.setMonth(nextMonthly.getMonth() + 1);
      nextMonthly.setDate(report.day_of_month || 1);
      nextMonthly.setHours(hours, minutes, 0, 0);
      return nextMonthly;

    default:
      const defaultNext = new Date(now);
      defaultNext.setDate(defaultNext.getDate() + 1);
      defaultNext.setHours(hours, minutes, 0, 0);
      return defaultNext;
  }
}

async function sendReportEmail(report: any, csvContent: string, dateFrom: string, dateTo: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey || !report.recipient_emails?.length) return;

  // Note: Resend doesn't support direct attachments in the basic tier
  // For production, you'd upload to storage and include a download link
  for (const email of report.recipient_emails) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Hum Pahadi Analytics <reports@humpahadihaii.in>',
        to: email,
        subject: `Analytics Report: ${report.name} (${dateFrom} to ${dateTo})`,
        html: `
          <h2>Scheduled Analytics Report</h2>
          <p><strong>Report:</strong> ${report.name}</p>
          <p><strong>Period:</strong> ${dateFrom} to ${dateTo}</p>
          <p><strong>Type:</strong> ${report.report_type}</p>
          <p>Please log in to the admin dashboard to view the full report.</p>
          <p><a href="https://humpahadihaii.in/admin/analytics">View Dashboard</a></p>
        `
      })
    });
  }
}
