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

      {/* Hero Section - Single strong image with dark overlay */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
            {siteName}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            {tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button 
              size="lg" 
              asChild 
              className="bg-secondary hover:bg-secondary/90 text-white shadow-lg press-effect min-h-[48px] px-8 text-base font-medium"
            >
              <Link to={primaryCtaUrl}>{primaryCtaText}</Link>
            </Button>
          </div>
          {/* Hero Search CTA */}
          <div className="mt-8">
            <SearchTrigger variant="hero" />
          </div>
          <div className="mt-6">
            <HomepageVisits />
          </div>
        </div>
      </section>

      {/* Introduction - CMS Driven */}
      <section className="section-padding bg-muted/40">
        <div className="container-narrow text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-6">
            {welcomeSection?.title || "Welcome to Our Pahadi World"}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {welcomeSection?.body || "Hum Pahadi Haii is your digital gateway to the heart of Uttarakhand. We preserve and share the timeless traditions, rich culture, authentic cuisine, and stunning natural beauty of the Garhwal and Kumaon regions."}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group card-interactive bg-card border-border/60 hover:border-primary/20"
              >
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} bg-current/10 mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{feature.description}</p>
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent font-medium"
                  >
                    <Link to={feature.link}>Learn More →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      {highlights.length > 0 && (
        <section className="section-padding bg-muted/40">
          <div className="container-wide">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-center text-primary mb-10">
              Featured Highlights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {highlights.map((highlight) => (
                <Link 
                  key={highlight.id} 
                  to={highlight.button_link}
                  className="relative rounded-2xl overflow-hidden group block"
                >
                  {highlight.image_url && (
                    <img 
                      src={highlight.image_url} 
                      alt={highlight.title} 
                      loading="lazy" 
                      width="496" 
                      height="320" 
                      className="w-full h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-103" 
                    />
                  )}
                  <div className="absolute inset-0 hero-overlay">
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3 className="font-display text-xl md:text-2xl font-semibold mb-2">{highlight.title}</h3>
                      <p className="text-sm md:text-base text-white/85 line-clamp-2 mb-3">{highlight.description}</p>
                      <span className="inline-flex items-center text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        {highlight.button_text} →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Districts Weather - with hover effects */}
      <section className="section-padding-sm bg-muted/40">
        <div className="container-wide">
          <AllDistrictsWeather />
        </div>
      </section>

      {/* Festival Spotlight & Events Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Festival Spotlight - Takes 2 columns */}
            <div className="lg:col-span-2">
              <FestivalSpotlight limit={3} />
            </div>
            
            {/* Sidebar with Events only */}
            <div className="space-y-6">
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
