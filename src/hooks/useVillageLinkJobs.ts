import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VillageLinkJob {
  id: string;
  village_id: string;
  mode: string;
  status: 'queued' | 'running' | 'finished' | 'failed';
  radius_meters: number;
  suggestion_count: number;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface VillageLinkSuggestion {
  id: string;
  job_id: string;
  village_id: string;
  item_type: string;
  item_id: string;
  confidence: number;
  source: string;
  candidate_data: any;
  status: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  village_id: string;
  item_type: string;
  item_id: string;
  action: string;
  before_state: any;
  after_state: any;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export const useVillageLinkJobs = (villageId: string | undefined) => {
  const [jobs, setJobs] = useState<VillageLinkJob[]>([]);
  const [currentJob, setCurrentJob] = useState<VillageLinkJob | null>(null);
  const [suggestions, setSuggestions] = useState<VillageLinkSuggestion[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!villageId) return;
    
    const { data, error } = await (supabase as any)
      .from('village_link_jobs')
      .select('*')
      .eq('village_id', villageId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setJobs(data);
    }
  }, [villageId]);

  const fetchAuditLog = useCallback(async () => {
    if (!villageId) return;

    const { data, error } = await (supabase as any)
      .from('village_link_audit')
      .select('*')
      .eq('village_id', villageId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setAuditLog(data);
    }
  }, [villageId]);

  const startAutoLinkJob = async (mode: 'geo' | 'fuzzy' | 'ai' = 'fuzzy', radiusMeters = 3000) => {
    if (!villageId) return { success: false, error: 'No village ID' };

    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('village-links', {
        body: {
          village_id: villageId,
          mode,
          radius_meters: radiusMeters
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Auto-link job started');
      await fetchJobs();
      return { success: true, jobId: response.data?.jobId };
    } catch (error: any) {
      toast.error(error.message || 'Failed to start auto-link job');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('village-links', {
        body: null,
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      // For now, fetch directly from Supabase
      const { data: job } = await (supabase as any)
        .from('village_link_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      const { data: sug } = await (supabase as any)
        .from('village_link_suggestions')
        .select('*')
        .eq('job_id', jobId)
        .neq('status', 'committed')
        .order('confidence', { ascending: false });

      setCurrentJob(job);
      setSuggestions(sug || []);
      return { job, suggestions: sug || [] };
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      return { job: null, suggestions: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const commitSuggestions = async (jobId: string, suggestionIds: string[]) => {
    if (!suggestionIds.length) return { success: false, error: 'No suggestions selected' };

    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('village-links', {
        body: {
          job_id: jobId,
          suggestion_ids: suggestionIds
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Committed ${response.data?.committed || 0} items`);
      await fetchJobDetails(jobId);
      await fetchAuditLog();
      return { success: true, data: response.data };
    } catch (error: any) {
      toast.error(error.message || 'Failed to commit suggestions');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const bulkImport = async (items: { item_type: string; item_id: string; promote?: boolean; priority?: number }[]) => {
    if (!villageId || !items.length) return { success: false, error: 'No items to import' };

    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('village-links', {
        body: {
          village_id: villageId,
          items
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      if (result.errors?.length) {
        toast.warning(`Imported ${result.success} items, ${result.errors.length} errors`);
      } else {
        toast.success(`Imported ${result.success} items`);
      }
      
      await fetchAuditLog();
      return { success: true, data: result };
    } catch (error: any) {
      toast.error(error.message || 'Failed to import items');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const rollback = async (auditId: string, reason?: string) => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('village-links', {
        body: {
          audit_id: auditId,
          reason
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Rollback completed');
      await fetchAuditLog();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Rollback failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    jobs,
    currentJob,
    suggestions,
    auditLog,
    isLoading,
    fetchJobs,
    fetchAuditLog,
    startAutoLinkJob,
    fetchJobDetails,
    commitSuggestions,
    bulkImport,
    rollback
  };
};
