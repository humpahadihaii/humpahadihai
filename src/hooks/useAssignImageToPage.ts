import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ContentType = 
  | "districts"
  | "villages"
  | "cultural_content"
  | "travel_packages"
  | "tourism_listings"
  | "local_products"
  | "cms_stories"
  | "destination_guides"
  | "destination_places"
  | "cms_events";

export interface ImageField {
  field_name: string;
  label: string;
  is_array: boolean;
}

export interface PageOption {
  id: string;
  title: string;
  slug: string;
  current_images: Record<string, string | string[] | null>;
  district_slug?: string;
  category_slug?: string;
}

export interface AssignmentResult {
  page_id: string;
  page_title: string;
  field_name: string;
  success: boolean;
  error?: string;
}

// Content type configurations
const CONTENT_TYPE_CONFIG: Record<ContentType, { 
  label: string; 
  image_fields: ImageField[];
  title_field: string;
  slug_field: string;
  route_prefix: string;
}> = {
  districts: {
    label: "District",
    image_fields: [
      { field_name: "image_url", label: "Main Image", is_array: false },
      { field_name: "banner_image", label: "Banner Image", is_array: false },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "name",
    slug_field: "slug",
    route_prefix: "/districts"
  },
  villages: {
    label: "Village",
    image_fields: [
      { field_name: "thumbnail_url", label: "Thumbnail", is_array: false },
      { field_name: "thumbnail_image_url", label: "Thumbnail Image", is_array: false },
      { field_name: "gallery_images", label: "Gallery", is_array: true },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "name",
    slug_field: "slug",
    route_prefix: "/village"
  },
  cultural_content: {
    label: "Culture",
    image_fields: [
      { field_name: "hero_image", label: "Hero Image", is_array: false },
      { field_name: "image_gallery", label: "Image Gallery", is_array: true },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "title",
    slug_field: "slug",
    route_prefix: "/culture"
  },
  travel_packages: {
    label: "Travel Package",
    image_fields: [
      { field_name: "thumbnail_image_url", label: "Thumbnail", is_array: false },
      { field_name: "gallery_images", label: "Gallery", is_array: true },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "title",
    slug_field: "slug",
    route_prefix: "/travel/packages"
  },
  tourism_listings: {
    label: "Hotel/Listing",
    image_fields: [
      { field_name: "image_url", label: "Main Image", is_array: false },
      { field_name: "thumbnail_image_url", label: "Thumbnail", is_array: false },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "title",
    slug_field: "slug",
    route_prefix: "/listings"
  },
  local_products: {
    label: "Product",
    image_fields: [
      { field_name: "thumbnail_image_url", label: "Thumbnail", is_array: false },
      { field_name: "gallery_images", label: "Gallery", is_array: true },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "name",
    slug_field: "slug",
    route_prefix: "/products"
  },
  cms_stories: {
    label: "Story",
    image_fields: [
      { field_name: "cover_image_url", label: "Cover Image", is_array: false },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "title",
    slug_field: "slug",
    route_prefix: "/stories"
  },
  destination_guides: {
    label: "Destination Guide",
    image_fields: [
      { field_name: "hero_image", label: "Hero Image", is_array: false },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "title",
    slug_field: "slug",
    route_prefix: "/travel/guides"
  },
  destination_places: {
    label: "Place",
    image_fields: [
      { field_name: "main_image", label: "Main Image", is_array: false },
      { field_name: "image_gallery", label: "Image Gallery", is_array: true },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "title",
    slug_field: "slug",
    route_prefix: "/travel/places"
  },
  cms_events: {
    label: "Event",
    image_fields: [
      { field_name: "banner_image_url", label: "Banner Image", is_array: false },
      { field_name: "seo_image_url", label: "SEO Image", is_array: false }
    ],
    title_field: "title",
    slug_field: "slug",
    route_prefix: "/events"
  }
};

export function useAssignImageToPage() {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<PageOption[]>([]);
  const { toast } = useToast();

  const getContentTypes = useCallback(() => {
    return Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => ({
      value: key as ContentType,
      label: config.label
    }));
  }, []);

  const getImageFields = useCallback((contentType: ContentType): ImageField[] => {
    return CONTENT_TYPE_CONFIG[contentType]?.image_fields || [];
  }, []);

  const fetchPages = useCallback(async (
    contentType: ContentType, 
    searchQuery: string = ""
  ): Promise<PageOption[]> => {
    setLoading(true);
    try {
      const config = CONTENT_TYPE_CONFIG[contentType];
      if (!config) return [];

      // Build select fields including all image fields
      const imageFieldNames = config.image_fields.map(f => f.field_name);
      const selectFields = [
        "id",
        config.title_field,
        config.slug_field,
        ...imageFieldNames
      ].join(", ");

      let query = supabase
        .from(contentType)
        .select(selectFields)
        .order(config.title_field, { ascending: true })
        .limit(50);

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`${config.title_field}.ilike.%${searchQuery}%,${config.slug_field}.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const options: PageOption[] = (data || []).map((item: any) => {
        const currentImages: Record<string, string | string[] | null> = {};
        imageFieldNames.forEach(field => {
          currentImages[field] = item[field] || null;
        });

        return {
          id: item.id,
          title: item[config.title_field] || "Untitled",
          slug: item[config.slug_field] || "",
          current_images: currentImages
        };
      });

      setPages(options);
      return options;
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const assignImage = useCallback(async (
    imageUrl: string,
    mediaId: string,
    contentType: ContentType,
    pageIds: string[],
    fieldName: string,
    isArrayField: boolean
  ): Promise<AssignmentResult[]> => {
    const results: AssignmentResult[] = [];
    const config = CONTENT_TYPE_CONFIG[contentType];

    for (const pageId of pageIds) {
      try {
        // Get current page data
        const { data: pageData, error: fetchError } = await supabase
          .from(contentType)
          .select(`id, ${config.title_field}, ${config.slug_field}, ${fieldName}`)
          .eq("id", pageId)
          .single();

        if (fetchError) throw fetchError;

        let updateValue: string | string[];
        
        if (isArrayField) {
          // For array fields, append the image
          const currentArray = (pageData[fieldName] as string[]) || [];
          if (!currentArray.includes(imageUrl)) {
            updateValue = [...currentArray, imageUrl];
          } else {
            updateValue = currentArray;
          }
        } else {
          // For single image fields, replace the value
          updateValue = imageUrl;
        }

        // Update the page
        const { error: updateError } = await supabase
          .from(contentType)
          .update({ 
            [fieldName]: updateValue,
            updated_at: new Date().toISOString()
          })
          .eq("id", pageId);

        if (updateError) throw updateError;

        // Build frontend path
        const slug = pageData[config.slug_field];
        const resolvedPath = `${config.route_prefix}/${slug}`;

        // Register or update media usage
        const { data: existingUsage } = await supabase
          .from("media_usage")
          .select("id")
          .eq("media_id", mediaId)
          .eq("content_type", contentType)
          .eq("content_id", pageId)
          .eq("field_name", fieldName)
          .maybeSingle();

        if (!existingUsage) {
          await supabase.from("media_usage").insert({
            media_id: mediaId,
            content_type: contentType,
            content_id: pageId,
            field_name: fieldName,
            page_slug: slug,
            resolved_path: resolvedPath,
            content_title: pageData[config.title_field],
            content_slug: slug
          });
        }

        results.push({
          page_id: pageId,
          page_title: pageData[config.title_field] || "Untitled",
          field_name: fieldName,
          success: true
        });

      } catch (error: any) {
        console.error(`Error assigning image to page ${pageId}:`, error);
        results.push({
          page_id: pageId,
          page_title: pageId,
          field_name: fieldName,
          success: false,
          error: error.message || "Unknown error"
        });
      }
    }

    // Log activity
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_activity_logs").insert([{
          user_id: user.id,
          user_email: user.email || "",
          entity_type: "media_library",
          entity_id: mediaId,
          action: "assign_to_page",
          summary: `Assigned image to ${results.filter(r => r.success).length} page(s)`,
          metadata: JSON.parse(JSON.stringify({
            content_type: contentType,
            field_name: fieldName,
            page_ids: pageIds,
            results
          }))
        }]);
      }
    } catch (e) {
      console.warn("Failed to log activity:", e);
    }

    return results;
  }, []);

  const getRoutePrefix = useCallback((contentType: ContentType): string => {
    return CONTENT_TYPE_CONFIG[contentType]?.route_prefix || "";
  }, []);

  return {
    loading,
    pages,
    getContentTypes,
    getImageFields,
    fetchPages,
    assignImage,
    getRoutePrefix
  };
}
