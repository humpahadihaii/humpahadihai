import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET: Public endpoint - return sanitized config
    if (req.method === "GET") {
      // Fetch settings
      const { data: settings, error: settingsError } = await supabase
        .from("booking_notify_settings")
        .select("*")
        .eq("singleton_flag", true)
        .single();

      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch settings" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch active templates
      const { data: templates, error: templatesError } = await supabase
        .from("booking_notify_templates")
        .select("key, template")
        .eq("is_active", true);

      if (templatesError) {
        console.error("Error fetching templates:", templatesError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch templates" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Convert templates to object
      const templatesMap: Record<string, string> = {};
      templates?.forEach((t) => {
        templatesMap[t.key] = t.template;
      });

      // Return sanitized config (exclude sensitive admin-only fields)
      const sanitizedConfig = {
        enabled_whatsapp: settings.enabled_whatsapp,
        enabled_email: settings.enabled_email,
        whatsapp_label: settings.whatsapp_label,
        email_label: settings.email_label,
        admin_fallback_phone: settings.admin_fallback_phone,
        admin_fallback_email: settings.admin_fallback_email,
        phone_min_digits: settings.phone_min_digits,
        default_language: settings.default_language,
        show_confirm_question: settings.show_confirm_question,
        position_order: settings.position_order,
        visibility: settings.visibility,
        config_version: settings.config_version,
        templates: templatesMap,
      };

      return new Response(JSON.stringify(sanitizedConfig), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
