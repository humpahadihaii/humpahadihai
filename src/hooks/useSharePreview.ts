import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SharePreview {
  title: string;
  description: string;
  image_url: string | null;
  og_type: string;
  twitter_card: string;
  twitter_site: string;
  templates: Record<string, string>;
}

export interface SiteSharePreview {
  id: string;
  default_title: string;
  default_description: string;
  default_image_url: string | null;
  og_type: string;
  twitter_card: string;
  twitter_site: string;
  templates: Record<string, string>;
  updated_at: string;
}

export interface EntitySharePreview {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  og_type: string | null;
  twitter_card: string | null;
  templates: Record<string, string> | null;
  use_default: boolean;
  locale: string;
  updated_at: string;
}

// Fetch site-wide share preview defaults - OPTIMIZED with React Query
export function useSiteSharePreview() {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading: loading, refetch } = useQuery({
    queryKey: ['site-share-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_share_preview')
        .select('*')
        .eq('singleton_flag', true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as SiteSharePreview | null;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes cache
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
  });

  const updateSettings = async (updates: Partial<SiteSharePreview>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('site_share_preview')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('singleton_flag', true);

      if (error) throw error;
      toast.success('Share preview settings updated');
      queryClient.invalidateQueries({ queryKey: ['site-share-preview'] });
      return true;
    } catch (error) {
      console.error('Error updating site share preview:', error);
      toast.error('Failed to update settings');
      return false;
    }
  };

  return { loading, settings: settings || null, updateSettings, refetch };
}

// Fetch entity-specific share preview
export function useEntitySharePreview(entityType: string, entityId: string | null) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<EntitySharePreview | null>(null);

  const fetchPreview = async () => {
    if (!entityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entity_share_preview')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPreview(data as unknown as EntitySharePreview);
    } catch (error) {
      console.error('Error fetching entity share preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreview = async (data: Partial<EntitySharePreview>): Promise<boolean> => {
    if (!entityId) return false;

    try {
      const { data: existing } = await supabase
        .from('entity_share_preview')
        .select('id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('entity_share_preview')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('entity_share_preview')
          .insert({
            entity_type: entityType,
            entity_id: entityId,
            ...data,
          });

        if (error) throw error;
      }

      toast.success('Share preview saved');
      await fetchPreview();
      return true;
    } catch (error) {
      console.error('Error saving entity share preview:', error);
      toast.error('Failed to save share preview');
      return false;
    }
  };

  const revertToDefault = async (): Promise<boolean> => {
    if (!entityId) return false;

    try {
      const { error } = await supabase
        .from('entity_share_preview')
        .delete()
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;
      toast.success('Reverted to site defaults');
      setPreview(null);
      return true;
    } catch (error) {
      console.error('Error reverting share preview:', error);
      toast.error('Failed to revert');
      return false;
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [entityType, entityId]);

  return { loading, preview, savePreview, revertToDefault, refetch: fetchPreview };
}

// Track share click
export async function trackShareClick(entityType: string, entityId: string | null, channel: string) {
  try {
    await supabase.functions.invoke('share-preview', {
      body: { entity_type: entityType, entity_id: entityId, channel },
      method: 'POST',
    });
  } catch (error) {
    console.error('Error tracking share click:', error);
  }
}

// Generate share links with templates
export async function generateShareLinks(
  entityType: string,
  entityId: string | null,
  pageUrl: string,
  title: string,
  description: string
): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.functions.invoke('share-preview', {
      body: {
        entity_type: entityType,
        entity_id: entityId,
        page_url: pageUrl,
        title,
        description,
      },
      method: 'POST',
    });

    if (error) throw error;
    return data?.links || {};
  } catch (error) {
    console.error('Error generating share links:', error);
    // Return basic fallback links
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(title);
    return {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      copy: pageUrl,
    };
  }
}

// Fetch share click analytics
export function useShareClickAnalytics(dateRange: '7d' | '30d' | '90d' = '30d') {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalClicks: number;
    byChannel: { channel: string; count: number }[];
    byEntity: { entity_type: string; count: number }[];
    trend: { date: string; count: number }[];
  }>({
    totalClicks: 0,
    byChannel: [],
    byEntity: [],
    trend: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: clicks, error } = await supabase
        .from('share_clicks')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const totalClicks = clicks?.length || 0;

      // Group by channel
      const channelMap = new Map<string, number>();
      clicks?.forEach(click => {
        const count = channelMap.get(click.channel) || 0;
        channelMap.set(click.channel, count + 1);
      });
      const byChannel = Array.from(channelMap.entries())
        .map(([channel, count]) => ({ channel, count }))
        .sort((a, b) => b.count - a.count);

      // Group by entity type
      const entityMap = new Map<string, number>();
      clicks?.forEach(click => {
        const count = entityMap.get(click.entity_type) || 0;
        entityMap.set(click.entity_type, count + 1);
      });
      const byEntity = Array.from(entityMap.entries())
        .map(([entity_type, count]) => ({ entity_type, count }))
        .sort((a, b) => b.count - a.count);

      // Daily trend
      const dateMap = new Map<string, number>();
      clicks?.forEach(click => {
        const date = new Date(click.created_at).toISOString().split('T')[0];
        const count = dateMap.get(date) || 0;
        dateMap.set(date, count + 1);
      });
      const trend = Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setData({ totalClicks, byChannel, byEntity, trend });
    } catch (error) {
      console.error('Error fetching share click analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  return { loading, ...data, refetch: fetchData };
}