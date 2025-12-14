import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchSiteImages = async () => {
  const { data, error } = await supabase
    .from("site_images")
    .select("key, image_url");

  if (error) throw error;
  
  const images = data.reduce((acc, img) => {
    // Only include images that are not placeholder
    if (img.image_url && img.image_url !== '/placeholder.svg') {
      acc[img.key] = img.image_url;
    }
    return acc;
  }, {} as Record<string, string>);

  // Preload critical images in background (hero, banner images)
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

  const getImage = (key: string, fallback: string = "/placeholder.svg") => {
    return images[key] || fallback;
  };

  return { images, getImage };
};