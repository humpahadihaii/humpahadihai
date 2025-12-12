import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  source_id: string;
  type: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  district?: string;
  village?: string;
  category?: string;
  image_url?: string;
  url: string;
  is_promoted?: boolean;
  is_featured?: boolean;
  rating?: number;
  price?: number;
  lat?: number;
  lng?: number;
  score: number;
}

export interface SearchFilters {
  content_type?: string[];
  district?: string;
  price_min?: number;
  price_max?: number;
  promoted_only?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  timings?: {
    lexical_ms: number;
    vector_ms: number;
    total_ms: number;
  };
}

export interface Suggestion {
  text: string;
  type: string;
  entity_type?: string;
  url?: string;
  image_url?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useSearch() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const limit = 12;

  // Get session ID for tracking
  const sessionId = useMemo(() => {
    let id = sessionStorage.getItem("search_session_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("search_session_id", id);
    }
    return id;
  }, []);

  // Main search query
  const searchQuery = useQuery({
    queryKey: ["search", query, filters, page],
    queryFn: async (): Promise<SearchResponse> => {
      if (!query || query.trim().length < 2) {
        return { results: [], total: 0, page: 1, limit };
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/search/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          q: query,
          filter: filters,
          page,
          limit,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      return response.json();
    },
    enabled: query.trim().length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Autosuggest query
  const suggestQuery = useQuery({
    queryKey: ["suggest", query],
    queryFn: async (): Promise<Suggestion[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/search/suggest?q=${encodeURIComponent(query)}&limit=8`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.suggestions || [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 60000, // Cache for 1 minute
  });

  // Track click/feedback
  const feedbackMutation = useMutation({
    mutationFn: async ({
      documentId,
      position,
      feedbackType,
    }: {
      documentId: string;
      position: number;
      feedbackType: "click" | "convert";
    }) => {
      await fetch(`${SUPABASE_URL}/functions/v1/search/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          document_id: documentId,
          result_position: position,
          feedback_type: feedbackType,
          session_id: sessionId,
        }),
      });
    },
  });

  const search = useCallback((q: string) => {
    setQuery(q);
    setPage(1);
  }, []);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const trackClick = useCallback(
    (result: SearchResult, position: number) => {
      feedbackMutation.mutate({
        documentId: result.id,
        position,
        feedbackType: "click",
      });
    },
    [feedbackMutation]
  );

  return {
    query,
    setQuery: search,
    filters,
    setFilters: updateFilters,
    page,
    setPage,
    results: searchQuery.data?.results || [],
    total: searchQuery.data?.total || 0,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    suggestions: suggestQuery.data || [],
    isSuggestLoading: suggestQuery.isLoading,
    trackClick,
    timings: searchQuery.data?.timings,
  };
}

// Trigger full reindex (admin only)
export async function triggerReindex(): Promise<{ success: boolean; indexed: Record<string, number> }> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/search-index`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      action: "reindex",
      full_reindex: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Reindex failed");
  }

  return response.json();
}
