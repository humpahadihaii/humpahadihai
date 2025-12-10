import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GAEventRequest {
  event_name: string;
  params: Record<string, string | number | boolean>;
  client_id: string;
  user_id_hash?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const measurementId = Deno.env.get('GA4_MEASUREMENT_ID');
    const apiSecret = Deno.env.get('GA4_API_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if analytics is enabled
    const { data: settings } = await supabase
      .from('analytics_settings')
      .select('analytics_enabled')
      .limit(1)
      .single();

    if (!settings?.analytics_enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Analytics disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!measurementId || !apiSecret) {
      console.log('GA4 credentials not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'GA4 not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GAEventRequest = await req.json();
    const { event_name, params, client_id, user_id_hash } = body;

    if (!event_name || !client_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event_name, client_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log event to database first
    const { data: eventRecord, error: insertError } = await supabase
      .from('ga_events')
      .insert({
        event_name,
        payload: params,
        client_id,
        user_id_hash: user_id_hash || null,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to log event:', insertError);
    }

    // Prepare GA4 Measurement Protocol payload
    const gaPayload = {
      client_id,
      user_id: user_id_hash || undefined,
      events: [
        {
          name: event_name,
          params: {
            ...params,
            engagement_time_msec: 100,
          },
        },
      ],
    };

    // Send to GA4 Measurement Protocol
    const gaUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    
    const gaResponse = await fetch(gaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gaPayload),
    });

    const responseStatus = gaResponse.ok ? 'sent' : 'failed';
    const gaResponseText = await gaResponse.text();

    // Update event status in database
    if (eventRecord) {
      await supabase
        .from('ga_events')
        .update({
          status: responseStatus,
          ga_response: { status: gaResponse.status, body: gaResponseText },
          sent_at: responseStatus === 'sent' ? new Date().toISOString() : null,
        })
        .eq('id', eventRecord.id);
    }

    console.log(`GA4 event ${event_name} - Status: ${responseStatus}`);

    return new Response(
      JSON.stringify({ 
        success: gaResponse.ok, 
        event_id: eventRecord?.id,
        status: responseStatus,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing GA event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
