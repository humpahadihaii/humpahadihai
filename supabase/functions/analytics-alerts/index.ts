import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  comparison_period: string;
  page_filter: string | null;
  notification_channels: string[];
  recipient_emails: string[] | null;
  recipient_phones: string[] | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();

    if (action === 'check_alerts') {
      // Fetch active alert configs
      const { data: alerts, error: alertsError } = await supabase
        .from('analytics_alert_configs')
        .select('*')
        .eq('is_active', true);

      if (alertsError) throw alertsError;

      const today = new Date().toISOString().split('T')[0];
      const triggeredAlerts: any[] = [];

      for (const alert of (alerts as AlertConfig[])) {
        const currentValue = await getMetricValue(supabase, alert.metric, today, alert.page_filter);
        const comparisonValue = await getComparisonValue(supabase, alert.metric, alert.comparison_period, alert.page_filter);

        const shouldTrigger = evaluateCondition(alert.condition, currentValue, alert.threshold, comparisonValue);

        if (shouldTrigger) {
          // Log the alert
          const { data: logData } = await supabase
            .from('analytics_alert_logs')
            .insert({
              alert_config_id: alert.id,
              metric_value: currentValue,
              threshold_value: alert.threshold,
              comparison_value: comparisonValue,
              message: generateAlertMessage(alert, currentValue, comparisonValue),
              notification_status: {}
            })
            .select()
            .single();

          // Send notifications
          const notificationStatus: Record<string, string> = {};

          if (alert.notification_channels.includes('email') && alert.recipient_emails?.length) {
            try {
              await sendEmailNotification(alert, currentValue, comparisonValue);
              notificationStatus.email = 'sent';
            } catch (e) {
              notificationStatus.email = 'failed';
              console.error('Email notification failed:', e);
            }
          }

          if (alert.notification_channels.includes('whatsapp') && alert.recipient_phones?.length) {
            try {
              await sendWhatsAppNotification(alert, currentValue, comparisonValue);
              notificationStatus.whatsapp = 'sent';
            } catch (e) {
              notificationStatus.whatsapp = 'failed';
              console.error('WhatsApp notification failed:', e);
            }
          }

          // Update notification status
          if (logData) {
            await supabase
              .from('analytics_alert_logs')
              .update({ notification_status: notificationStatus })
              .eq('id', logData.id);
          }

          triggeredAlerts.push({
            alert_id: alert.id,
            alert_name: alert.name,
            current_value: currentValue,
            threshold: alert.threshold,
            notification_status: notificationStatus
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        alerts_checked: alerts?.length || 0,
        alerts_triggered: triggeredAlerts.length,
        triggered: triggeredAlerts
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'aggregate_geo') {
      // Aggregate geo data from site_visits
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const { data: visits, error: visitsError } = await supabase
        .from('site_visits')
        .select('country, ip_hash')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${dateStr}T23:59:59`);

      if (visitsError) throw visitsError;

      // Aggregate by country
      const geoData: Record<string, { unique: Set<string>, sessions: number, pageViews: number }> = {};

      for (const visit of visits || []) {
        const country = visit.country || 'Unknown';
        if (!geoData[country]) {
          geoData[country] = { unique: new Set(), sessions: 0, pageViews: 1 };
        }
        if (visit.ip_hash) {
          geoData[country].unique.add(visit.ip_hash);
        }
        geoData[country].pageViews++;
      }

      // Insert aggregates
      for (const [country, data] of Object.entries(geoData)) {
        await supabase
          .from('analytics_geo_aggregates')
          .upsert({
            aggregate_date: dateStr,
            country,
            state: null,
            city: null,
            unique_visitors: data.unique.size,
            sessions: Math.ceil(data.unique.size * 1.2), // Estimate
            page_views: data.pageViews,
            conversions: 0,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'aggregate_date,country,state,city'
          });
      }

      return new Response(JSON.stringify({
        success: true,
        date: dateStr,
        countries_processed: Object.keys(geoData).length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Analytics alerts error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getMetricValue(supabase: any, metric: string, date: string, pageFilter: string | null): Promise<number> {
  let query = supabase.from('site_visits').select('ip_hash', { count: 'exact' });
  
  query = query.gte('created_at', `${date}T00:00:00`).lt('created_at', `${date}T23:59:59`);
  
  if (pageFilter) {
    query = query.eq('url', pageFilter);
  }

  const { count } = await query;

  switch (metric) {
    case 'unique_visitors':
      const { data: uniqueData } = await supabase
        .from('site_visits')
        .select('ip_hash')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);
      const uniqueSet = new Set((uniqueData || []).map((v: any) => v.ip_hash));
      return uniqueSet.size;
    case 'page_views':
      return count || 0;
    case 'sessions':
      return Math.ceil((count || 0) * 0.7);
    case 'conversions':
      const { count: convCount } = await supabase
        .from('bookings_summary')
        .select('id', { count: 'exact' })
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);
      return convCount || 0;
    default:
      return 0;
  }
}

async function getComparisonValue(supabase: any, metric: string, period: string, pageFilter: string | null): Promise<number> {
  const today = new Date();
  let compareDate: Date;

  switch (period) {
    case 'previous_week':
      compareDate = new Date(today.setDate(today.getDate() - 7));
      break;
    case 'previous_month':
      compareDate = new Date(today.setMonth(today.getMonth() - 1));
      break;
    default: // previous_day
      compareDate = new Date(today.setDate(today.getDate() - 1));
  }

  return getMetricValue(supabase, metric, compareDate.toISOString().split('T')[0], pageFilter);
}

function evaluateCondition(condition: string, currentValue: number, threshold: number, comparisonValue: number): boolean {
  switch (condition) {
    case 'greater_than':
      return currentValue > threshold;
    case 'less_than':
      return currentValue < threshold;
    case 'equals':
      return currentValue === threshold;
    case 'change_percent':
      if (comparisonValue === 0) return currentValue > 0;
      const changePercent = ((currentValue - comparisonValue) / comparisonValue) * 100;
      return Math.abs(changePercent) >= threshold;
    default:
      return false;
  }
}

function generateAlertMessage(alert: AlertConfig, currentValue: number, comparisonValue: number): string {
  const conditionText = {
    greater_than: 'exceeded',
    less_than: 'dropped below',
    equals: 'reached',
    change_percent: 'changed by'
  }[alert.condition] || 'triggered';

  return `Alert "${alert.name}": ${alert.metric} ${conditionText} threshold. Current: ${currentValue}, Threshold: ${alert.threshold}, Previous: ${comparisonValue}`;
}

async function sendEmailNotification(alert: AlertConfig, currentValue: number, comparisonValue: number): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return;
  }

  const message = generateAlertMessage(alert, currentValue, comparisonValue);

  for (const email of alert.recipient_emails || []) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Hum Pahadi Analytics <analytics@humpahadihaii.in>',
        to: email,
        subject: `Analytics Alert: ${alert.name}`,
        html: `
          <h2>Analytics Alert Triggered</h2>
          <p><strong>Alert:</strong> ${alert.name}</p>
          <p><strong>Metric:</strong> ${alert.metric}</p>
          <p><strong>Current Value:</strong> ${currentValue}</p>
          <p><strong>Threshold:</strong> ${alert.threshold}</p>
          <p><strong>Previous Value:</strong> ${comparisonValue}</p>
          <p>${message}</p>
          <p><a href="https://humpahadihaii.in/admin/analytics">View Dashboard</a></p>
        `
      })
    });
  }
}

async function sendWhatsAppNotification(alert: AlertConfig, currentValue: number, comparisonValue: number): Promise<void> {
  const whatsappNumber = Deno.env.get('WHATSAPP_BUSINESS_NUMBER');
  const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN');
  
  if (!whatsappNumber || !whatsappToken) {
    console.log('WhatsApp credentials not configured, skipping');
    return;
  }

  const message = generateAlertMessage(alert, currentValue, comparisonValue);

  for (const phone of alert.recipient_phones || []) {
    // WhatsApp Business API integration
    await fetch(`https://graph.facebook.com/v17.0/${whatsappNumber}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message }
      })
    });
  }
}
