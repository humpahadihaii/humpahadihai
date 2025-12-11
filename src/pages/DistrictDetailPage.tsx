import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Mountain, Utensils, TreePine, Landmark, ChevronRight, Search, Home, Building, Map, BookOpen } from "lucide-react";
import { useState, useMemo, lazy, Suspense } from "react";
import type { Database } from "@/integrations/supabase/types";
import PlacesToVisit from "@/components/PlacesToVisit";
import FoodAndFestivals from "@/components/FoodAndFestivals";
import SEOHead from "@/components/SEOHead";
import { usePageSEO } from "@/hooks/useSEO";

// Lazy load the map component
const DistrictMap = lazy(() => import("@/components/DistrictMap"));

type DistrictContent = Database["public"]["Tables"]["district_content"]["Row"];
type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];
type Village = Database["public"]["Tables"]["villages"]["Row"];

const INITIAL_VILLAGES_COUNT = 12;

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
  });

  // Fetch villages linked to this district (preview)
  const { data: villages } = useQuery({
    queryKey: ["district-villages", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("villages")
        .select("*")
        .eq("district_id", district.id)
        .eq("status", "published")
        .order("name")
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

  // Fetch all villages for the directory
  const { data: allVillages } = useQuery({
    queryKey: ["district-all-villages", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("villages")
        .select("id, name, slug, thumbnail_url, tehsil, population, introduction, status, latitude, longitude")
        .eq("district_id", district.id)
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

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
        .select("*")
        .eq("district_id", district.id)
        .order("title");
      if (error) throw error;
      return data as DistrictContent[];
    },
    enabled: !!district?.id,
  });

  // Fetch district_places (new table)
  const { data: districtPlaces } = useQuery({
    queryKey: ["district-places", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_places")
        .select("*")
        .eq("district_id", district.id)
        .eq("is_active", true)
        .order("is_highlighted", { ascending: false })
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

  // Fetch district_foods (new table)
  const { data: districtFoods } = useQuery({
    queryKey: ["district-foods", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_foods")
        .select("*")
        .eq("district_id", district.id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

  // Fetch district_festivals (new table)
  const { data: districtFestivals } = useQuery({
    queryKey: ["district-festivals", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_festivals")
        .select("*")
        .eq("district_id", district.id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

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

  // Fetch additional content_items linked to this district
  const { data: travelItems } = useQuery({
    queryKey: ["district-travel", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("district_id", district.id)
        .eq("type", "travel")
        .eq("status", "published")
        .limit(4);
      if (error) throw error;
      return data as ContentItem[];
    },
    enabled: !!district?.id,
  });

  if (districtLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-[60vh] w-full" />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">District Not Found</h2>
            <Button asChild>
              <Link to="/districts">Back to Districts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SEO metadata using the new SEO engine
  const seoMeta = usePageSEO('district', {
    name: district.name,
    slug: district.slug,
    description: district.overview,
    overview: district.overview,
    image: district.banner_image || district.image_url,
    region: district.region,
    highlights: district.highlights,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead meta={seoMeta} />

      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={district.banner_image || district.image_url || "/placeholder.svg"}
          alt={`${district.name} district landscape`}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Uttarakhand</Badge>
              <Badge variant="outline">{district.region || "Kumaon/Garhwal"}</Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4">
              {district.name}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {district.overview?.substring(0, 150)}...
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts Bar */}
      <section className="bg-secondary/30 border-y">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {district.population && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Population</p>
                  <p className="font-semibold">{district.population}</p>
                </div>
              </div>
            )}
            {district.geography && (
              <div className="flex items-center gap-3">
                <Mountain className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Geography</p>
                  <p className="font-semibold">{district.geography}</p>
                </div>
              </div>
            )}
            {district.best_time_to_visit && (
              <div className="flex items-center gap-3">
                <TreePine className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Best Time</p>
                  <p className="font-semibold">{district.best_time_to_visit}</p>
                </div>
              </div>
            )}
            {district.local_languages && (
              <div className="flex items-center gap-3">
                <Landmark className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Languages</p>
                  <p className="font-semibold">{district.local_languages}</p>
                </div>
              </div>
            )}
            {allVillages && allVillages.length > 0 && (
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Villages</p>
                  <p className="font-semibold">{allVillages.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Encyclopedia Navigation */}
      <section className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 py-3 overflow-x-auto">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-muted-foreground shrink-0">Jump to:</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="#about">About</a>
              </Button>
              {combinedPlaces.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <a href="#places">Places</a>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <a href="#heritage">Heritage</a>
              </Button>
              {villages && villages.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <a href="#villages">Villages</a>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <a href="#map">Map</a>
              </Button>
            </div>
          </nav>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                About {district.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {district.overview}
              </p>
              {district.cultural_identity && (
                <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                  <p className="font-semibold mb-2">Cultural Identity</p>
                  <p className="text-muted-foreground">{district.cultural_identity}</p>
                </div>
              )}
              {district.famous_specialties && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                  <p className="font-semibold mb-2">Famous For</p>
                  <p className="text-muted-foreground">{district.famous_specialties}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Places to Visit Section */}
      <div id="places">
        <PlacesToVisit 
          districtName={district.name} 
          places={combinedPlaces} 
        />
      </div>

      {/* Food & Festivals Section */}
      <div id="heritage" className="bg-secondary/10">
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

      {/* Villages Preview Section */}
      {villages && villages.length > 0 && (
        <section id="villages" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Home className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold">Villages of {district.name}</h2>
                  <p className="text-muted-foreground">Explore the rural heritage</p>
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
                  <Card className="overflow-hidden hover:shadow-xl transition-all group h-full">
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
      <section id="map" className="py-16 px-4 bg-secondary/10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Map className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Explore {district.name} on Map</h2>
                <p className="text-muted-foreground">Interactive map with villages and places</p>
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
            <Suspense fallback={
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </Card>
            }>
              <DistrictMap
                districtName={district.name}
                centerLat={district.latitude || undefined}
                centerLng={district.longitude || undefined}
                villages={allVillages?.map(v => ({
                  id: v.id,
                  name: v.name,
                  latitude: v.latitude,
                  longitude: v.longitude,
                  introduction: v.introduction,
                })) || []}
                places={combinedPlaces.map(p => ({
                  id: p.id,
                  title: p.title,
                  description: p.description,
                  google_map_link: p.google_map_link,
                }))}
              />
            </Suspense>
          )}

          {!showMap && (
            <Card className="h-[300px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
              <div className="text-center">
                <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Click "Load Map" to see villages and places on an interactive map</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Travel Packages Section */}
      {travelItems && travelItems.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold">Travel Packages</h2>
                  <p className="text-muted-foreground">Curated trips in {district.name}</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/travel">
                  View All <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {travelItems.map((item) => (
                <Link key={item.id} to={`/travel/${item.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all group h-full">
                    {item.main_image_url && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={item.main_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <Badge variant="secondary" className="w-fit mb-2">Travel</Badge>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Villages Directory */}
      {allVillages && allVillages.length > 0 && (
        <section id="all-villages" className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Home className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">All Villages & Towns in {district.name}</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Complete directory of {allVillages.length} settlements in {district.name} district
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
                  <Card className="hover:shadow-lg transition-all cursor-pointer h-full group border-border/50 hover:border-primary/30">
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
    </div>
  );
};

export default DistrictDetailPage;
