import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIRequest {
  type: "story" | "travel" | "product" | "promotion" | "seo" | "translate" | "villages" | "village" | "cultural";
  action: string;
  inputs: Record<string, string>;
}

interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  estimatedCost: number;
}

interface AIResponse {
  content: string;
  usage?: AIUsage;
}

interface ParsedContent {
  title?: string;
  excerpt?: string;
  body?: string;
  tags?: string;
  short_description?: string;
  full_description?: string;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  best_season?: string;
  seo_title?: string;
  meta_description?: string;
  description?: string;
  deliverables?: string;
  raw?: string;
  short_intro?: string;
  cultural_significance?: string;
  origin_history?: string;
  ingredients?: string;
  preparation_method?: string;
  fun_facts?: string;
  faqs?: string;
}

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsage, setLastUsage] = useState<AIUsage | null>(null);

  const generateContent = async (request: AIRequest): Promise<{ parsed: ParsedContent; usage?: AIUsage } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-content", {
        body: request,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const content = data?.content || "";
      const usage = data?.usage as AIUsage | undefined;
      
      if (usage) {
        setLastUsage(usage);
      }

      const parsed = parseContent(content, request.type, request.action);

      toast.success("Content generated successfully!");
      return { parsed, usage };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate content";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const parseContent = (content: string, type: string, action: string): ParsedContent => {
    const result: ParsedContent = { raw: content };

    const extractField = (label: string): string => {
      const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, "i");
      const match = content.match(regex);
      return match ? match[1].trim() : "";
    };

    if (type === "story" && action === "generate") {
      result.title = extractField("TITLE");
      result.excerpt = extractField("EXCERPT");
      result.body = extractField("BODY");
      result.tags = extractField("TAGS");
    } else if (type === "travel" && action === "generate") {
      result.short_description = extractField("SHORT_DESCRIPTION");
      result.full_description = extractField("FULL_DESCRIPTION");
      result.itinerary = extractField("ITINERARY");
      result.inclusions = extractField("INCLUSIONS");
      result.exclusions = extractField("EXCLUSIONS");
      result.best_season = extractField("BEST_SEASON");
    } else if (type === "travel" && action === "itinerary") {
      result.itinerary = content;
    } else if (type === "product" && action === "generate") {
      result.short_description = extractField("SHORT_DESCRIPTION");
      result.full_description = extractField("FULL_DESCRIPTION");
      result.tags = extractField("TAGS");
    } else if (type === "promotion" && action === "generate") {
      result.description = extractField("DESCRIPTION");
      result.deliverables = extractField("DELIVERABLES");
    } else if (type === "seo") {
      result.seo_title = extractField("SEO_TITLE");
      result.meta_description = extractField("META_DESCRIPTION");
    } else if (type === "cultural" && action === "generate_all") {
      result.short_intro = extractField("SHORT_INTRO");
      result.cultural_significance = extractField("CULTURAL_SIGNIFICANCE");
      result.origin_history = extractField("ORIGIN_HISTORY");
      result.ingredients = extractField("INGREDIENTS");
      result.preparation_method = extractField("PREPARATION_METHOD");
      result.fun_facts = extractField("FUN_FACTS");
      result.faqs = extractField("FAQS");
    } else if (type === "cultural") {
      result.body = content;
    } else {
      result.body = content;
    }

    return result;
  };

  return {
    generateContent,
    isLoading,
    error,
    lastUsage,
  };
};
