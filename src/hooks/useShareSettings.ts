import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShareDefaults {
  title_suffix: string;
  default_description: string;
  default_image_url: string | null;
  site_name: string;
  twitter_site: string;
  locale: string;
}

export interface PlatformTemplate {
  enabled: boolean;
  title_template: string;
  description_template: string;
  image_url?: string | null;
  card_type?: string;
  hashtags?: string[];
  subject_template?: string;
  body_template?: string;
}

export interface ShareSettings {
  defaults: ShareDefaults;
  templates: Record<string, PlatformTemplate>;
}

export interface EntityShareSettings {
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  seo_schema: any | null;
  share_templates: Record<string, Partial<PlatformTemplate>> | null;
}

export interface AuditEntry {
  id: string;
  changed_by: string;
  entity_type: string;
  entity_id: string | null;
  change_type: string;
  before_value: any;
  after_value: any;
  created_at: string;
  profiles?: { email: string; full_name: string };
}

export function useShareSettings() {
  return useQuery({
    queryKey: ['share-settings'],
    queryFn: async (): Promise<ShareSettings> => {
      // Fetch defaults from site_share_settings directly
      const { data: settingsData, error } = await supabase
        .from('site_share_settings')
        .select('*');
      
      if (error) throw error;
      
      const result: Record<string, any> = {};
      settingsData?.forEach((s: { key: string; value: any }) => {
        result[s.key] = s.value;
      });
      
      return result as ShareSettings;
    }
  });
}

export function useUpdateShareSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Upsert directly to the database
      const { error } = await supabase
        .from('site_share_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
          updated_by: session.user.id
        }, { onConflict: 'key' });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-settings'] });
      toast({ title: 'Settings updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update settings', description: String(error), variant: 'destructive' });
    }
  });
}

export function useEntityShareSettings(entityType: string, entityId: string | undefined) {
  return useQuery({
    queryKey: ['entity-share-settings', entityType, entityId],
    queryFn: async (): Promise<EntityShareSettings | null> => {
      if (!entityId) return null;
      const { data, error } = await supabase.functions.invoke(`share-settings/entity/${entityType}/${entityId}`, {
        method: 'GET'
      });
      if (error) throw error;
      return data as EntityShareSettings;
    },
    enabled: !!entityId
  });
}

export function useUpdateEntityShareSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ entityType, entityId, settings }: { entityType: string; entityId: string; settings: Partial<EntityShareSettings> }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke(`share-settings/entity/${entityType}/${entityId}`, {
        method: 'PUT',
        body: settings,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entity-share-settings', variables.entityType, variables.entityId] });
      toast({ title: 'SEO settings updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update SEO settings', description: String(error), variant: 'destructive' });
    }
  });
}

export function usePurgeSocialCache() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pageUrl: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('share-settings/purge', {
        method: 'POST',
        body: { pageUrl },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Cache purge initiated',
        description: 'Check the debug URLs to verify the update'
      });
    },
    onError: (error) => {
      toast({ title: 'Failed to purge cache', description: String(error), variant: 'destructive' });
    }
  });
}

export function useShareAudit(options?: { entityType?: string; entityId?: string; limit?: number }) {
  return useQuery({
    queryKey: ['share-audit', options],
    queryFn: async (): Promise<AuditEntry[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (options?.entityType) params.set('entity_type', options.entityType);
      if (options?.entityId) params.set('entity_id', options.entityId);
      if (options?.limit) params.set('limit', String(options.limit));

      const { data, error } = await supabase.functions.invoke(`share-settings/audit?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) throw error;
      return data as AuditEntry[];
    }
  });
}

export function useShareAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['share-analytics', days],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke(`share-settings/analytics?days=${days}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) throw error;
      return data;
    }
  });
}

export function useTrackShare() {
  return useMutation({
    mutationFn: async ({ entityType, entityId, platform, url }: { entityType: string; entityId: string; platform: string; url: string }) => {
      const { data, error } = await supabase.functions.invoke('share-settings/track', {
        method: 'POST',
        body: { entity_type: entityType, entity_id: entityId, platform, url }
      });
      if (error) throw error;
      return data;
    }
  });
}

// Generate share URL with referral tracking
export function generateShareUrl(baseUrl: string, platform: string): string {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('ref', platform);
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  return url.toString();
}
