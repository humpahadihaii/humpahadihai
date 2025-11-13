import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteImage {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  image_url: string;
  category: string;
  created_at: string;
}

export const useSiteImages = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("site_images")
      .select("key, image_url");

    if (!error && data) {
      const imageMap = data.reduce((acc, img) => {
        acc[img.key] = img.image_url;
        return acc;
      }, {} as Record<string, string>);
      setImages(imageMap);
    }
    setLoading(false);
  };

  const getImage = (key: string, fallback: string = "/placeholder.svg") => {
    return images[key] || fallback;
  };

  return { images, getImage, loading };
};
