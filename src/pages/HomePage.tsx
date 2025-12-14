import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, UtensilsCrossed, Camera, Palmtree } from "lucide-react";
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
import { FeaturedContentSection } from "@/components/home/FeaturedContentSection";
import { useAllHomepageCTAsGrouped } from "@/hooks/useHomepageCTAs";
import { HeroCTAs, BelowHeroCTAs, MidPageCTA, FooterCTA } from "@/components/home/CTASection";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { FadeInSection } from "@/components/PageWrapper";

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

  // Fetch ALL CTAs in a single query - then use grouped results
  const { data: ctasGrouped } = useAllHomepageCTAsGrouped();
  const heroCtas = ctasGrouped?.hero || [];
  const belowHeroCtas = ctasGrouped?.below_hero || [];
  const midPageCtas = ctasGrouped?.mid_page || [];
  const footerCtas = ctasGrouped?.footer_cta || [];

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
          {/* Dynamic Hero CTAs */}
          <HeroCTAs ctas={heroCtas} />
          {/* Hero Search CTA */}
          <div className="mt-8">
            <SearchTrigger variant="hero" />
          </div>
          <div className="mt-6">
            <HomepageVisits />
          </div>
        </div>
      </section>

      {/* Below Hero CTAs */}
      <BelowHeroCTAs ctas={belowHeroCtas} />

      {/* Recently Viewed - only shows if user has history */}
      <div className="container-wide py-6">
        <RecentlyViewed variant="horizontal" maxItems={6} />
      </div>

      {/* Introduction - CMS Driven */}
      <FadeInSection>
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
      </FadeInSection>

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

          {/* Internal Links - District Links for SEO */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Explore Uttarakhand Places</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/districts/almora" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Culture of Almora District
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/districts/pithoragarh" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Pithoragarh Traditions & Heritage
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/districts/chamoli" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Chamoli District Cultural Life
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/districts/nainital" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Nainital Lake District
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/districts/bageshwar" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Bageshwar Heritage Sites
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/districts/tehri-garhwal" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Tehri Garhwal Culture
              </Link>
            </div>
          </div>

          {/* Culture & Gallery Links */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/culture" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium">
              Garhwali and Kumaoni Folk Traditions →
            </Link>
            <Link to="/food" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium">
              Traditional Pahadi Cuisine →
            </Link>
            <Link to="/gallery" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium">
              Uttarakhand Culture Photo Gallery →
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Featured Content Sections */}
      <section className="section-padding bg-muted/40">
        <div className="container-wide">
          <FeaturedContentSection sectionKey="cultural_highlight" variant="hero" />
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <FeaturedContentSection sectionKey="local_food" variant="card" limit={3} />
            <FeaturedContentSection sectionKey="spiritual" variant="card" limit={3} />
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/40">
        <div className="container-wide">
          <FeaturedContentSection sectionKey="nature" variant="hero" />
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <FeaturedContentSection sectionKey="districts" variant="card" />
        </div>
      </section>

      {/* Mid-Page CTA Banner */}
      <MidPageCTA ctas={midPageCtas} />

      {/* Legacy Featured Highlights */}
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

      {/* Footer CTA Section */}
      <FooterCTA ctas={footerCtas} />
    </div>
  );
};

export default HomePage;
