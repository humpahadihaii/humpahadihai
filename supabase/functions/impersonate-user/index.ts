import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user client to verify caller
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user: caller }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !caller) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify caller is super_admin
    const { data: isSuperAdmin } = await supabaseAdmin.rpc('has_role', {
      _user_id: caller.id,
      _role: 'super_admin'
    });

    if (!isSuperAdmin) {
      console.error("Access denied: user is not super_admin");
      return new Response(
        JSON.stringify({ success: false, error: "Access denied. Only Super Admins can impersonate users." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, targetUserId, reason, sessionToken } = await req.json();

    // Get client info
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     null;
    const userAgent = req.headers.get("user-agent") || null;

    if (action === "start") {
      // Validate target user exists
      if (!targetUserId) {
        return new Response(
          JSON.stringify({ success: false, error: "Target user ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if caller is trying to impersonate themselves
      if (targetUserId === caller.id) {
        return new Response(
          JSON.stringify({ success: false, error: "Cannot impersonate yourself" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if target user exists
      const { data: targetProfile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", targetUserId)
        .single();

      if (profileError || !targetProfile) {
        return new Response(
          JSON.stringify({ success: false, error: "Target user not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for existing active impersonation by this admin
      const { data: existingSession } = await supabaseAdmin
        .from("admin_impersonations")
        .select("id")
        .eq("super_admin_id", caller.id)
        .is("ended_at", null)
        .limit(1);

      if (existingSession && existingSession.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: "You already have an active impersonation session. Please end it first." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate a unique session token
      const newSessionToken = crypto.randomUUID();

      // Get target user's roles
      const { data: targetRoles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUserId);

      // Create impersonation record
      const { data: impersonation, error: insertError } = await supabaseAdmin
        .from("admin_impersonations")
        .insert({
          super_admin_id: caller.id,
          impersonated_user_id: targetUserId,
          reason: reason || null,
          start_ip: clientIp,
          start_ua: userAgent,
          session_token: newSessionToken,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create impersonation record:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to start impersonation session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log the activity
      await supabaseAdmin.from("admin_activity_logs").insert({
        user_id: caller.id,
        user_email: caller.email!,
        entity_type: "impersonation",
        entity_id: impersonation.id,
        action: "create",
        summary: `Started impersonating ${targetProfile.email}${reason ? ` - Reason: ${reason}` : ""}`,
        metadata: {
          target_user_id: targetUserId,
          target_email: targetProfile.email,
          reason,
        }
      });

      console.log(`Super Admin ${caller.email} started impersonating ${targetProfile.email}`);

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken: newSessionToken,
          impersonationId: impersonation.id,
          targetUser: {
            id: targetProfile.id,
            email: targetProfile.email,
            fullName: targetProfile.full_name,
            roles: targetRoles?.map(r => r.role) || [],
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "stop") {
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ success: false, error: "Session token is required to stop impersonation" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find and update the impersonation record
      const { data: impersonation, error: findError } = await supabaseAdmin
        .from("admin_impersonations")
        .select("id, impersonated_user_id")
        .eq("super_admin_id", caller.id)
        .eq("session_token", sessionToken)
        .is("ended_at", null)
        .single();

      if (findError || !impersonation) {
        console.error("Impersonation session not found:", findError);
        return new Response(
          JSON.stringify({ success: false, error: "Impersonation session not found or already ended" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get target user info for logging
      const { data: targetProfile } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", impersonation.impersonated_user_id)
        .single();

      // End the impersonation
      const { error: updateError } = await supabaseAdmin
        .from("admin_impersonations")
        .update({
          ended_at: new Date().toISOString(),
          end_ip: clientIp,
          end_ua: userAgent,
        })
        .eq("id", impersonation.id);

      if (updateError) {
        console.error("Failed to end impersonation:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to end impersonation session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log the activity
      await supabaseAdmin.from("admin_activity_logs").insert({
        user_id: caller.id,
        user_email: caller.email!,
        entity_type: "impersonation",
        entity_id: impersonation.id,
        action: "update",
        summary: `Stopped impersonating ${targetProfile?.email || "user"}`,
        metadata: {
          target_user_id: impersonation.impersonated_user_id,
          target_email: targetProfile?.email,
        }
      });

      console.log(`Super Admin ${caller.email} stopped impersonating ${targetProfile?.email}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action. Use 'start' or 'stop'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in impersonate-user function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
