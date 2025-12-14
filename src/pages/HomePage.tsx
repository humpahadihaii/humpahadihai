import { lazy, Suspense, useEffect } from "react";
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
import { SearchTrigger } from "@/components/search";
import { useSiteSharePreview } from "@/hooks/useSharePreview";
import { useAllHomepageCTAsGrouped } from "@/hooks/useHomepageCTAs";
import { HeroCTAs, BelowHeroCTAs, MidPageCTA, FooterCTA } from "@/components/home/CTASection";
import { FadeInSection } from "@/components/PageWrapper";
import { LazySection } from "@/components/LazySection";

// Lazy load below-fold components
const HomepageVisits = lazy(() => import("@/components/HomepageVisits").then(m => ({ default: m.HomepageVisits })));
const FeaturedCardSection = lazy(() => import("@/components/FeaturedCardSection").then(m => ({ default: m.FeaturedCardSection })));
const FestivalSpotlight = lazy(() => import("@/components/festivals/FestivalSpotlight"));
const AllDistrictsWeather = lazy(() => import("@/components/weather/AllDistrictsWeather"));
const EventCalendarWidget = lazy(() => import("@/components/events/EventCalendarWidget"));
const FeaturedContentSection = lazy(() => import("@/components/home/FeaturedContentSection").then(m => ({ default: m.FeaturedContentSection })));
const RecentlyViewed = lazy(() => import("@/components/RecentlyViewed").then(m => ({ default: m.RecentlyViewed })));

// Skeleton components for Suspense fallbacks
const CardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
  </div>
);

const WeatherSkeleton = () => (
  <div className="rounded-xl border border-border/50 p-4">
    <Skeleton className="h-6 w-48 mb-4" />
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
      {Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  </div>
);

const HomePage = () => {
  const { getImage } = useSiteImages();
  const { data: settings } = useCMSSettings();
  const { data: welcomeSection } = useCMSContentSection("welcome");
  const { settings: sharePreview } = useSiteSharePreview();
  
  const heroImage = settings?.hero_background_image || getImage('hero_banner', heroImageFallback);

  // Remove static hero shell on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__removeStaticHero) {
      window.__removeStaticHero();
    }
  }, []);

  // CMS settings with fallbacks
  const siteName = settings?.site_name || "Hum Pahadi Haii";
  const tagline = settings?.tagline || "Celebrating Uttarakhand's Culture, Tradition & Heritage";
  const metaTitle = settings?.meta_title || `${siteName} - ${tagline}`;
  const metaDescription = settings?.meta_description || "Discover Uttarakhand's rich culture, traditional food, festivals, handicrafts, and natural beauty. Explore Pahadi traditions from Garhwal and Kumaon regions.";
  
  // Share preview
  const ogTitle = sharePreview?.default_title || metaTitle;
  const ogDescription = sharePreview?.default_description || metaDescription;
  const rawOgImage = sharePreview?.default_image_url;
  const ogImage = rawOgImage?.startsWith('http') 
    ? rawOgImage 
    : rawOgImage 
      ? `https://humpahadihaii.in${rawOgImage}` 
      : "https://humpahadihaii.in/logo.jpg";

  // Defer non-critical queries
  const { data: highlights = [] } = useQuery({
    queryKey: ["featured-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_highlights")
        .select("id, title, description, button_text, button_link, image_url, order_position")
        .eq("status", "published")
        .order("order_position", { ascending: true })
        .limit(4);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 min
    gcTime: 1000 * 60 * 30,
  });

  // Defer events query - only fetch when needed
  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["homepage-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`id, title, slug, short_description, cover_image_url, start_at, end_at, event_type, is_free, village:villages(id, name, slug)`)
        .eq("status", "published")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const features = [
    { icon: Mountain, title: "Culture & Traditions", description: "Explore the vibrant festivals, folk music, and traditional crafts of Garhwal and Kumaon regions.", link: "/culture", color: "text-primary" },
    { icon: UtensilsCrossed, title: "Food Trails", description: "Discover authentic Pahadi cuisine, from Kafuli to Bal Mithai, and traditional cooking methods.", link: "/food", color: "text-secondary" },
    { icon: Palmtree, title: "Travel & Nature", description: "Journey through Char Dham, hidden valleys, breathtaking treks, and pristine mountain landscapes.", link: "/travel", color: "text-accent" },
    { icon: Camera, title: "Photo Gallery", description: "Experience Uttarakhand through stunning photography of festivals, people, nature, and heritage.", link: "/gallery", color: "text-secondary" },
  ];

  const { data: ctasGrouped } = useAllHomepageCTAsGrouped();
  const heroCtas = ctasGrouped?.hero || [];
  const belowHeroCtas = ctasGrouped?.below_hero || [];
  const midPageCtas = ctasGrouped?.mid_page || [];
  const footerCtas = ctasGrouped?.footer_cta || [];

  return (
    <div className="min-h-screen">
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
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
        {/* Preload hero image for LCP */}
        <link rel="preload" as="image" href={heroImage} />
      </Helmet>

      {/* Hero Section - Critical for LCP */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Uttarakhand Mountains" 
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
            style={{ contentVisibility: 'auto' }}
          />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
            {siteName}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            {tagline}
          </p>
          <HeroCTAs ctas={heroCtas} />
          <div className="mt-8">
            <SearchTrigger variant="hero" />
          </div>
          <div className="mt-6">
            <Suspense fallback={<Skeleton className="h-8 w-32 mx-auto" />}>
              <HomepageVisits />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Below Hero CTAs - Above fold */}
      <BelowHeroCTAs ctas={belowHeroCtas} />

      {/* Recently Viewed - Lazy */}
      <LazySection className="container-wide py-6" minHeight="0px" rootMargin="50px">
        <RecentlyViewed variant="horizontal" maxItems={6} />
      </LazySection>

      {/* Introduction - CMS Driven (Above fold on most screens) */}
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
              <Card key={index} className="group card-interactive bg-card border-border/60 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} bg-current/10 mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{feature.description}</p>
                  <Button asChild variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent font-medium">
                    <Link to={feature.link}>Learn More →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Internal Links */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Explore Uttarakhand Places</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { to: "/districts/almora", text: "Culture of Almora District" },
                { to: "/districts/pithoragarh", text: "Pithoragarh Traditions & Heritage" },
                { to: "/districts/chamoli", text: "Chamoli District Cultural Life" },
                { to: "/districts/nainital", text: "Nainital Lake District" },
                { to: "/districts/bageshwar", text: "Bageshwar Heritage Sites" },
                { to: "/districts/tehri-garhwal", text: "Tehri Garhwal Culture" },
              ].map((link, i) => (
                <span key={link.to} className="contents">
                  {i > 0 && <span className="text-muted-foreground">•</span>}
                  <Link to={link.to} className="text-primary hover:text-primary/80 hover:underline text-sm">{link.text}</Link>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/culture" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium">Garhwali and Kumaoni Folk Traditions →</Link>
            <Link to="/food" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium">Traditional Pahadi Cuisine →</Link>
            <Link to="/gallery" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium">Uttarakhand Culture Photo Gallery →</Link>
          </div>
        </div>
      </section>

      {/* Dynamic Featured Content - Lazy loaded */}
      <LazySection className="section-padding bg-muted/40" fallback={<div className="container-wide"><CardSkeleton /></div>}>
        <div className="container-wide">
          <FeaturedContentSection sectionKey="cultural_highlight" variant="hero" />
        </div>
      </LazySection>

      <LazySection className="section-padding" fallback={<div className="container-wide"><CardSkeleton /></div>}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <FeaturedContentSection sectionKey="local_food" variant="card" limit={3} />
            <FeaturedContentSection sectionKey="spiritual" variant="card" limit={3} />
          </div>
        </div>
      </LazySection>

      <LazySection className="section-padding bg-muted/40" fallback={<div className="container-wide"><CardSkeleton /></div>}>
        <div className="container-wide">
          <FeaturedContentSection sectionKey="nature" variant="hero" />
        </div>
      </LazySection>

      <LazySection className="section-padding" fallback={<div className="container-wide"><CardSkeleton /></div>}>
        <div className="container-wide">
          <FeaturedContentSection sectionKey="districts" variant="card" />
        </div>
      </LazySection>

      {/* Mid-Page CTA */}
      <MidPageCTA ctas={midPageCtas} />

      {/* Legacy Featured Highlights */}
      {highlights.length > 0 && (
        <LazySection className="section-padding bg-muted/40" minHeight="300px">
          <div className="container-wide">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-center text-primary mb-10">Featured Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {highlights.map((highlight) => (
                <Link key={highlight.id} to={highlight.button_link} className="relative rounded-2xl overflow-hidden group block">
                  {highlight.image_url && (
                    <img src={highlight.image_url} alt={highlight.title} loading="lazy" width="496" height="320" className="w-full h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-103" />
                  )}
                  <div className="absolute inset-0 hero-overlay">
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3 className="font-display text-xl md:text-2xl font-semibold mb-2">{highlight.title}</h3>
                      <p className="text-sm md:text-base text-white/85 line-clamp-2 mb-3">{highlight.description}</p>
                      <span className="inline-flex items-center text-sm font-medium text-white/90 group-hover:text-white transition-colors">{highlight.button_text} →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </LazySection>
      )}

      {/* Weather - Lazy loaded (below fold) */}
      <LazySection className="section-padding-sm bg-muted/40" fallback={<div className="container-wide"><WeatherSkeleton /></div>}>
        <div className="container-wide">
          <AllDistrictsWeather />
        </div>
      </LazySection>

      {/* Festival & Events - Lazy */}
      <LazySection className="section-padding" fallback={<div className="container-wide"><CardSkeleton /></div>}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FestivalSpotlight limit={3} />
            </div>
            <div className="space-y-6">
              <EventCalendarWidget events={upcomingEvents as any} isLoading={eventsLoading} title="Upcoming Events" showViewAll={true} compact={true} />
            </div>
          </div>
        </div>
      </LazySection>

      {/* Featured Card Section */}
      <LazySection minHeight="200px">
        <FeaturedCardSection slug="follow-our-journey" />
      </LazySection>

      {/* Footer CTA */}
      <FooterCTA ctas={footerCtas} />
    </div>
  );
};

// Add type for window
declare global {
  interface Window {
    __removeStaticHero?: () => void;
  }
}

export default HomePage;
