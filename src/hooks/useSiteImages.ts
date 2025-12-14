import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const fetchSiteImages = async () => {
  const { data, error } = await supabase
    .from("site_images")
    .select("key, image_url");

  if (error) throw error;
  
  // Safely handle null/undefined data
  if (!data || !Array.isArray(data)) {
    return {};
  }
  
  const images = data.reduce((acc, img) => {
    // Only include images that are not placeholder
    if (img.image_url && img.image_url !== '/placeholder.svg') {
      acc[img.key] = img.image_url;
    }
    return acc;
  }, {} as Record<string, string>);

  return images;
};

export const useSiteImages = () => {
  const { data: images = {} } = useQuery({
    queryKey: ['site-images'],
    queryFn: fetchSiteImages,
    staleTime: 1000 * 60 * 30, // 30 minutes - images rarely change
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Move browser-only preload logic to useEffect (runs only on client)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const criticalKeys = ['hero_banner', 'culture_hero', 'food_hero', 'travel_hero'];
    criticalKeys.forEach(key => {
      if (images[key]) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = images[key];
        // Only add if not already present
        if (!document.querySelector(`link[href="${images[key]}"]`)) {
          document.head.appendChild(link);
        }
      }
    });
  }, [images]);

  const getImage = (key: string, fallback: string = "/placeholder.svg") => {
    return images[key] || fallback;
  };

  return { images, getImage };
};
