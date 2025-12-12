import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, UtensilsCrossed, Camera, Palmtree, Calendar } from "lucide-react";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useCMSSettings, useCMSContentSection } from "@/hooks/useCMSSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImageFallback from "@/assets/hero-mountains.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import { HomepageVisits } from "@/components/HomepageVisits";
import { FeaturedCardSection } from "@/components/FeaturedCardSection";
import { SearchTrigger } from "@/components/search";
import FestivalSpotlight from "@/components/festivals/FestivalSpotlight";
import WeatherWidget from "@/components/weather/WeatherWidget";
import AllDistrictsWeather from "@/components/weather/AllDistrictsWeather";
import EventCalendarWidget from "@/components/events/EventCalendarWidget";
import { useSiteSharePreview } from "@/hooks/useSharePreview";

const HomePage = () => {
  const { getImage } = useSiteImages();
  const { data: settings } = useCMSSettings();
  const { data: welcomeSection } = useCMSContentSection("welcome");
  const { settings: sharePreview } = useSiteSharePreview();
  
  const heroImage = settings?.hero_background_image || getImage('hero_banner', heroImageFallback);

  // Use CMS settings or fallback to defaults
  const siteName = settings?.site_name || "Hum Pahadi Haii";
  const tagline = settings?.tagline || "Celebrating Uttarakhand's Culture, Tradition & Heritage";
  const metaTitle = settings?.meta_title || `${siteName} - ${tagline}`;
  const metaDescription = settings?.meta_description || "Discover Uttarakhand's rich culture, traditional food, festivals, handicrafts, and natural beauty. Explore Pahadi traditions from Garhwal and Kumaon regions.";
  
  // Share preview from admin settings - ensure absolute URL for images
  const ogTitle = sharePreview?.default_title || metaTitle;
  const ogDescription = sharePreview?.default_description || metaDescription;
  const rawOgImage = sharePreview?.default_image_url;
  // Ensure og:image is absolute URL (required by social media crawlers)
  const ogImage = rawOgImage?.startsWith('http') 
    ? rawOgImage 
    : rawOgImage 
      ? `https://humpahadihaii.in${rawOgImage}` 
      : "https://humpahadihaii.in/logo.jpg";

  const { data: highlights = [] } = useQuery({
    queryKey: ["featured-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_highlights")
        .select("*")
        .eq("status", "published")
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch upcoming events for homepage widget
  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["homepage-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id, title, slug, short_description, cover_image_url,
          start_at, end_at, event_type, is_free, ticket_price,
          village:villages(id, name, slug)
        `)
        .eq("status", "published")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Fetch a major district for weather (Dehradun as default)
  const { data: weatherDistrict } = useQuery({
    queryKey: ["weather-district"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, latitude, longitude")
        .eq("name", "Dehradun")
        .single();
      if (error) {
        // Fallback to first district with coordinates
        const { data: fallback } = await supabase
          .from("districts")
          .select("id, name, latitude, longitude")
          .not("latitude", "is", null)
          .limit(1)
          .single();
        return fallback;
      }
      return data;
    },
  });

  const features = [
    {
      icon: Mountain,
      title: "Culture & Traditions",
      description: "Explore the vibrant festivals, folk music, and traditional crafts of Garhwal and Kumaon regions.",
      link: "/culture",
      color: "text-primary"
    },
    {
      icon: UtensilsCrossed,
      title: "Food Trails",
      description: "Discover authentic Pahadi cuisine, from Kafuli to Bal Mithai, and traditional cooking methods.",
      link: "/food",
      color: "text-secondary"
    },
    {
      icon: Palmtree,
      title: "Travel & Nature",
      description: "Journey through Char Dham, hidden valleys, breathtaking treks, and pristine mountain landscapes.",
      link: "/travel",
      color: "text-accent"
    },
    {
      icon: Camera,
      title: "Photo Gallery",
      description: "Experience Uttarakhand through stunning photography of festivals, people, nature, and heritage.",
      link: "/gallery",
      color: "text-secondary"
    },
  ];

  const primaryCtaText = settings?.primary_cta_text || "Explore Culture";
  const primaryCtaUrl = settings?.primary_cta_url || "/culture";
  const secondaryCtaText = settings?.secondary_cta_text || "View Gallery";
  const secondaryCtaUrl = settings?.secondary_cta_url || "/gallery";

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://humpahadihaii.in" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@humpahadihaii" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background/95"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            {siteName}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-2xl mx-auto drop-shadow">
            {tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90 text-white shadow-lg">
              <Link to={primaryCtaUrl}>{primaryCtaText}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/90 hover:bg-white border-white text-primary shadow-lg">
              <Link to={secondaryCtaUrl}>{secondaryCtaText}</Link>
            </Button>
          </div>
          {/* Hero Search CTA */}
          <div className="mt-6">
            <SearchTrigger variant="hero" />
          </div>
          <div className="mt-6">
            <HomepageVisits />
          </div>
        </div>
      </section>

      {/* Introduction - CMS Driven */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            {welcomeSection?.title || "Welcome to Our Pahadi World"}
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {welcomeSection?.body || "Hum Pahadi Haii is your digital gateway to the heart of Uttarakhand. We preserve and share the timeless traditions, rich culture, authentic cuisine, and stunning natural beauty of the Garhwal and Kumaon regions. Join us in celebrating the warmth and heritage of the Himalayas."}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
                <CardContent className="p-8">
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h3 className="text-2xl font-bold text-primary mb-3">{feature.title}</h3>
                  <p className="text-foreground/70 mb-6 leading-relaxed">{feature.description}</p>
                  <Button asChild variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.link}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      {highlights.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
              Featured Highlights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                  {highlight.image_url && (
                    <img 
                      src={highlight.image_url} 
                      alt={highlight.title} 
                      loading="lazy" 
                      width="496" 
                      height="320" 
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t ${highlight.gradient_color} to-transparent`}>
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{highlight.title}</h3>
                      <p className="mb-4 opacity-90">{highlight.description}</p>
                      <Button asChild variant="outline" className="bg-white/90 text-primary hover:bg-white">
                        <Link to={highlight.button_link}>{highlight.button_text}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </section>
      )}

      {/* All Districts Weather */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <AllDistrictsWeather />
        </div>
      </section>

      {/* Festival Spotlight & Events Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Festival Spotlight - Takes 2 columns */}
            <div className="lg:col-span-2">
              <FestivalSpotlight limit={3} />
            </div>
            
            {/* Sidebar with Events & Weather */}
            <div className="space-y-6">
              {/* Weather Widget */}
              {weatherDistrict && (
                <WeatherWidget
                  lat={Number(weatherDistrict.latitude)}
                  lng={Number(weatherDistrict.longitude)}
                  locationName={weatherDistrict.name}
                />
              )}
              
              {/* Upcoming Events */}
              <EventCalendarWidget
                events={upcomingEvents as any}
                isLoading={eventsLoading}
                title="Upcoming Events"
                showViewAll={true}
                compact={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Card Section - CMS Driven */}
      <FeaturedCardSection slug="follow-our-journey" />
    </div>
  );
};

export default HomePage;
