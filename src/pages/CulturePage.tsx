import ContentListPage from "./ContentListPage";
import { useSiteImages } from "@/hooks/useSiteImages";

export default function CulturePage() {
  const { getImage } = useSiteImages();
  const heroImage = getImage("culture_hero");
  
  return (
    <ContentListPage
      contentType="culture"
      title="Culture & Traditions"
      description="Discover the timeless heritage of Garhwal and Kumaon"
      heroGradient="from-primary/70 to-secondary/70"
      heroImage={heroImage}
    />
  );
}
