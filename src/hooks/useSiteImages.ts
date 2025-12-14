import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchSiteImages = async () => {
  const { data, error } = await supabase
    .from("site_images")
    .select("key, image_url");

  if (error) throw error;
  
  return data.reduce((acc, img) => {
    // Only include images that are not placeholder
    if (img.image_url && img.image_url !== '/placeholder.svg') {
      acc[img.key] = img.image_url;
    }
    return acc;
  }, {} as Record<string, string>);
};

export const useSiteImages = () => {
  const { data: images = {} } = useQuery({
    queryKey: ['site-images'],
    queryFn: fetchSiteImages,
    staleTime: 15 * 60 * 1000, // 15 minutes - images rarely change
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnWindowFocus: false,
  });

  const getImage = (key: string, fallback: string = "/placeholder.svg") => {
    return images[key] || fallback;
  };

  return { images, getImage };
};