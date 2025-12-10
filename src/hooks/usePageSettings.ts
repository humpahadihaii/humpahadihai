import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HeroBullet {
  icon?: string;
  text: string;
}

export interface PageSettings {
  id: string;
  page_key: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_bullets: HeroBullet[];
  hero_cta_label: string | null;
  hero_cta_link: string | null;
  intro_text: string | null;
  bottom_seo_text: string | null;
  custom_section_title: string | null;
  custom_section_description: string | null;
  custom_section_cta_label: string | null;
  custom_section_cta_link: string | null;
  faqs: FAQItem[];
  meta_title: string | null;
  meta_description: string | null;
  extra_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const parsePageSettings = (data: any): PageSettings => {
  return {
    ...data,
    hero_bullets: Array.isArray(data.hero_bullets) 
      ? (data.hero_bullets as any[]).map(b => ({ icon: b?.icon, text: b?.text || '' }))
      : [],
    faqs: Array.isArray(data.faqs) 
      ? (data.faqs as any[]).map(f => ({ question: f?.question || '', answer: f?.answer || '' }))
      : [],
    extra_data: typeof data.extra_data === 'object' && data.extra_data !== null ? data.extra_data : {},
  };
};

export const usePageSettings = (pageKey: string) => {
  return useQuery({
    queryKey: ["page-settings", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_settings")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return parsePageSettings(data);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllPageSettings = () => {
  return useQuery({
    queryKey: ["page-settings-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_settings")
        .select("*")
        .order("page_key");

      if (error) throw error;
      return (data || []).map(parsePageSettings);
    },
    staleTime: 1000 * 60 * 5,
  });
};
