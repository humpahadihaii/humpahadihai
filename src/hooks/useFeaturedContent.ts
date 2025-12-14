import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturedContentConfig {
  id: string;
  auto_rotation_enabled: boolean;
  rotation_frequency: string;
  last_rotation_at: string | null;
  items_per_section: number;
}

export interface FeaturedContentSlot {
  id: string;
  content_id: string;
  section_key: string;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  is_manual: boolean;
  created_at: string;
  content?: {
    id: string;
    title: string;
    slug: string;
    short_intro: string | null;
    hero_image: string | null;
    status: string;
    district?: { id: string; name: string; slug: string } | null;
    category?: { id: string; name: string; slug: string } | null;
  };
}

export interface FeaturedCulturalContent {
  id: string;
  title: string;
  slug: string;
  short_intro: string | null;
  hero_image: string | null;
  status: string;
  is_featured: boolean;
  district: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
}

const SECTION_KEYS = {
  CULTURAL_HIGHLIGHT: 'cultural_highlight',
  LOCAL_FOOD: 'local_food',
  SPIRITUAL: 'spiritual',
  NATURE: 'nature',
  DISTRICTS: 'districts',
} as const;

export const SECTION_LABELS: Record<string, string> = {
  cultural_highlight: "Today's Cultural Highlight",
  local_food: "Featured Local Food",
  spiritual: "Spiritual Spotlight",
  nature: "Explore Nature & Wildlife",
  districts: "From Different Districts",
};

export const SECTION_CATEGORY_MAP: Record<string, string[]> = {
  local_food: ['Local Food'],
  spiritual: ['Spiritual Places', 'Temples'],
  nature: ['Nature & Wildlife', 'Wildlife Sanctuaries', 'Nature'],
  cultural_highlight: [], // Any category
  districts: [], // Any category, different districts
};

// Fetch featured content config
export function useFeaturedContentConfig() {
  return useQuery({
    queryKey: ["featured-content-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_content_config")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as FeaturedContentConfig;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
  });
}

// Fetch featured content slots with content details
export function useFeaturedContentSlots(sectionKey?: string) {
  return useQuery({
    queryKey: ["featured-content-slots", sectionKey],
    queryFn: async () => {
      let query = supabase
        .from("featured_content_slots")
        .select(`
          *,
          content:cultural_content(
            id, title, slug, short_intro, hero_image, status,
            district:districts(id, name, slug),
            category:content_categories(id, name, slug)
          )
        `)
        .order("priority", { ascending: false });
      
      if (sectionKey) {
        query = query.eq("section_key", sectionKey);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FeaturedContentSlot[];
    },
  });
}

// Get auto-selected featured content for a section
export function useAutoFeaturedContent(sectionKey: string, limit = 3) {
  return useQuery({
    queryKey: ["auto-featured-content", sectionKey, limit],
    queryFn: async () => {
      // Get recently featured content to avoid repetition
      const today = new Date().toISOString().split('T')[0];
      const { data: recentHistory } = await supabase
        .from("featured_content_history")
        .select("content_id")
        .eq("section_key", sectionKey)
        .gte("featured_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
      const recentIds = recentHistory?.map(h => h.content_id) || [];
      
      // Build query based on section
      let query = supabase
        .from("cultural_content")
        .select(`
          id, title, slug, short_intro, hero_image, status, is_featured,
          district:districts(id, name, slug),
          category:content_categories(id, name, slug),
          subcategory:content_subcategories(id, name, slug)
        `)
        .eq("status", "published")
        .not("hero_image", "is", null)
        .not("short_intro", "is", null);
      
      // Filter by category if applicable
      const categoryNames = SECTION_CATEGORY_MAP[sectionKey] || [];
      
      // Exclude recently featured
      if (recentIds.length > 0) {
        query = query.not("id", "in", `(${recentIds.join(",")})`);
      }
      
      query = query.order("created_at", { ascending: false }).limit(limit * 3);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by category names if applicable
      let filtered = data || [];
      if (categoryNames.length > 0) {
        filtered = filtered.filter(item => 
          item.category && categoryNames.some(cat => 
            item.category!.name.toLowerCase().includes(cat.toLowerCase())
          )
        );
      }
      
      // For districts section, ensure variety
      if (sectionKey === 'districts') {
        const seenDistricts = new Set<string>();
        filtered = filtered.filter(item => {
          if (!item.district) return false;
          if (seenDistricts.has(item.district.id)) return false;
          seenDistricts.add(item.district.id);
          return true;
        });
      }
      
      return filtered.slice(0, limit) as FeaturedCulturalContent[];
    },
  });
}

// Get combined featured content (manual + auto) - OPTIMIZED single query
export function useCombinedFeaturedContent(sectionKey: string, limit = 3) {
  return useQuery({
    queryKey: ["combined-featured-content", sectionKey, limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Single query to get featured content for this section
      const { data: slots, error: slotsError } = await supabase
        .from("featured_content_slots")
        .select(`
          *,
          content:cultural_content(
            id, title, slug, short_intro, hero_image, status,
            district:districts(id, name, slug),
            category:content_categories(id, name, slug)
          )
        `)
        .eq("section_key", sectionKey)
        .order("priority", { ascending: false })
        .limit(limit);
      
      if (slotsError) throw slotsError;
      
      // Filter valid slots
      const validSlots = (slots || []).filter(slot => {
        if (!slot.content || slot.content.status !== 'published') return false;
        if (slot.start_date && slot.start_date > today) return false;
        if (slot.end_date && slot.end_date < today) return false;
        return true;
      });
      
      const manualContent: FeaturedCulturalContent[] = validSlots.map(slot => ({
        id: slot.content!.id,
        title: slot.content!.title,
        slug: slot.content!.slug,
        short_intro: slot.content!.short_intro,
        hero_image: slot.content!.hero_image,
        status: slot.content!.status,
        is_featured: true,
        district: slot.content!.district,
        category: slot.content!.category,
        subcategory: null,
      }));
      
      // If we have enough manual content, return it
      if (manualContent.length >= limit) {
        return manualContent.slice(0, limit);
      }
      
      // Otherwise, fill with auto content
      const manualIds = manualContent.map(c => c.id);
      const categoryNames = SECTION_CATEGORY_MAP[sectionKey] || [];
      
      let autoQuery = supabase
        .from("cultural_content")
        .select(`
          id, title, slug, short_intro, hero_image, status, is_featured,
          district:districts(id, name, slug),
          category:content_categories(id, name, slug),
          subcategory:content_subcategories(id, name, slug)
        `)
        .eq("status", "published")
        .not("hero_image", "is", null)
        .not("short_intro", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit * 2);
      
      if (manualIds.length > 0) {
        autoQuery = autoQuery.not("id", "in", `(${manualIds.join(",")})`);
      }
      
      const { data: autoData } = await autoQuery;
      
      let autoFiltered = autoData || [];
      if (categoryNames.length > 0) {
        autoFiltered = autoFiltered.filter(item => 
          item.category && categoryNames.some(cat => 
            item.category!.name.toLowerCase().includes(cat.toLowerCase())
          )
        );
      }
      
      // For districts section, ensure variety
      if (sectionKey === 'districts') {
        const seenDistricts = new Set<string>();
        autoFiltered = autoFiltered.filter(item => {
          if (!item.district) return false;
          if (seenDistricts.has(item.district.id)) return false;
          seenDistricts.add(item.district.id);
          return true;
        });
      }
      
      return [...manualContent, ...autoFiltered].slice(0, limit) as FeaturedCulturalContent[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });
}

// Admin mutations
export function useFeaturedContentMutations() {
  const queryClient = useQueryClient();
  
  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<FeaturedContentConfig>) => {
      const { data, error } = await supabase
        .from("featured_content_config")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("singleton_flag", true)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-content-config"] });
    },
  });
  
  const addSlot = useMutation({
    mutationFn: async (slot: { content_id: string; section_key: string; priority?: number; start_date?: string; end_date?: string }) => {
      const { data, error } = await supabase
        .from("featured_content_slots")
        .insert({
          content_id: slot.content_id,
          section_key: slot.section_key,
          priority: slot.priority || 0,
          start_date: slot.start_date || null,
          end_date: slot.end_date || null,
          is_manual: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-content-slots"] });
    },
  });
  
  const updateSlot = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; priority?: number; start_date?: string | null; end_date?: string | null }) => {
      const { data, error } = await supabase
        .from("featured_content_slots")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-content-slots"] });
    },
  });
  
  const removeSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("featured_content_slots")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-content-slots"] });
    },
  });
  
  const toggleContentFeatured = useMutation({
    mutationFn: async ({ contentId, featured }: { contentId: string; featured: boolean }) => {
      const { data, error } = await supabase
        .from("cultural_content")
        .update({ is_featured: featured })
        .eq("id", contentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cultural-content"] });
      queryClient.invalidateQueries({ queryKey: ["auto-featured-content"] });
    },
  });
  
  return { updateConfig, addSlot, updateSlot, removeSlot, toggleContentFeatured };
}

// Fetch all cultural content for selection
export function useAllCulturalContent() {
  return useQuery({
    queryKey: ["all-cultural-content-for-featuring"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cultural_content")
        .select(`
          id, title, slug, short_intro, hero_image, status, is_featured,
          district:districts(id, name, slug),
          category:content_categories(id, name, slug)
        `)
        .eq("status", "published")
        .order("title");
      
      if (error) throw error;
      return data as FeaturedCulturalContent[];
    },
  });
}
