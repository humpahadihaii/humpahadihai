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
  resolved_path: string | null;
  district_slug: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
  content_slug: string | null;
  content_title: string | null;
  created_at: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  mediaItem?: MediaItem;
}

export interface DiscoveryResult {
  discovered: number;
  registered: number;
  usagesCreated: number;
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
  discoverFrontendImages: () => Promise<DiscoveryResult>;
  searchMedia: (query: string) => Promise<MediaItem[]>;
  clearUploadQueue: () => void;
}

// Helper to extract image URLs from HTML content
function extractImagesFromHtml(html: string): string[] {
  if (!html) return [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urls: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && url.startsWith('http')) {
      urls.push(url);
    }
  }
  return urls;
}

// Helper to check if URL is a valid content image (not static asset)
function isContentImage(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  // Exclude common static/placeholder patterns
  if (url.includes('unsplash.com')) return false;
  if (url.includes('placeholder')) return false;
  if (url.includes('/icons/')) return false;
  if (url.includes('/logos/')) return false;
  return true;
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
        const itemUsage = (usageData?.filter(u => u.media_id === m.id) || []).map(u => ({
          ...u,
          resolved_path: u.resolved_path || null,
          district_slug: u.district_slug || null,
          category_slug: u.category_slug || null,
          subcategory_slug: u.subcategory_slug || null,
          content_slug: u.content_slug || null,
          content_title: u.content_title || null
        }));

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
    
    const initialQueue: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploadQueue(initialQueue);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
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
      const { data: currentMedia } = await supabase
        .from("media_library")
        .select("file_url")
        .eq("id", id)
        .single();

      if (!currentMedia) throw new Error("Media not found");

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

  const discoverFrontendImages = useCallback(async (): Promise<DiscoveryResult> => {
    toast({ title: "Discovering Images", description: "Scanning all frontend content for images..." });

    let discovered = 0;
    let registered = 0;
    let usagesCreated = 0;

    try {
      // Get folder mappings
      const { data: foldersData } = await supabase.from("media_folders").select("id, slug");
      const folderMap = Object.fromEntries((foldersData || []).map(f => [f.slug, f.id]));

      // Get existing media URLs
      const { data: existingMedia } = await supabase.from("media_library").select("id, file_url");
      const mediaUrlMap = new Map((existingMedia || []).map(m => [m.file_url, m.id]));

      // Helper to get or create media record
      const getOrCreateMedia = async (imageUrl: string, folderSlug?: string): Promise<string | null> => {
        if (!isContentImage(imageUrl)) return null;
        
        discovered++;
        
        if (mediaUrlMap.has(imageUrl)) {
          return mediaUrlMap.get(imageUrl) || null;
        }

        const filename = imageUrl.split('/').pop() || 'unknown';
        const { data: newMedia, error } = await supabase
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

        if (error || !newMedia) return null;

        registered++;
        mediaUrlMap.set(imageUrl, newMedia.id);

        if (folderSlug && folderMap[folderSlug]) {
          await supabase.from("media_folder_assignments").upsert({
            media_id: newMedia.id,
            folder_id: folderMap[folderSlug]
          }, { onConflict: "media_id,folder_id" });
        }

        return newMedia.id;
      };

      // Helper to create usage record with full path
      const createUsage = async (
        mediaId: string,
        contentType: string,
        contentId: string,
        fieldName: string,
        resolvedPath: string,
        hierarchy: {
          districtSlug?: string;
          categorySlug?: string;
          subcategorySlug?: string;
          contentSlug?: string;
          contentTitle?: string;
        }
      ) => {
        const { error } = await supabase.from("media_usage").upsert({
          media_id: mediaId,
          content_type: contentType,
          content_id: contentId,
          field_name: fieldName,
          page_slug: hierarchy.contentSlug || null,
          resolved_path: resolvedPath,
          district_slug: hierarchy.districtSlug || null,
          category_slug: hierarchy.categorySlug || null,
          subcategory_slug: hierarchy.subcategorySlug || null,
          content_slug: hierarchy.contentSlug || null,
          content_title: hierarchy.contentTitle || null
        }, { onConflict: "media_id,content_type,content_id,field_name" });

        if (!error) usagesCreated++;
      };

      // Load lookup data
      const { data: districts } = await supabase.from("districts").select("id, slug, name");
      const districtMap = new Map((districts || []).map(d => [d.id, d]));

      const { data: categories } = await supabase.from("content_categories").select("id, slug, name, district_id");
      const categoryMap = new Map((categories || []).map(c => [c.id, c]));

      const { data: subcategories } = await supabase.from("content_subcategories").select("id, slug, name, category_id");
      const subcategoryMap = new Map((subcategories || []).map(s => [s.id, s]));

      // ========== 1. DISTRICTS ==========
      const { data: districtRows } = await supabase.from("districts").select("*");
      for (const row of districtRows || []) {
        const resolvedPath = `/districts/${row.slug}`;
        
        for (const field of ['image_url', 'thumbnail_url']) {
          const imageUrl = (row as any)[field];
          if (!imageUrl) continue;
          
          const mediaId = await getOrCreateMedia(imageUrl, 'districts');
          if (mediaId) {
            await createUsage(mediaId, 'districts', row.id, field, resolvedPath, {
              districtSlug: row.slug,
              contentTitle: row.name
            });
          }
        }
      }

      // ========== 2. VILLAGES ==========
      const { data: villageRows } = await supabase.from("villages").select("*");
      for (const row of villageRows || []) {
        const district = districtMap.get(row.district_id);
        const resolvedPath = `/villages/${row.slug}`;
        
        for (const field of ['thumbnail_url', 'hero_image_url']) {
          const imageUrl = (row as any)[field];
          if (!imageUrl) continue;
          
          const mediaId = await getOrCreateMedia(imageUrl, 'districts');
          if (mediaId) {
            await createUsage(mediaId, 'villages', row.id, field, resolvedPath, {
              districtSlug: district?.slug,
              contentSlug: row.slug,
              contentTitle: row.name
            });
          }
        }
      }

      // ========== 3. CULTURAL CONTENT (with full hierarchy) ==========
      const { data: culturalRows } = await supabase.from("cultural_content").select("*");
      for (const row of culturalRows || []) {
        const district = districtMap.get(row.district_id);
        const category = categoryMap.get(row.category_id);
        const subcategory = row.subcategory_id ? subcategoryMap.get(row.subcategory_id) : null;
        
        // Build full frontend path: /districts/:districtSlug/:categorySlug/:subcategorySlug/:contentSlug
        let resolvedPath = `/districts/${district?.slug || 'unknown'}`;
        if (category) resolvedPath += `/${category.slug}`;
        if (subcategory) resolvedPath += `/${subcategory.slug}`;
        resolvedPath += `/${row.slug}`;

        // Single image field
        if (row.hero_image) {
          const mediaId = await getOrCreateMedia(row.hero_image, 'culture');
          if (mediaId) {
            await createUsage(mediaId, 'cultural_content', row.id, 'hero_image', resolvedPath, {
              districtSlug: district?.slug,
              categorySlug: category?.slug,
              subcategorySlug: subcategory?.slug,
              contentSlug: row.slug,
              contentTitle: row.title
            });
          }
        }

        // Gallery array
        if (row.image_gallery && Array.isArray(row.image_gallery)) {
          for (const imageUrl of row.image_gallery) {
            if (typeof imageUrl === 'string') {
              const mediaId = await getOrCreateMedia(imageUrl, 'culture');
              if (mediaId) {
                await createUsage(mediaId, 'cultural_content', row.id, 'image_gallery', resolvedPath, {
                  districtSlug: district?.slug,
                  categorySlug: category?.slug,
                  subcategorySlug: subcategory?.slug,
                  contentSlug: row.slug,
                  contentTitle: row.title
                });
              }
            }
          }
        }
      }

      // ========== 4. CONTENT CATEGORIES ==========
      const { data: categoryRows } = await supabase.from("content_categories").select("*");
      for (const row of categoryRows || []) {
        const district = districtMap.get(row.district_id);
        const resolvedPath = `/districts/${district?.slug || 'unknown'}/${row.slug}`;
        
        if (row.hero_image) {
          const mediaId = await getOrCreateMedia(row.hero_image, 'culture');
          if (mediaId) {
            await createUsage(mediaId, 'content_categories', row.id, 'hero_image', resolvedPath, {
              districtSlug: district?.slug,
              categorySlug: row.slug,
              contentTitle: row.name
            });
          }
        }
      }

      // ========== 5. CONTENT SUBCATEGORIES ==========
      const { data: subcategoryRows } = await supabase.from("content_subcategories").select("*");
      for (const row of subcategoryRows || []) {
        const category = categoryMap.get(row.category_id);
        const district = category ? districtMap.get(category.district_id) : null;
        const resolvedPath = `/districts/${district?.slug || 'unknown'}/${category?.slug || 'unknown'}/${row.slug}`;
        
        if (row.hero_image) {
          const mediaId = await getOrCreateMedia(row.hero_image, 'culture');
          if (mediaId) {
            await createUsage(mediaId, 'content_subcategories', row.id, 'hero_image', resolvedPath, {
              districtSlug: district?.slug,
              categorySlug: category?.slug,
              subcategorySlug: row.slug,
              contentTitle: row.name
            });
          }
        }
      }

      // ========== 6. TRAVEL PACKAGES ==========
      const { data: travelRows } = await supabase.from("travel_packages").select("*");
      for (const row of travelRows || []) {
        const resolvedPath = `/travel-packages/${row.slug}`;
        
        if (row.thumbnail_image_url) {
          const mediaId = await getOrCreateMedia(row.thumbnail_image_url, 'travel');
          if (mediaId) {
            await createUsage(mediaId, 'travel_packages', row.id, 'thumbnail_image_url', resolvedPath, {
              contentSlug: row.slug,
              contentTitle: row.title
            });
          }
        }

        // Gallery array
        if (row.gallery_images && Array.isArray(row.gallery_images)) {
          for (const imageUrl of row.gallery_images) {
            if (typeof imageUrl === 'string') {
              const mediaId = await getOrCreateMedia(imageUrl, 'travel');
              if (mediaId) {
                await createUsage(mediaId, 'travel_packages', row.id, 'gallery_images', resolvedPath, {
                  contentSlug: row.slug,
                  contentTitle: row.title
                });
              }
            }
          }
        }
      }

      // ========== 7. LOCAL PRODUCTS ==========
      const { data: productRows } = await supabase.from("local_products").select("*");
      for (const row of productRows || []) {
        const resolvedPath = `/products/${row.slug}`;
        
        if (row.thumbnail_image_url) {
          const mediaId = await getOrCreateMedia(row.thumbnail_image_url, 'products');
          if (mediaId) {
            await createUsage(mediaId, 'local_products', row.id, 'thumbnail_image_url', resolvedPath, {
              contentSlug: row.slug,
              contentTitle: row.name
            });
          }
        }

        if (row.gallery_images && Array.isArray(row.gallery_images)) {
          for (const imageUrl of row.gallery_images) {
            if (typeof imageUrl === 'string') {
              const mediaId = await getOrCreateMedia(imageUrl, 'products');
              if (mediaId) {
                await createUsage(mediaId, 'local_products', row.id, 'gallery_images', resolvedPath, {
                  contentSlug: row.slug,
                  contentTitle: row.name
                });
              }
            }
          }
        }
      }

      // ========== 8. TOURISM LISTINGS ==========
      const { data: listingRows } = await supabase.from("tourism_listings").select("*");
      for (const row of listingRows || []) {
        const resolvedPath = `/listings/${row.id}`;
        
        for (const field of ['thumbnail_image_url', 'image_url']) {
          const imageUrl = (row as any)[field];
          if (!imageUrl) continue;
          
          const mediaId = await getOrCreateMedia(imageUrl, 'travel');
          if (mediaId) {
            await createUsage(mediaId, 'tourism_listings', row.id, field, resolvedPath, {
              contentTitle: row.title
            });
          }
        }

        // Check for gallery_images array if exists
        const rowData = row as Record<string, any>;
        if (rowData.gallery_images && Array.isArray(rowData.gallery_images)) {
          for (const imageUrl of rowData.gallery_images) {
            if (typeof imageUrl === 'string') {
              const mediaId = await getOrCreateMedia(imageUrl, 'travel');
              if (mediaId) {
                await createUsage(mediaId, 'tourism_listings', row.id, 'gallery_images', resolvedPath, {
                  contentTitle: row.title
                });
              }
            }
          }
        }
      }

      // ========== 9. CMS EVENTS ==========
      const { data: eventRows } = await supabase.from("cms_events").select("*");
      for (const row of eventRows || []) {
        const resolvedPath = `/events/${row.slug}`;
        
        if (row.banner_image_url) {
          const mediaId = await getOrCreateMedia(row.banner_image_url, 'homepage-common');
          if (mediaId) {
            await createUsage(mediaId, 'cms_events', row.id, 'banner_image_url', resolvedPath, {
              contentSlug: row.slug,
              contentTitle: row.title
            });
          }
        }
      }

      // ========== 10. CMS STORIES ==========
      const { data: storyRows } = await supabase.from("cms_stories").select("*");
      for (const row of storyRows || []) {
        const resolvedPath = `/stories/${row.slug}`;
        
        if (row.cover_image_url) {
          const mediaId = await getOrCreateMedia(row.cover_image_url, 'homepage-common');
          if (mediaId) {
            await createUsage(mediaId, 'cms_stories', row.id, 'cover_image_url', resolvedPath, {
              contentSlug: row.slug,
              contentTitle: row.title
            });
          }
        }

        // Parse HTML body for embedded images
        if (row.body) {
          const htmlImages = extractImagesFromHtml(row.body);
          for (const imageUrl of htmlImages) {
            const mediaId = await getOrCreateMedia(imageUrl, 'homepage-common');
            if (mediaId) {
              await createUsage(mediaId, 'cms_stories', row.id, 'body_embedded', resolvedPath, {
                contentSlug: row.slug,
                contentTitle: row.title
              });
            }
          }
        }
      }

      // ========== 11. DESTINATION GUIDES ==========
      const { data: guideRows } = await supabase.from("destination_guides").select("*");
      for (const row of guideRows || []) {
        const resolvedPath = `/destinations/${row.slug}`;
        
        for (const field of ['hero_image', 'thumbnail_image']) {
          const imageUrl = (row as any)[field];
          if (!imageUrl) continue;
          
          const mediaId = await getOrCreateMedia(imageUrl, 'travel');
          if (mediaId) {
            await createUsage(mediaId, 'destination_guides', row.id, field, resolvedPath, {
              contentSlug: row.slug,
              contentTitle: row.name
            });
          }
        }
      }

      // ========== 12. DESTINATION PLACES ==========
      const { data: placeRows } = await supabase.from("destination_places").select("*");
      const { data: guideData } = await supabase.from("destination_guides").select("id, slug");
      const guideSlugMap = new Map((guideData || []).map(g => [g.id, g.slug]));

      for (const row of placeRows || []) {
        const guideSlug = guideSlugMap.get(row.destination_id) || 'unknown';
        const resolvedPath = `/destinations/${guideSlug}/${row.slug}`;
        
        if (row.main_image) {
          const mediaId = await getOrCreateMedia(row.main_image, 'travel');
          if (mediaId) {
            await createUsage(mediaId, 'destination_places', row.id, 'main_image', resolvedPath, {
              contentSlug: row.slug,
              contentTitle: row.name
            });
          }
        }

        if (row.image_gallery && Array.isArray(row.image_gallery)) {
          for (const imageUrl of row.image_gallery) {
            if (typeof imageUrl === 'string') {
              const mediaId = await getOrCreateMedia(imageUrl, 'travel');
              if (mediaId) {
                await createUsage(mediaId, 'destination_places', row.id, 'image_gallery', resolvedPath, {
                  contentSlug: row.slug,
                  contentTitle: row.name
                });
              }
            }
          }
        }
      }

      // ========== 13. GALLERY ITEMS ==========
      const { data: galleryRows } = await supabase.from("gallery_items").select("*");
      for (const row of galleryRows || []) {
        const resolvedPath = `/gallery`;
        
        for (const field of ['image_url', 'thumbnail_url']) {
          const imageUrl = (row as any)[field];
          if (!imageUrl) continue;
          
          const mediaId = await getOrCreateMedia(imageUrl, 'gallery');
          if (mediaId) {
            await createUsage(mediaId, 'gallery_items', row.id, field, resolvedPath, {
              contentTitle: row.title
            });
          }
        }
      }

      toast({ 
        title: "Discovery Complete", 
        description: `Found ${discovered} images, registered ${registered} new, created ${usagesCreated} usage records`
      });

      await fetchMedia();
      await fetchFolders();

      return { discovered, registered, usagesCreated };
    } catch (error) {
      console.error("Error discovering images:", error);
      toast({ title: "Error", description: "Failed to discover frontend images", variant: "destructive" });
      return { discovered: 0, registered: 0, usagesCreated: 0 };
    }
  }, [toast, fetchMedia, fetchFolders]);

  const scanAndSyncUsage = useCallback(async () => {
    // Now just calls discoverFrontendImages for consistency
    await discoverFrontendImages();
  }, [discoverFrontendImages]);

  const searchMedia = useCallback(async (query: string): Promise<MediaItem[]> => {
    if (!query.trim()) return mediaItems;

    const lowerQuery = query.toLowerCase();
    return mediaItems.filter(item =>
      item.filename.toLowerCase().includes(lowerQuery) ||
      item.title?.toLowerCase().includes(lowerQuery) ||
      item.alt_text?.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(t => t.toLowerCase().includes(lowerQuery)) ||
      item.usage.some(u => u.resolved_path?.toLowerCase().includes(lowerQuery))
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