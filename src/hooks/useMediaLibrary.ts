import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MediaItem {
  id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  title: string | null;
  tags: string[] | null;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  folders: MediaFolder[];
  usage: MediaUsage[];
}

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface MediaUsage {
  id: string;
  media_id: string;
  content_type: string;
  content_id: string | null;
  page_slug: string | null;
  field_name: string | null;
  created_at: string;
}

interface UseMediaLibraryReturn {
  mediaItems: MediaItem[];
  folders: MediaFolder[];
  loading: boolean;
  uploading: boolean;
  fetchMedia: (folderId?: string) => Promise<void>;
  fetchFolders: () => Promise<void>;
  uploadMedia: (file: File, folderId?: string) => Promise<MediaItem | null>;
  updateMedia: (id: string, data: Partial<MediaItem>) => Promise<boolean>;
  deleteMedia: (id: string) => Promise<boolean>;
  assignFolder: (mediaId: string, folderId: string) => Promise<boolean>;
  removeFromFolder: (mediaId: string, folderId: string) => Promise<boolean>;
  createFolder: (name: string, description?: string) => Promise<MediaFolder | null>;
  scanAndSyncUsage: () => Promise<void>;
  searchMedia: (query: string) => Promise<MediaItem[]>;
}

export function useMediaLibrary(): UseMediaLibraryReturn {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchFolders = useCallback(async () => {
    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from("media_folders")
        .select("*")
        .order("display_order", { ascending: true });

      if (foldersError) throw foldersError;

      // Get item counts for each folder
      const { data: assignments } = await supabase
        .from("media_folder_assignments")
        .select("folder_id");

      const countMap: Record<string, number> = {};
      assignments?.forEach(a => {
        countMap[a.folder_id] = (countMap[a.folder_id] || 0) + 1;
      });

      const foldersWithCounts = (foldersData || []).map(f => ({
        ...f,
        item_count: countMap[f.id] || 0
      }));

      setFolders(foldersWithCounts);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, []);

  const fetchMedia = useCallback(async (folderId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: mediaData, error: mediaError } = await query;
      if (mediaError) throw mediaError;

      // Get folder assignments
      const { data: assignments } = await supabase
        .from("media_folder_assignments")
        .select("*, media_folders(*)");

      // Get usage data
      const { data: usageData } = await supabase
        .from("media_usage")
        .select("*");

      // Build media items with folders and usage
      const items: MediaItem[] = (mediaData || []).map(m => {
        const itemAssignments = assignments?.filter(a => a.media_id === m.id) || [];
        const itemFolders = itemAssignments
          .map(a => a.media_folders)
          .filter(Boolean) as MediaFolder[];
        const itemUsage = usageData?.filter(u => u.media_id === m.id) || [];

        return {
          ...m,
          folders: itemFolders,
          usage: itemUsage
        };
      });

      // Filter by folder if specified
      if (folderId) {
        if (folderId === "uncategorized") {
          setMediaItems(items.filter(i => i.folders.length === 0));
        } else {
          setMediaItems(items.filter(i => i.folders.some(f => f.id === folderId)));
        }
      } else {
        setMediaItems(items);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      toast({ title: "Error", description: "Failed to load media library", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const uploadMedia = useCallback(async (file: File, folderId?: string): Promise<MediaItem | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `media-library/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("public-assets")
        .getPublicUrl(filePath);

      // Insert into media_library
      const { data: mediaRecord, error: insertError } = await supabase
        .from("media_library")
        .insert({
          filename: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          tags: []
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Assign to folder if specified
      if (folderId && mediaRecord) {
        await supabase
          .from("media_folder_assignments")
          .insert({
            media_id: mediaRecord.id,
            folder_id: folderId
          });
      }

      toast({ title: "Success", description: "Image uploaded successfully" });
      return { ...mediaRecord, folders: [], usage: [] } as MediaItem;
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const updateMedia = useCallback(async (id: string, data: Partial<MediaItem>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("media_library")
        .update({
          alt_text: data.alt_text,
          title: data.title,
          tags: data.tags,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Image updated successfully" });
      return true;
    } catch (error) {
      console.error("Error updating media:", error);
      toast({ title: "Error", description: "Failed to update image", variant: "destructive" });
      return false;
    }
  }, [toast]);

  const deleteMedia = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("media_library")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Image deleted successfully" });
      return true;
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({ title: "Error", description: "Failed to delete image", variant: "destructive" });
      return false;
    }
  }, [toast]);

  const assignFolder = useCallback(async (mediaId: string, folderId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("media_folder_assignments")
        .upsert({ media_id: mediaId, folder_id: folderId });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error assigning folder:", error);
      return false;
    }
  }, []);

  const removeFromFolder = useCallback(async (mediaId: string, folderId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("media_folder_assignments")
        .delete()
        .eq("media_id", mediaId)
        .eq("folder_id", folderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing from folder:", error);
      return false;
    }
  }, []);

  const createFolder = useCallback(async (name: string, description?: string): Promise<MediaFolder | null> => {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data, error } = await supabase
        .from("media_folders")
        .insert({
          name,
          slug,
          description,
          is_system: false,
          display_order: 100
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Success", description: "Folder created successfully" });
      return data as MediaFolder;
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
      return null;
    }
  }, [toast]);

  const scanAndSyncUsage = useCallback(async () => {
    toast({ title: "Scanning", description: "Analyzing image usage across the site..." });

    try {
      // Get all media items
      const { data: media } = await supabase.from("media_library").select("id, file_url");
      if (!media?.length) return;

      // Get folder IDs
      const { data: foldersData } = await supabase.from("media_folders").select("id, slug");
      const folderMap = Object.fromEntries((foldersData || []).map(f => [f.slug, f.id]));

      // Content type to folder mapping
      const contentTypeToFolder: Record<string, string> = {
        districts: "districts",
        villages: "districts",
        culture: "culture",
        cultural_content: "culture",
        food: "culture",
        history: "history",
        gallery_images: "gallery",
        local_products: "products",
        travel_packages: "travel",
        tourism_listings: "travel",
        cms_site_settings: "homepage-common",
        site_images: "homepage-common"
      };

      // Scan various content tables
      const tables = [
        { table: "districts", field: "image_url", type: "districts" },
        { table: "districts", field: "thumbnail_url", type: "districts" },
        { table: "villages", field: "thumbnail_url", type: "districts" },
        { table: "cultural_content", field: "image_url", type: "culture" },
        { table: "gallery_images", field: "image_url", type: "gallery" },
        { table: "local_products", field: "image_url", type: "products" },
        { table: "travel_packages", field: "image_url", type: "travel" },
        { table: "tourism_listings", field: "main_image_url", type: "travel" }
      ];

      for (const { table, field, type } of tables) {
        try {
          const { data: rows } = await supabase
            .from(table as any)
            .select("*");

          if (!rows) continue;

          for (const row of rows) {
            const rowData = row as Record<string, any>;
            const imageUrl = rowData[field];
            if (!imageUrl) continue;

            // Find matching media item
            const matchingMedia = media.find(m => 
              imageUrl.includes(m.file_url) || m.file_url.includes(imageUrl) ||
              imageUrl === m.file_url
            );

            if (matchingMedia) {
              // Record usage
              await supabase.from("media_usage").upsert({
                media_id: matchingMedia.id,
                content_type: type,
                content_id: rowData.id,
                page_slug: rowData.slug || null,
                field_name: field
              }, {
                onConflict: "media_id,content_type,content_id,field_name"
              });

              // Auto-assign folder based on content type
              const folderSlug = contentTypeToFolder[type];
              if (folderSlug && folderMap[folderSlug]) {
                await supabase.from("media_folder_assignments").upsert({
                  media_id: matchingMedia.id,
                  folder_id: folderMap[folderSlug]
                }, {
                  onConflict: "media_id,folder_id"
                });
              }
            }
          }
        } catch (e) {
          console.warn(`Error scanning table ${table}:`, e);
        }
      }

      toast({ title: "Complete", description: "Image usage scan complete" });
      await fetchMedia();
      await fetchFolders();
    } catch (error) {
      console.error("Error scanning usage:", error);
      toast({ title: "Error", description: "Failed to scan image usage", variant: "destructive" });
    }
  }, [toast, fetchMedia, fetchFolders]);

  const searchMedia = useCallback(async (query: string): Promise<MediaItem[]> => {
    if (!query.trim()) return mediaItems;

    const lowerQuery = query.toLowerCase();
    return mediaItems.filter(item =>
      item.filename.toLowerCase().includes(lowerQuery) ||
      item.title?.toLowerCase().includes(lowerQuery) ||
      item.alt_text?.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [mediaItems]);

  useEffect(() => {
    fetchFolders();
    fetchMedia();
  }, [fetchFolders, fetchMedia]);

  return {
    mediaItems,
    folders,
    loading,
    uploading,
    fetchMedia,
    fetchFolders,
    uploadMedia,
    updateMedia,
    deleteMedia,
    assignFolder,
    removeFromFolder,
    createFolder,
    scanAndSyncUsage,
    searchMedia
  };
}
