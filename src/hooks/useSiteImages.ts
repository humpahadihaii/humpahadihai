import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchSiteImages = async () => {
  const { data, error } = await supabase
    .from("site_images")
    .select("key, image_url");

  if (error) throw error;
  
  return data.reduce((acc, img) => {
    acc[img.key] = img.image_url;
    return acc;
  }, {} as Record<string, string>);
};

export const useSiteImages = () => {
  const { data: images = {} } = useQuery({
    queryKey: ['site-images'],
    queryFn: fetchSiteImages,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const getImage = (key: string, fallback: string = "/placeholder.svg") => {
    return images[key] || fallback;
  };

  return { images, getImage };
};
