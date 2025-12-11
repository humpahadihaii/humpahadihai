import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookingNotifySettings {
  id: string;
  enabled_whatsapp: boolean;
  enabled_email: boolean;
  whatsapp_label: string;
  email_label: string;
  admin_fallback_phone: string | null;
  admin_fallback_email: string | null;
  allow_server_fallback: boolean;
  server_fallback_rate_limit_per_hour: number;
  phone_min_digits: number;
  default_language: string;
  show_confirm_question: boolean;
  position_order: string[];
  visibility: Record<string, boolean>;
  config_version: number;
  created_at: string;
  updated_at: string;
}

export interface BookingNotifyTemplate {
  id: string;
  key: string;
  template: string;
  description: string | null;
  version: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface BookingNotifyAudit {
  id: string;
  setting_id: string | null;
  template_id: string | null;
  changed_by: string | null;
  change_type: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PublicNotifyConfig {
  enabled_whatsapp: boolean;
  enabled_email: boolean;
  whatsapp_label: string;
  email_label: string;
  admin_fallback_phone: string | null;
  admin_fallback_email: string | null;
  phone_min_digits: number;
  default_language: string;
  show_confirm_question: boolean;
  position_order: string[];
  visibility: Record<string, boolean>;
  config_version: number;
  templates: Record<string, string>;
}

// Public hook - fetches config via edge function (no auth required)
export function usePublicNotifyConfig() {
  return useQuery<PublicNotifyConfig>({
    queryKey: ["booking-notify-config-public"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("booking-notify-config", {
        method: "GET",
      });
      if (error) throw error;
      return data as PublicNotifyConfig;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}

// Admin hook - fetches full settings (requires auth)
export function useAdminNotifySettings() {
  return useQuery<BookingNotifySettings | null>({
    queryKey: ["booking-notify-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_notify_settings")
        .select("*")
        .eq("singleton_flag", true)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // No rows
        throw error;
      }
      return data as BookingNotifySettings;
    },
  });
}

// Admin hook - fetches all templates (requires auth)
export function useAdminNotifyTemplates() {
  return useQuery<BookingNotifyTemplate[]>({
    queryKey: ["booking-notify-templates-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_notify_templates")
        .select("*")
        .order("key", { ascending: true });
      
      if (error) throw error;
      return data as BookingNotifyTemplate[];
    },
  });
}

// Admin hook - fetches audit logs (requires super_admin)
export function useAdminNotifyAudit() {
  return useQuery<BookingNotifyAudit[]>({
    queryKey: ["booking-notify-audit-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_notify_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as BookingNotifyAudit[];
    },
  });
}

// Mutation to update settings
export function useUpdateNotifySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<BookingNotifySettings>) => {
      // Get current settings for audit
      const { data: current } = await supabase
        .from("booking_notify_settings")
        .select("*")
        .eq("singleton_flag", true)
        .single();

      // Update settings
      const { data, error } = await supabase
        .from("booking_notify_settings")
        .update({
          ...updates,
          config_version: (current?.config_version || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("singleton_flag", true)
        .select()
        .single();

      if (error) throw error;

      // Log audit entry
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("booking_notify_audit").insert({
        setting_id: data.id,
        changed_by: user?.id,
        change_type: "settings_update",
        before_value: current,
        after_value: data,
        user_agent: navigator.userAgent,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-notify-settings-admin"] });
      queryClient.invalidateQueries({ queryKey: ["booking-notify-config-public"] });
    },
  });
}

// Mutation to update a template (creates new version)
export function useUpdateNotifyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, template, description }: { key: string; template: string; description?: string }) => {
      // Deactivate current active version
      const { data: current } = await supabase
        .from("booking_notify_templates")
        .select("*")
        .eq("key", key)
        .eq("is_active", true)
        .single();

      if (current) {
        await supabase
          .from("booking_notify_templates")
          .update({ is_active: false })
          .eq("id", current.id);
      }

      // Insert new version
      const { data: { user } } = await supabase.auth.getUser();
      const newVersion = (current?.version || 0) + 1;

      const { data, error } = await supabase
        .from("booking_notify_templates")
        .insert({
          key,
          template,
          description: description || current?.description,
          version: newVersion,
          is_active: true,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit entry
      await supabase.from("booking_notify_audit").insert({
        template_id: data.id,
        changed_by: user?.id,
        change_type: "template_update",
        before_value: current ? { key: current.key, template: current.template, version: current.version } : null,
        after_value: { key: data.key, template: data.template, version: data.version },
        user_agent: navigator.userAgent,
      });

      // Increment config version
      await supabase
        .from("booking_notify_settings")
        .update({ config_version: supabase.rpc ? 1 : 1 })
        .eq("singleton_flag", true);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-notify-templates-admin"] });
      queryClient.invalidateQueries({ queryKey: ["booking-notify-config-public"] });
    },
  });
}

// Rollback template to a previous version
export function useRollbackTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, targetVersion }: { key: string; targetVersion: number }) => {
      // Find the target version
      const { data: targetTemplate } = await supabase
        .from("booking_notify_templates")
        .select("*")
        .eq("key", key)
        .eq("version", targetVersion)
        .single();

      if (!targetTemplate) throw new Error("Target version not found");

      // Deactivate current active version
      await supabase
        .from("booking_notify_templates")
        .update({ is_active: false })
        .eq("key", key)
        .eq("is_active", true);

      // Activate target version
      const { data, error } = await supabase
        .from("booking_notify_templates")
        .update({ is_active: true })
        .eq("id", targetTemplate.id)
        .select()
        .single();

      if (error) throw error;

      // Log audit entry
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("booking_notify_audit").insert({
        template_id: data.id,
        changed_by: user?.id,
        change_type: "template_rollback",
        before_value: { rolled_back_to_version: targetVersion },
        after_value: { key: data.key, version: data.version },
        user_agent: navigator.userAgent,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-notify-templates-admin"] });
      queryClient.invalidateQueries({ queryKey: ["booking-notify-config-public"] });
    },
  });
}
