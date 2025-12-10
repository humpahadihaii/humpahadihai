import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsSettings {
  id: string;
  analytics_enabled: boolean;
  ad_personalization_enabled: boolean;
  anonymize_ip: boolean;
  updated_at: string;
}

export function useAnalyticsSettings() {
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error('Error fetching analytics settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to load analytics settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AnalyticsSettings>) => {
    if (!settings?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('analytics_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Settings Updated',
        description: 'Analytics settings have been saved. Changes may take effect on next page load.',
      });
    } catch (err) {
      console.error('Error updating analytics settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to update analytics settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings,
  };
}
