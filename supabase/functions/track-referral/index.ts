import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hash IP for privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(0, 16));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { ref_source, full_url, page_type, page_id } = body;

    if (!ref_source || !full_url || !page_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('cf-connecting-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Hash IP for privacy
    const ipHash = ip !== 'unknown' ? await hashIP(ip) : null;

    // Check for recent duplicate (within 24 hours)
    const { data: existingReferral } = await supabase
      .from('share_referrals')
      .select('id')
      .eq('ip_hash', ipHash)
      .eq('full_url', full_url)
      .eq('ref_source', ref_source)
      .gte('visited_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingReferral) {
      console.log('Duplicate referral within 24 hours, skipping');
      return new Response(
        JSON.stringify({ ok: true, duplicate: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert referral record
    const { error } = await supabase.from('share_referrals').insert({
      ref_source,
      full_url,
      page_type,
      page_id: page_id || null,
      ip_hash: ipHash,
      user_agent: userAgent,
      visited_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to insert referral:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track referral' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Tracked referral: ${ref_source} -> ${page_type}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-referral:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
