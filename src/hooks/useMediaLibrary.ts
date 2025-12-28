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
  source: string;
  admin_notes: string | null;
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

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  mediaItem?: MediaItem;
}

interface UseMediaLibraryReturn {
  mediaItems: MediaItem[];
  folders: MediaFolder[];
  loading: boolean;
  uploading: boolean;
  uploadQueue: UploadProgress[];
  fetchMedia: (folderId?: string) => Promise<void>;
  fetchFolders: () => Promise<void>;
  uploadMedia: (file: File, folderId?: string) => Promise<MediaItem | null>;
  uploadMediaBulk: (files: File[], folderId?: string) => Promise<void>;
  updateMedia: (id: string, data: Partial<MediaItem>) => Promise<boolean>;
  replaceMedia: (id: string, file: File) => Promise<boolean>;
  deleteMedia: (id: string) => Promise<boolean>;
  assignFolder: (mediaId: string, folderId: string) => Promise<boolean>;
  removeFromFolder: (mediaId: string, folderId: string) => Promise<boolean>;
  createFolder: (name: string, description?: string) => Promise<MediaFolder | null>;
  scanAndSyncUsage: () => Promise<void>;
  discoverFrontendImages: () => Promise<{ discovered: number; registered: number }>;
  searchMedia: (query: string) => Promise<MediaItem[]>;
  clearUploadQueue: () => void;
}

export function useMediaLibrary(): UseMediaLibraryReturn {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const { toast } = useToast();

  const fetchFolders = useCallback(async () => {
    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from("media_folders")
        .select("*")
        .order("display_order", { ascending: true });

      if (foldersError) throw foldersError;

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
      const { data: mediaData, error: mediaError } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (mediaError) throw mediaError;

      const { data: assignments } = await supabase
        .from("media_folder_assignments")
        .select("*, media_folders(*)");

      const { data: usageData } = await supabase
        .from("media_usage")
        .select("*");

      const items: MediaItem[] = (mediaData || []).map(m => {
        const itemAssignments = assignments?.filter(a => a.media_id === m.id) || [];
        const itemFolders = itemAssignments
          .map(a => a.media_folders)
          .filter(Boolean) as MediaFolder[];
        const itemUsage = usageData?.filter(u => u.media_id === m.id) || [];

        return {
          ...m,
          source: m.source || 'uploaded',
          admin_notes: m.admin_notes || null,
          folders: itemFolders,
          usage: itemUsage
        };
      });

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

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const { data: mediaRecord, error: insertError } = await supabase
        .from("media_library")
        .insert({
          filename: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          source: 'uploaded',
          tags: []
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (folderId && mediaRecord) {
        await supabase
          .from("media_folder_assignments")
          .insert({
            media_id: mediaRecord.id,
            folder_id: folderId
          });
      }

      toast({ title: "Success", description: "Image uploaded successfully" });
      return { ...mediaRecord, source: 'uploaded', admin_notes: null, folders: [], usage: [] } as MediaItem;
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const uploadMediaBulk = useCallback(async (files: File[], folderId?: string): Promise<void> => {
    setUploading(true);
    
    // Initialize queue
    const initialQueue: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploadQueue(initialQueue);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to uploading
      setUploadQueue(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'uploading', progress: 10 } : item
      ));

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `media-library/${fileName}`;

        setUploadQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, progress: 30 } : item
        ));

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setUploadQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, progress: 70 } : item
        ));

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(filePath);

        const { data: mediaRecord, error: insertError } = await supabase
          .from("media_library")
          .insert({
            filename: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            source: 'uploaded',
            tags: []
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (folderId && mediaRecord) {
          await supabase
            .from("media_folder_assignments")
            .insert({
              media_id: mediaRecord.id,
              folder_id: folderId
            });
        }

        setUploadQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'completed', 
            progress: 100,
            mediaItem: { ...mediaRecord, source: 'uploaded', admin_notes: null, folders: [], usage: [] } as MediaItem
          } : item
        ));
      } catch (error: any) {
        console.error("Error uploading file:", file.name, error);
        setUploadQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'failed', 
            progress: 0,
            error: error.message || 'Upload failed'
          } : item
        ));
      }
    }

    setUploading(false);
    await fetchMedia();
    await fetchFolders();
    
    const completed = files.length;
    toast({ 
      title: "Upload Complete", 
      description: `Processed ${completed} file${completed !== 1 ? 's' : ''}`
    });
  }, [toast, fetchMedia, fetchFolders]);

  const updateMedia = useCallback(async (id: string, data: Partial<MediaItem>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("media_library")
        .update({
          alt_text: data.alt_text,
          title: data.title,
          tags: data.tags,
          admin_notes: data.admin_notes,
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

  const replaceMedia = useCallback(async (id: string, file: File): Promise<boolean> => {
    try {
      // Get current media item
      const { data: currentMedia } = await supabase
        .from("media_library")
        .select("file_url")
        .eq("id", id)
        .single();

      if (!currentMedia) throw new Error("Media not found");

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `media-library/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // Update media library record with new URL
      const { error: updateError } = await supabase
        .from("media_library")
        .update({
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          filename: file.name,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Update all content references to use the new URL
      const { data: usageData } = await supabase
        .from("media_usage")
        .select("*")
        .eq("media_id", id);

      if (usageData && usageData.length > 0) {
        for (const usage of usageData) {
          if (usage.content_id && usage.field_name) {
            try {
              await supabase
                .from(usage.content_type as any)
                .update({ [usage.field_name]: publicUrl })
                .eq("id", usage.content_id);
            } catch (e) {
              console.warn(`Could not update ${usage.content_type}:`, e);
            }
          }
        }
      }

      toast({ title: "Success", description: "Image replaced successfully across all usages" });
      return true;
    } catch (error) {
      console.error("Error replacing media:", error);
      toast({ title: "Error", description: "Failed to replace image", variant: "destructive" });
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

  const discoverFrontendImages = useCallback(async (): Promise<{ discovered: number; registered: number }> => {
    toast({ title: "Discovering Images", description: "Scanning frontend content for images..." });

    let discovered = 0;
    let registered = 0;

    try {
      const { data: foldersData } = await supabase.from("media_folders").select("id, slug");
      const folderMap = Object.fromEntries((foldersData || []).map(f => [f.slug, f.id]));

      // Content type to folder mapping
      const contentTypeToFolder: Record<string, string> = {
        districts: "districts",
        villages: "districts",
        cultural_content: "culture",
        content_categories: "culture",
        cms_stories: "homepage-common",
        gallery_items: "gallery",
        local_products: "products",
        travel_packages: "travel",
        tourism_listings: "travel",
        cms_events: "homepage-common",
        cms_site_settings: "homepage-common",
        destination_guides: "travel",
        destination_places: "travel"
      };

      // Get existing media URLs
      const { data: existingMedia } = await supabase
        .from("media_library")
        .select("file_url");
      const existingUrls = new Set((existingMedia || []).map(m => m.file_url));

      // Tables and their image fields to scan
      const tablesToScan = [
        { table: "districts", fields: ["image_url", "thumbnail_url"], type: "districts" },
        { table: "villages", fields: ["thumbnail_url", "hero_image_url"], type: "districts" },
        { table: "cultural_content", fields: ["hero_image", "image_gallery"], type: "cultural_content" },
        { table: "content_categories", fields: ["hero_image"], type: "content_categories" },
        { table: "cms_stories", fields: ["cover_image_url"], type: "cms_stories" },
        { table: "gallery_items", fields: ["image_url", "thumbnail_url"], type: "gallery_items" },
        { table: "local_products", fields: ["image_url", "images"], type: "local_products" },
        { table: "travel_packages", fields: ["thumbnail_image_url", "images"], type: "travel_packages" },
        { table: "tourism_listings", fields: ["thumbnail_image_url", "images"], type: "tourism_listings" },
        { table: "cms_events", fields: ["banner_image_url"], type: "cms_events" },
        { table: "destination_guides", fields: ["hero_image", "thumbnail_image"], type: "destination_guides" },
        { table: "destination_places", fields: ["image_url"], type: "destination_places" }
      ];

      for (const { table, fields, type } of tablesToScan) {
        try {
          const { data: rows } = await supabase
            .from(table as any)
            .select("*");

          if (!rows) continue;

          for (const row of rows) {
            const rowData = row as Record<string, any>;

            for (const field of fields) {
              let imageUrls: string[] = [];
              const fieldValue = rowData[field];

              if (!fieldValue) continue;

              // Handle arrays
              if (Array.isArray(fieldValue)) {
                imageUrls = fieldValue.filter(v => typeof v === 'string' && v.startsWith('http'));
              } else if (typeof fieldValue === 'string' && fieldValue.startsWith('http')) {
                imageUrls = [fieldValue];
              }

              for (const imageUrl of imageUrls) {
                discovered++;

                // Skip if already exists
                if (existingUrls.has(imageUrl)) continue;

                // Skip placeholder/unsplash images
                if (imageUrl.includes('unsplash.com') || imageUrl.includes('placeholder')) continue;

                // Extract filename from URL
                const filename = imageUrl.split('/').pop() || 'unknown';

                // Register new image
                const { data: newMedia, error: insertError } = await supabase
                  .from("media_library")
                  .insert({
                    filename,
                    file_url: imageUrl,
                    file_type: 'image/jpeg',
                    source: 'frontend-detected',
                    tags: []
                  })
                  .select()
                  .single();

                if (!insertError && newMedia) {
                  registered++;
                  existingUrls.add(imageUrl);

                  // Assign to appropriate folder
                  const folderSlug = contentTypeToFolder[type];
                  if (folderSlug && folderMap[folderSlug]) {
                    await supabase
                      .from("media_folder_assignments")
                      .insert({
                        media_id: newMedia.id,
                        folder_id: folderMap[folderSlug]
                      });
                  }

                  // Record usage
                  await supabase
                    .from("media_usage")
                    .insert({
                      media_id: newMedia.id,
                      content_type: type,
                      content_id: rowData.id,
                      page_slug: rowData.slug || null,
                      field_name: field
                    });
                }
              }
            }
          }
        } catch (e) {
          console.warn(`Error scanning table ${table}:`, e);
        }
      }

      toast({ 
        title: "Discovery Complete", 
        description: `Found ${discovered} images, registered ${registered} new images`
      });

      await fetchMedia();
      await fetchFolders();

      return { discovered, registered };
    } catch (error) {
      console.error("Error discovering images:", error);
      toast({ title: "Error", description: "Failed to discover frontend images", variant: "destructive" });
      return { discovered: 0, registered: 0 };
    }
  }, [toast, fetchMedia, fetchFolders]);

  const scanAndSyncUsage = useCallback(async () => {
    toast({ title: "Scanning", description: "Analyzing image usage across the site..." });

    try {
      const { data: media } = await supabase.from("media_library").select("id, file_url");
      if (!media?.length) {
        toast({ title: "Info", description: "No media items to scan" });
        return;
      }

      const { data: foldersData } = await supabase.from("media_folders").select("id, slug");
      const folderMap = Object.fromEntries((foldersData || []).map(f => [f.slug, f.id]));

      const contentTypeToFolder: Record<string, string> = {
        districts: "districts",
        villages: "districts",
        cultural_content: "culture",
        content_categories: "culture",
        gallery_items: "gallery",
        local_products: "products",
        travel_packages: "travel",
        tourism_listings: "travel",
        cms_site_settings: "homepage-common",
        cms_stories: "homepage-common",
        cms_events: "homepage-common"
      };

      const tables = [
        { table: "districts", field: "image_url", type: "districts" },
        { table: "districts", field: "thumbnail_url", type: "districts" },
        { table: "villages", field: "thumbnail_url", type: "districts" },
        { table: "villages", field: "hero_image_url", type: "districts" },
        { table: "cultural_content", field: "hero_image", type: "cultural_content" },
        { table: "content_categories", field: "hero_image", type: "content_categories" },
        { table: "gallery_items", field: "image_url", type: "gallery_items" },
        { table: "local_products", field: "image_url", type: "local_products" },
        { table: "travel_packages", field: "thumbnail_image_url", type: "travel_packages" },
        { table: "tourism_listings", field: "thumbnail_image_url", type: "tourism_listings" },
        { table: "cms_stories", field: "cover_image_url", type: "cms_stories" },
        { table: "cms_events", field: "banner_image_url", type: "cms_events" }
      ];

      let usageCount = 0;

      for (const { table, field, type } of tables) {
        try {
          const { data: rows } = await supabase
            .from(table as any)
            .select("*");

          if (!rows) continue;

          for (const row of rows) {
            const rowData = row as Record<string, any>;
            const imageUrl = rowData[field];
            if (!imageUrl || typeof imageUrl !== 'string') continue;

            const matchingMedia = media.find(m => 
              imageUrl === m.file_url || 
              imageUrl.includes(m.file_url) || 
              m.file_url.includes(imageUrl)
            );

            if (matchingMedia) {
              usageCount++;

              await supabase.from("media_usage").upsert({
                media_id: matchingMedia.id,
                content_type: type,
                content_id: rowData.id,
                page_slug: rowData.slug || null,
                field_name: field
              }, {
                onConflict: "media_id,content_type,content_id,field_name"
              });

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

      toast({ title: "Complete", description: `Found ${usageCount} image usages` });
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

  const clearUploadQueue = useCallback(() => {
    setUploadQueue([]);
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchMedia();
  }, [fetchFolders, fetchMedia]);

  return {
    mediaItems,
    folders,
    loading,
    uploading,
    uploadQueue,
    fetchMedia,
    fetchFolders,
    uploadMedia,
    uploadMediaBulk,
    updateMedia,
    replaceMedia,
    deleteMedia,
    assignFolder,
    removeFromFolder,
    createFolder,
    scanAndSyncUsage,
    discoverFrontendImages,
    searchMedia,
    clearUploadQueue
  };
}