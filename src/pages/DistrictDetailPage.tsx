import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Users, 
  Mountain, 
  Utensils, 
  TreePine, 
  Landmark, 
  ChevronRight, 
  Search, 
  Home, 
  Building, 
  Map, 
  BookOpen,
  Quote,
  ArrowLeft,
  Calendar,
  Heart,
  Scroll,
  Info,
  ExternalLink
} from "lucide-react";
import { useState, useMemo } from "react";
import type { Database } from "@/integrations/supabase/types";
import DistrictMap from "@/components/DistrictMap";
import PlacesToVisit from "@/components/PlacesToVisit";
import FoodAndFestivals from "@/components/FoodAndFestivals";
import SEOHead from "@/components/SEOHead";
import { usePageSEO } from "@/hooks/useSEO";
import {
  useDistrictHotels,
  useDistrictMarketplace,
  useDistrictTravelPackages,
  useDistrictProducts,
  useOtherDistricts,
} from "@/hooks/useDistrictContent";
import DistrictHotelsSection from "@/components/district/DistrictHotelsSection";
import DistrictMarketplaceSection from "@/components/district/DistrictMarketplaceSection";
import DistrictTravelPackagesSection from "@/components/district/DistrictTravelPackagesSection";
import DistrictProductsSection from "@/components/district/DistrictProductsSection";
import OtherDistrictsSection from "@/components/district/OtherDistrictsSection";
import WeatherWidget from "@/components/weather/WeatherWidget";
import FestivalSpotlight from "@/components/festivals/FestivalSpotlight";
import EventCalendarWidget from "@/components/events/EventCalendarWidget";
import { useSeasonalContent } from "@/hooks/useSeasonalContent";


type DistrictContent = Database["public"]["Tables"]["district_content"]["Row"];
type Village = Database["public"]["Tables"]["villages"]["Row"];

const INITIAL_VILLAGES_COUNT = 12;

// Archival Section Component - Consistent with Culture/History pages
function ArchivalSection({
  id,
  title,
  icon,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section 
      id={id}
      className={`scroll-mt-24 relative bg-muted/20 border border-border/30 rounded-xl p-6 md:p-8 ${className}`}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary/40 rounded-full" />
      
      <h2 className="text-lg md:text-xl font-semibold mb-5 flex items-center gap-3 text-foreground pl-4">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span>{title}</span>
      </h2>
      <div className="pl-4">
        {children}
      </div>
    </section>
  );
}

// Seasonal District Section Component
function SeasonalDistrictSection({ districtName }: { districtName: string }) {
  const { getDistrictContent, seasonIcon, currentSeasonName } = useSeasonalContent();
  const content = getDistrictContent(districtName);
  
  return (
    <div className="relative bg-muted/20 border border-border/30 rounded-xl p-6 md:p-8">
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary/40 rounded-full" />
      <div className="pl-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl" aria-hidden="true">{seasonIcon}</span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{content.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Current season: {currentSeasonName}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content.description}
        </p>
      </div>
    </div>
  );
}

const DistrictDetailPage = () => {
  const { slug } = useParams();
  const [villageSearch, setVillageSearch] = useState("");
  const [villageTypeFilter, setVillageTypeFilter] = useState<"all" | "village" | "town" | "city">("all");
  const [showAllVillages, setShowAllVillages] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Fetch district data
  const { data: district, isLoading: districtLoading } = useQuery({
    queryKey: ["district", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch all villages for the directory (combined query - no need for separate preview query)
  const { data: allVillages } = useQuery({
    queryKey: ["district-villages", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("villages")
        .select("id, name, slug, thumbnail_url, tehsil, introduction, population, latitude, longitude")
        .eq("district_id", district.id)
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Preview villages (first 6)
  const villages = useMemo(() => allVillages?.slice(0, 6) || [], [allVillages]);

  // Filter villages by search
  const filteredVillages = useMemo(() => {
    if (!allVillages) return [];
    return allVillages.filter((village) => {
      const matchesSearch = village.name.toLowerCase().includes(villageSearch.toLowerCase());
      return matchesSearch;
    });
  }, [allVillages, villageSearch]);

  // Get villages to display based on showAllVillages state
  const displayedVillages = useMemo(() => {
    if (showAllVillages) return filteredVillages;
    return filteredVillages.slice(0, INITIAL_VILLAGES_COUNT);
  }, [filteredVillages, showAllVillages]);

  // Fetch district_content for culture (legacy)
  const { data: districtContent } = useQuery({
    queryKey: ["district-content-all", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_content")
        .select("id, title, description, image_url, category, google_map_link")
        .eq("district_id", district.id)
        .order("title");
      if (error) throw error;
      return data as DistrictContent[];
    },
    enabled: !!district?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch district_places (new table)
  const { data: districtPlaces } = useQuery({
    queryKey: ["district-places", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_places")
        .select("id, name, short_description, full_description, image_url, google_maps_url, is_highlighted, sort_order")
        .eq("district_id", district.id)
        .eq("is_active", true)
        .order("is_highlighted", { ascending: false })
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch district_foods (new table)
  const { data: districtFoods } = useQuery({
    queryKey: ["district-foods", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_foods")
        .select("id, name, description, image_url, sort_order")
        .eq("district_id", district.id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch district_festivals (new table)
  const { data: districtFestivals } = useQuery({
    queryKey: ["district-festivals", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_festivals")
        .select("id, name, description, image_url, month, sort_order")
        .eq("district_id", district.id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // New hooks for additional content
  const { data: hotels, isLoading: hotelsLoading } = useDistrictHotels(district?.id);
  const { providers, listings, isLoading: marketplaceLoading } = useDistrictMarketplace(district?.id);
  const { data: travelPackages, isLoading: packagesLoading } = useDistrictTravelPackages(district?.id);
  const { data: products, isLoading: productsLoading } = useDistrictProducts(district?.id);
  const { data: otherDistricts, isLoading: otherDistrictsLoading } = useOtherDistricts(district?.id, district?.region);

  // Culture content from legacy district_content table
  const cultureContent = useMemo(() => 
    districtContent?.filter(item => item.category === "Culture") || [],
    [districtContent]
  );

  // Legacy places from district_content (if any)
  const legacyPlacesContent = useMemo(() => 
    districtContent?.filter(item => item.category === "Place") || [],
    [districtContent]
  );

  // Legacy food from district_content (if any)
  const legacyFoodContent = useMemo(() => 
    districtContent?.filter(item => item.category === "Food") || [],
    [districtContent]
  );

  // Legacy festival from district_content (if any)
  const legacyFestivalContent = useMemo(() => 
    districtContent?.filter(item => item.category === "Festival") || [],
    [districtContent]
  );

  // Combine new tables with legacy data for places
  const combinedPlaces = useMemo(() => {
    const newPlaces = districtPlaces?.map(p => ({
      id: p.id,
      title: p.name,
      description: p.short_description || p.full_description || "",
      image_url: p.image_url,
      google_map_link: p.google_maps_url,
      category: "Place",
      is_highlighted: p.is_highlighted,
    })) || [];
    
    const legacy = legacyPlacesContent.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image_url: p.image_url,
      google_map_link: p.google_map_link,
      category: p.category,
      is_highlighted: false,
    }));
    
    return [...newPlaces, ...legacy];
  }, [districtPlaces, legacyPlacesContent]);

  // Combine new tables with legacy data for foods
  const combinedFoods = useMemo(() => {
    const newFoods = districtFoods?.map(f => ({
      id: f.id,
      title: f.name,
      description: f.description || "",
      image_url: f.image_url,
      category: "Food",
    })) || [];
    
    const legacy = legacyFoodContent.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      image_url: f.image_url,
      category: f.category,
    }));
    
    return [...newFoods, ...legacy];
  }, [districtFoods, legacyFoodContent]);

  // Combine new tables with legacy data for festivals
  const combinedFestivals = useMemo(() => {
    const newFestivals = districtFestivals?.map(f => ({
      id: f.id,
      title: f.name,
      description: f.description || "",
      image_url: f.image_url,
      category: "Festival",
      month: f.month,
    })) || [];
    
    const legacy = legacyFestivalContent.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      image_url: f.image_url,
      category: f.category,
      month: undefined,
    }));
    
    return [...newFestivals, ...legacy];
  }, [districtFestivals, legacyFestivalContent]);

  // SEO metadata using the new SEO engine with entity-specific overrides
  const seoMeta = usePageSEO('district', district ? {
    name: district.name,
    slug: district.slug,
    description: district.seo_description || district.overview,
    overview: district.seo_description || district.overview,
    image: district.seo_image_url || district.banner_image || district.image_url,
    region: district.region,
    highlights: district.highlights,
  } : {});

  // Prepare share preview overrides from entity SEO fields
  const sharePreview = district ? {
    title: district.seo_title || district.name,
    description: district.seo_description || district.overview?.slice(0, 160),
    image: district.seo_image_url || district.banner_image || district.image_url,
  } : undefined;

  // Extract insight from overview
  const getInsight = () => {
    if (!district?.overview) return null;
    const sentences = district.overview.split(/[.!?]+/).filter(s => s.trim().length > 60);
    return sentences[0]?.trim() || null;
  };

  const insight = getInsight();

  if (districtLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[50vh] bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <div className="h-8 w-1/3 bg-muted rounded mb-4" />
          <div className="h-6 w-2/3 bg-muted/70 rounded mb-8" />
          <div className="h-48 w-full bg-muted/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-border/40">
          <CardContent className="py-12 text-center">
            <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">District Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The district you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/districts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Districts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead meta={seoMeta} sharePreview={sharePreview} />

      {/* Archival Hero Section */}
      <header className="relative bg-muted/30 overflow-hidden">
        {/* Background Image with Subtle Overlay */}
        {(district.banner_image || district.image_url) && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${district.banner_image || district.image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
          </div>
        )}
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/districts" className="hover:text-foreground transition-colors">Districts</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{district.name}</span>
            </div>
          </nav>

          {/* Meta Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className="text-muted-foreground border-border/60 text-xs">
              Uttarakhand
            </Badge>
            {district.region && (
              <Badge variant="outline" className="text-muted-foreground border-border/60 text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {district.region} Region
              </Badge>
            )}
          </div>

          {/* Title - Authoritative Serif */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-serif font-bold text-foreground mb-5 max-w-4xl leading-[1.1] tracking-tight">
            {district.name}
          </h1>

          {/* Subtitle / Short Overview */}
          {district.overview && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {district.overview.substring(0, 160)}...
            </p>
          )}
        </div>
      </header>

      {/* Quick Facts Bar - Refined */}
      <section className="bg-muted/30 border-y border-border/30">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {district.population && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Population</p>
                  <p className="font-semibold text-sm">{district.population}</p>
                </div>
              </div>
            )}
            {district.geography && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mountain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Geography</p>
                  <p className="font-semibold text-sm">{district.geography}</p>
                </div>
              </div>
            )}
            {district.best_time_to_visit && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Best Time</p>
                  <p className="font-semibold text-sm">{district.best_time_to_visit}</p>
                </div>
              </div>
            )}
            {district.local_languages && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Languages</p>
                  <p className="font-semibold text-sm">{district.local_languages}</p>
                </div>
              </div>
            )}
            {allVillages && allVillages.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Villages</p>
                  <p className="font-semibold text-sm">{allVillages.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="bg-background">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Main Article - Constrained Width for Readability */}
            <article className="lg:col-span-8 lg:max-w-[800px] space-y-10 md:space-y-14">
              
              {/* Insight Callout - Editorial Highlight */}
              {insight && (
                <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/60 rounded-r-xl p-6 md:p-8">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                  <p className="text-lg md:text-xl text-foreground/90 leading-relaxed italic font-serif">
                    "{insight}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">
                    — District Overview
                  </p>
                </div>
              )}

              {/* About Section */}
              <ArchivalSection
                id="about"
                title={`About ${district.name}`}
                icon={<BookOpen className="h-5 w-5" />}
              >
                <div className="prose prose-lg max-w-none prose-p:text-foreground/80 prose-p:leading-[1.85]">
                  <p>{district.overview}</p>
                </div>
                
                {district.cultural_identity && (
                  <div className="mt-6 p-4 bg-secondary/20 rounded-lg border border-border/30">
                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Cultural Identity
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{district.cultural_identity}</p>
                  </div>
                )}
                
                {district.famous_specialties && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-primary" />
                      Famous For
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{district.famous_specialties}</p>
                  </div>
                )}
              </ArchivalSection>

              {/* Why Visit Section - Micro-section for travel intent */}
              <ArchivalSection
                id="why-visit"
                title={`Why Visit ${district.name}?`}
                icon={<Heart className="h-5 w-5" />}
              >
                <div className="space-y-3">
                  {/* Dynamic points based on district characteristics */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mountain className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {district.geography 
                        ? `Discover ${district.geography.toLowerCase()} landscapes that offer breathtaking views and serene escapes.`
                        : `Experience pristine mountain landscapes and valleys that define the natural beauty of ${district.region || 'Uttarakhand'}.`
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Landmark className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {district.cultural_identity 
                        ? `Immerse yourself in rich traditions — ${district.cultural_identity.substring(0, 100)}${district.cultural_identity.length > 100 ? '...' : ''}`
                        : `Immerse yourself in age-old ${district.region === 'Kumaon' ? 'Kumaoni' : 'Garhwali'} traditions, folk music, and community festivals.`
                      }
                    </p>
                  </div>
                  
                  {district.famous_specialties && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TreePine className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        Known for {district.famous_specialties.substring(0, 120)}{district.famous_specialties.length > 120 ? '...' : ''}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Experience the warmth of pahadi hospitality and connect with communities preserving centuries-old ways of life.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      A quieter, offbeat destination — ideal for travellers seeking authentic experiences away from crowded tourist spots.
                    </p>
                  </div>
                </div>
                
                {/* Subtle editorial links */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mb-3">Continue your exploration</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <Link 
                      to="/travel-packages" 
                      className="text-primary hover:text-primary/80 hover:underline underline-offset-2 transition-colors"
                    >
                      Explore travel experiences →
                    </Link>
                    <Link 
                      to="/culture" 
                      className="text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors"
                    >
                      Learn about local culture
                    </Link>
                  </div>
                </div>
              </ArchivalSection>

              {/* Best Time to Experience - Seasonal Content */}
              <SeasonalDistrictSection districtName={district.name} />

              {/* Experience This District - Travel Intent Block */}
              <div className="relative bg-gradient-to-br from-primary/5 via-muted/30 to-transparent border border-border/40 rounded-xl p-6 md:p-8">
                <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary/30 rounded-full" />
                <div className="pl-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Mountain className="h-5 w-5 text-primary" />
                    Experience {district.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    From its serene landscapes to vibrant local traditions, {district.name} offers a journey 
                    through the heart of {district.region || "Uttarakhand"}. Whether you seek spiritual solace, 
                    adventure in the mountains, or authentic cultural encounters — this land welcomes every traveller.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/travel-packages"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-sm text-primary font-medium transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      View travel experiences
                    </Link>
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                    >
                      <Home className="h-4 w-4 text-muted-foreground" />
                      Explore local stays
                    </Link>
                  </div>
                </div>
              </div>

              {/* Festival Spotlight */}
              {district.id && (
                <ArchivalSection
                  title="Festival Spotlight"
                  icon={<Calendar className="h-5 w-5" />}
                >
                  <FestivalSpotlight districtId={district.id} showTitle={false} limit={3} />
                </ArchivalSection>
              )}

              {/* Places to Visit Section */}
              {combinedPlaces.length > 0 && (
                <div id="places">
                  <PlacesToVisit 
                    districtName={district.name} 
                    places={combinedPlaces} 
                  />
                </div>
              )}

              {/* Food & Festivals Section */}
              <div id="heritage">
                <FoodAndFestivals
                  districtName={district.name}
                  foodItems={combinedFoods}
                  festivalItems={combinedFestivals}
                  cultureItems={cultureContent.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    image_url: c.image_url,
                    category: c.category,
                  }))}
                />
              </div>

              {/* Internal Context Links - Editorial Style */}
              <div className="pt-8 border-t border-border/40">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Continue Exploring
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/culture"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    {district.region === "Kumaon" ? "Kumaoni Culture" : "Garhwali Culture"}
                  </Link>
                  <Link
                    to="/history"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <Scroll className="h-4 w-4 text-muted-foreground" />
                    Uttarakhand History
                  </Link>
                  <Link
                    to="/travel-packages"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Travel Experiences
                  </Link>
                  <Link
                    to="/gallery"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <Mountain className="h-4 w-4 text-muted-foreground" />
                    Photo Gallery
                  </Link>
                </div>
              </div>
            </article>

            {/* Sidebar - Quick Reference */}
            <aside className="lg:col-span-4 order-first lg:order-last">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Quick Jump Navigation */}
                <Card className="border-border/40 bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Scroll className="h-4 w-4" />
                      Jump to Section
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav className="flex flex-col gap-1">
                      <a href="#about" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group">
                        <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">About</span>
                      </a>
                      <a href="#why-visit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group">
                        <Heart className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Why Visit</span>
                      </a>
                      {combinedPlaces.length > 0 && (
                        <a href="#places" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group">
                          <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Places to Visit</span>
                        </a>
                      )}
                      <a href="#heritage" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group">
                        <Landmark className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Heritage</span>
                      </a>
                      {hotels && hotels.length > 0 && (
                        <a href="#hotels" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group">
                          <Building className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Hotels</span>
                        </a>
                      )}
                      {villages && villages.length > 0 && (
                        <a href="#villages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group">
                          <Home className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Villages</span>
                        </a>
                      )}
                      <a href="#map" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group">
                        <Map className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Map</span>
                      </a>
                    </nav>
                  </CardContent>
                </Card>

                {/* Weather Widget */}
                {district.latitude && district.longitude && (
                  <WeatherWidget
                    lat={Number(district.latitude)}
                    lng={Number(district.longitude)}
                    locationName={district.name}
                  />
                )}
                
                {/* Upcoming Events */}
                <EventCalendarWidget
                  districtId={district.id}
                  title="Upcoming Events"
                  showViewAll={true}
                  compact={true}
                  limit={3}
                />
              </div>
            </aside>
          </div>
        </div>

        {/* Hotels Section */}
        <DistrictHotelsSection
          districtName={district.name}
          hotels={hotels || []}
          isLoading={hotelsLoading}
        />

        {/* Local Marketplace Section */}
        <DistrictMarketplaceSection
          districtName={district.name}
          districtSlug={district.slug}
          providers={providers}
          listings={listings}
          isLoading={marketplaceLoading}
        />

        {/* Travel Packages Section */}
        <DistrictTravelPackagesSection
          districtName={district.name}
          packages={travelPackages || []}
          isLoading={packagesLoading}
        />

        {/* Local Products Section */}
        <DistrictProductsSection
          districtName={district.name}
          products={products || []}
          isLoading={productsLoading}
        />

        {/* Villages Preview Section */}
        {villages && villages.length > 0 && (
          <section id="villages" className="py-16 px-4 bg-muted/20">
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Villages of {district.name}</h2>
                    <p className="text-muted-foreground text-sm">Explore the rural heritage</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a href="#all-villages">
                    View All <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {villages.map((village) => (
                  <Link key={village.id} to={`/villages/${village.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all group h-full border-border/40">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={village.thumbnail_url || "/placeholder.svg"}
                          alt={village.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {village.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {village.introduction?.substring(0, 100)}...
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Map Section */}
        <section id="map" className="py-16 px-4 bg-muted/10 border-t border-border/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Explore {district.name} on Map</h2>
                  <p className="text-muted-foreground text-sm">Interactive map with villages and places</p>
                </div>
              </div>
              {!showMap && (
                <Button onClick={() => setShowMap(true)}>
                  <Map className="mr-2 h-4 w-4" />
                  Load Map
                </Button>
              )}
            </div>

            {showMap && (
              <DistrictMap
                districtName={district.name}
                centerLat={district.latitude || undefined}
                centerLng={district.longitude || undefined}
                villages={
                  allVillages?.map((v) => ({
                    id: v.id,
                    name: v.name,
                    latitude: v.latitude,
                    longitude: v.longitude,
                    introduction: v.introduction,
                  })) || []
                }
                places={
                  combinedPlaces.map((p) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    google_map_link: p.google_map_link,
                  }))
                }
              />
            )}

            {!showMap && (
              <Card className="h-[300px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 border-border/40">
                <div className="text-center">
                  <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Click "Load Map" to see villages and places on an interactive map</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Other Districts Section */}
        <OtherDistrictsSection
          districts={otherDistricts || []}
          isLoading={otherDistrictsLoading}
        />

        {/* All Villages Directory */}
        {allVillages && allVillages.length > 0 && (
          <section id="all-villages" className="py-16 px-4">
            <div className="container mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Top Places in {district.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    Complete directory of {allVillages.length} settlements
                  </p>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 my-8">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by village name..."
                    value={villageSearch}
                    onChange={(e) => setVillageSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={villageTypeFilter === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setVillageTypeFilter("all")}
                  >
                    All
                  </Button>
                  <Button 
                    variant={villageTypeFilter === "village" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setVillageTypeFilter("village")}
                  >
                    <Home className="h-3 w-3 mr-1" /> Villages
                  </Button>
                  <Button 
                    variant={villageTypeFilter === "town" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setVillageTypeFilter("town")}
                  >
                    <Building className="h-3 w-3 mr-1" /> Towns
                  </Button>
                </div>
              </div>

              {/* Results count */}
              {villageSearch && (
                <p className="text-sm text-muted-foreground mb-4">
                  Found {filteredVillages.length} result{filteredVillages.length !== 1 ? 's' : ''} for "{villageSearch}"
                </p>
              )}

              {/* Villages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedVillages.map((village) => (
                  <Link key={village.id} to={`/villages/${village.slug}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full group border-border/40 hover:border-primary/30">
                      {village.thumbnail_url ? (
                        <div className="h-32 overflow-hidden rounded-t-lg">
                          <img
                            src={village.thumbnail_url}
                            alt={village.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-t-lg">
                          <Home className="h-10 w-10 text-primary/30" />
                        </div>
                      )}
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {village.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs shrink-0">
                            Village
                          </Badge>
                        </div>
                        {village.tehsil && (
                          <CardDescription className="text-xs line-clamp-1">
                            {village.tehsil} Tehsil
                          </CardDescription>
                        )}
                        {village.introduction && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {village.introduction.substring(0, 80)}...
                          </p>
                        )}
                        {village.population && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Users className="h-3 w-3" />
                            <span>{village.population.toLocaleString()} people</span>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Show More / Show Less */}
              {filteredVillages.length > INITIAL_VILLAGES_COUNT && (
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllVillages(!showAllVillages)}
                    className="min-w-[200px]"
                  >
                    {showAllVillages 
                      ? `Show Less` 
                      : `Show All ${filteredVillages.length} Villages`
                    }
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {filteredVillages.length === 0 && villageSearch && (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No villages found matching "{villageSearch}"</p>
                  <Button variant="ghost" onClick={() => setVillageSearch("")} className="mt-2">
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Related Culture & Regions - SEO Internal Linking */}
        <section className="py-12 px-4 bg-muted/20 border-t border-border/30">
          <div className="container mx-auto">
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-6">Related Culture & Regions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Culture Links */}
              <Card className="border-border/40 bg-background/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Culture & Traditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    <li>
                      <Link to="/culture" className="text-primary hover:text-primary/80 hover:underline text-sm">
                        {district.region === "Kumaon" ? "Kumaoni Cultural Traditions" : "Garhwali Folk Traditions"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/food" className="text-primary hover:text-primary/80 hover:underline text-sm">
                        Traditional Food of {district.name}
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Gallery Link */}
              <Card className="border-border/40 bg-background/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-primary" />
                    Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    <li>
                      <Link to="/gallery" className="text-primary hover:text-primary/80 hover:underline text-sm">
                        Cultural Images from {district.name} District
                      </Link>
                    </li>
                    <li>
                      <Link to="/gallery" className="text-primary hover:text-primary/80 hover:underline text-sm">
                        Uttarakhand Heritage Photos
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Nearby Districts */}
              <Card className="border-border/40 bg-background/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Explore Nearby
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {otherDistricts?.slice(0, 3).map((otherDist) => (
                      <li key={otherDist.id}>
                        <Link 
                          to={`/districts/${otherDist.slug}`} 
                          className="text-primary hover:text-primary/80 hover:underline text-sm"
                        >
                          Explore {otherDist.name} District
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DistrictDetailPage;
