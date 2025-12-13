import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface ContentCategory {
  id: string;
  district_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  hero_image: string | null;
  sort_order: number;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  hero_image: string | null;
  sort_order: number;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CulturalContent {
  id: string;
  district_id: string;
  category_id: string;
  subcategory_id: string | null;
  title: string;
  slug: string;
  short_intro: string | null;
  hero_image: string | null;
  image_gallery: string[] | null;
  cultural_significance: string | null;
  origin_history: string | null;
  ingredients: any | null;
  preparation_method: string | null;
  taste_description: string | null;
  consumption_occasions: string | null;
  famous_places: any | null;
  shelf_life_tips: string | null;
  price_range: string | null;
  dos_and_donts: string | null;
  fun_facts: string | null;
  timings: string | null;
  entry_fee: string | null;
  how_to_reach: any | null;
  things_to_do: string[] | null;
  local_customs: string | null;
  historical_significance: string | null;
  spiritual_significance: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  faqs: any | null;
  is_featured: boolean;
  is_highlighted: boolean;
  sort_order: number;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Categories Hooks
export function useContentCategories(districtId?: string, onlyPublished = false) {
  return useQuery({
    queryKey: ['content-categories', districtId, onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from('content_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (districtId) {
        query = query.eq('district_id', districtId);
      }

      if (onlyPublished) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentCategory[];
    },
  });
}

export function useContentCategory(districtSlug: string | undefined, categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['content-category', districtSlug, categorySlug],
    queryFn: async () => {
      if (!districtSlug || !categorySlug) return null;

      // First get district
      const { data: district } = await supabase
        .from('districts')
        .select('id, name, slug')
        .eq('slug', districtSlug)
        .single();

      if (!district) return null;

      // Then get category
      const { data: category, error } = await supabase
        .from('content_categories')
        .select('*')
        .eq('district_id', district.id)
        .eq('slug', categorySlug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return { category: category as ContentCategory, district };
    },
    enabled: !!districtSlug && !!categorySlug,
  });
}

// Subcategories Hooks
export function useContentSubcategories(categoryId?: string, onlyPublished = false) {
  return useQuery({
    queryKey: ['content-subcategories', categoryId, onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from('content_subcategories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (onlyPublished) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentSubcategory[];
    },
    enabled: !!categoryId,
  });
}

export function useContentSubcategory(
  districtSlug: string | undefined,
  categorySlug: string | undefined,
  subcategorySlug: string | undefined
) {
  return useQuery({
    queryKey: ['content-subcategory', districtSlug, categorySlug, subcategorySlug],
    queryFn: async () => {
      if (!districtSlug || !categorySlug || !subcategorySlug) return null;

      // Get district
      const { data: district } = await supabase
        .from('districts')
        .select('id, name, slug')
        .eq('slug', districtSlug)
        .single();

      if (!district) return null;

      // Get category
      const { data: category } = await supabase
        .from('content_categories')
        .select('*')
        .eq('district_id', district.id)
        .eq('slug', categorySlug)
        .single();

      if (!category) return null;

      // Get subcategory
      const { data: subcategory, error } = await supabase
        .from('content_subcategories')
        .select('*')
        .eq('category_id', category.id)
        .eq('slug', subcategorySlug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return {
        subcategory: subcategory as ContentSubcategory,
        category: category as ContentCategory,
        district,
      };
    },
    enabled: !!districtSlug && !!categorySlug && !!subcategorySlug,
  });
}

// Cultural Content Hooks
export function useCulturalContents(options?: {
  districtId?: string;
  categoryId?: string;
  subcategoryId?: string;
  onlyPublished?: boolean;
}) {
  return useQuery({
    queryKey: ['cultural-contents', options],
    queryFn: async () => {
      let query = supabase
        .from('cultural_content')
        .select('*')
        .order('sort_order', { ascending: true });

      if (options?.districtId) {
        query = query.eq('district_id', options.districtId);
      }

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.subcategoryId) {
        query = query.eq('subcategory_id', options.subcategoryId);
      }

      if (options?.onlyPublished) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CulturalContent[];
    },
  });
}

export function useCulturalContent(
  districtSlug: string | undefined,
  categorySlug: string | undefined,
  contentSlug: string | undefined,
  subcategorySlug?: string
) {
  return useQuery({
    queryKey: ['cultural-content', districtSlug, categorySlug, subcategorySlug, contentSlug],
    queryFn: async () => {
      if (!districtSlug || !categorySlug || !contentSlug) return null;

      // Get district
      const { data: district } = await supabase
        .from('districts')
        .select('id, name, slug')
        .eq('slug', districtSlug)
        .single();

      if (!district) return null;

      // Get category
      const { data: category } = await supabase
        .from('content_categories')
        .select('*')
        .eq('district_id', district.id)
        .eq('slug', categorySlug)
        .single();

      if (!category) return null;

      // Get subcategory if provided
      let subcategory = null;
      if (subcategorySlug) {
        const { data: subcat } = await supabase
          .from('content_subcategories')
          .select('*')
          .eq('category_id', category.id)
          .eq('slug', subcategorySlug)
          .single();
        subcategory = subcat;
      }

      // Get content
      let contentQuery = supabase
        .from('cultural_content')
        .select('*')
        .eq('district_id', district.id)
        .eq('category_id', category.id)
        .eq('slug', contentSlug)
        .eq('status', 'published');

      if (subcategory) {
        contentQuery = contentQuery.eq('subcategory_id', subcategory.id);
      }

      const { data: content, error } = await contentQuery.single();

      if (error) throw error;
      return {
        content: content as CulturalContent,
        category: category as ContentCategory,
        subcategory: subcategory as ContentSubcategory | null,
        district,
      };
    },
    enabled: !!districtSlug && !!categorySlug && !!contentSlug,
  });
}

// Mutations
export function useContentCategoryMutations() {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (data: Partial<ContentCategory>) => {
      const { data: result, error } = await supabase
        .from('content_categories')
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContentCategory> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('content_categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-categories'] });
    },
  });

  return { createCategory, updateCategory, deleteCategory };
}

export function useContentSubcategoryMutations() {
  const queryClient = useQueryClient();

  const createSubcategory = useMutation({
    mutationFn: async (data: Partial<ContentSubcategory>) => {
      const { data: result, error } = await supabase
        .from('content_subcategories')
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-subcategories'] });
    },
  });

  const updateSubcategory = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContentSubcategory> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('content_subcategories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-subcategories'] });
    },
  });

  const deleteSubcategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_subcategories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-subcategories'] });
    },
  });

  return { createSubcategory, updateSubcategory, deleteSubcategory };
}

export function useCulturalContentMutations() {
  const queryClient = useQueryClient();

  const createContent = useMutation({
    mutationFn: async (data: Partial<CulturalContent>) => {
      const { data: result, error } = await supabase
        .from('cultural_content')
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-contents'] });
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CulturalContent> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('cultural_content')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-contents'] });
    },
  });

  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cultural_content').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-contents'] });
    },
  });

  return { createContent, updateContent, deleteContent };
}
