import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CMSSiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text: string;
  secondary_cta_url: string;
  hero_background_image: string | null;
  logo_image: string | null;
  meta_title: string;
  meta_description: string;
  instagram_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  email_contact: string | null;
  email_support: string | null;
  email_info: string | null;
  email_promotions: string | null;
  email_collabs: string | null;
  email_copyright: string | null;
  email_team: string | null;
  email_admin: string | null;
  email_post: string | null;
  whatsapp_number: string | null;
}

export const useCMSSettings = () => {
  return useQuery({
    queryKey: ["cms-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as CMSSiteSettings | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export interface CMSContentSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  section_image: string | null;
  display_order: number;
  is_published: boolean;
}

export const useCMSContentSections = () => {
  return useQuery({
    queryKey: ["cms-content-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_content_sections")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as CMSContentSection[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSContentSection = (slug: string) => {
  return useQuery({
    queryKey: ["cms-content-section", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_content_sections")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as CMSContentSection | null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
}

export const useCMSPage = (slug: string) => {
  return useQuery({
    queryKey: ["cms-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data as CMSPage | null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export interface CMSFooterLink {
  id: string;
  label: string;
  page_slug: string | null;
  url: string | null;
  display_order: number;
  is_external: boolean;
}

export const useCMSFooterLinks = () => {
  return useQuery({
    queryKey: ["cms-footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_footer_links")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as CMSFooterLink[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export interface CMSStory {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  excerpt: string | null;
  body: string | null;
  category: string;
  author_name: string | null;
  published_at: string | null;
  status: string;
}

export const useCMSStories = (category?: string) => {
  return useQuery({
    queryKey: ["cms-stories", category],
    queryFn: async () => {
      let query = supabase
        .from("cms_stories")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CMSStory[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSStory = (slug: string) => {
  return useQuery({
    queryKey: ["cms-story", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_stories")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data as CMSStory | null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export interface CMSEvent {
  id: string;
  title: string;
  slug: string;
  banner_image_url: string | null;
  location: string | null;
  event_date: string | null;
  description: string | null;
  is_featured: boolean;
  status: string;
}

export const useCMSEvents = (featured?: boolean) => {
  return useQuery({
    queryKey: ["cms-events", featured],
    queryFn: async () => {
      let query = supabase
        .from("cms_events")
        .select("*")
        .eq("status", "published")
        .order("event_date", { ascending: true });

      if (featured) {
        query = query.eq("is_featured", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CMSEvent[];
    },
    staleTime: 1000 * 60 * 5,
  });
};
