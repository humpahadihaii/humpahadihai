import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Mountain, Utensils, TreePine, Landmark, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type DistrictContent = Database["public"]["Tables"]["district_content"]["Row"];
type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];

const DistrictDetailPage = () => {
  const { slug } = useParams();
  const [villageSearch, setVillageSearch] = useState("");

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

  // Fetch villages linked to this district
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

  // Fetch all villages for search
  const { data: allVillages } = useQuery({
    queryKey: ["district-all-villages", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("villages")
        .select("id, name, slug, thumbnail_url, tehsil, population")
        .eq("district_id", district.id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

  // Fetch food content linked to this district
  const { data: foodItems } = useQuery({
    queryKey: ["district-food", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("district_id", district.id)
        .eq("type", "food")
        .eq("status", "published")
        .limit(4);
      if (error) throw error;
      return data as ContentItem[];
    },
    enabled: !!district?.id,
  });

  // Fetch culture content linked to this district
  const { data: cultureItems } = useQuery({
    queryKey: ["district-culture", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("district_id", district.id)
        .eq("type", "culture")
        .eq("status", "published")
        .limit(4);
      if (error) throw error;
      return data as ContentItem[];
    },
    enabled: !!district?.id,
  });

  // Fetch travel content linked to this district
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

  // Fetch district_content for additional items
  const { data: districtContent } = useQuery({
    queryKey: ["district-content", district?.id],
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

  const filteredVillages = allVillages?.filter((village) =>
    village.name.toLowerCase().includes(villageSearch.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={district.banner_image || district.image_url || "/placeholder.svg"}
          alt={district.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Badge variant="secondary" className="mb-4">Uttarakhand</Badge>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">About {district.name}</CardTitle>
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 1: Villages */}
      {villages && villages.length > 0 && (
        <section className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Villages of {district.name}</h2>
                <p className="text-muted-foreground mt-2">Explore the rural heritage</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="#all-villages">
                  View All <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
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

      {/* Section 2: Famous Food */}
      {foodItems && foodItems.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Utensils className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold">Famous Food</h2>
                  <p className="text-muted-foreground">Culinary delights of {district.name}</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/food">
                  Explore More <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {foodItems.map((item) => (
                <Link key={item.id} to={`/food/${item.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all group h-full">
                    {item.main_image_url && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={item.main_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <Badge variant="secondary" className="w-fit mb-2">Food</Badge>
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

      {/* Section 3: Culture & Heritage */}
      {cultureItems && cultureItems.length > 0 && (
        <section className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold">Culture & Heritage</h2>
                  <p className="text-muted-foreground">Traditions and festivals</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/culture">
                  Explore More <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cultureItems.map((item) => (
                <Link key={item.id} to={`/culture/${item.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all group h-full">
                    {item.main_image_url && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={item.main_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <Badge variant="secondary" className="w-fit mb-2">Culture</Badge>
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

      {/* Section 4: Tourist Spots */}
      {travelItems && travelItems.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold">Tourist Spots</h2>
                  <p className="text-muted-foreground">Places to visit in {district.name}</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/travel">
                  Explore More <ChevronRight className="ml-2 h-4 w-4" />
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

      {/* District Content Section (from district_content table) */}
      {districtContent && districtContent.length > 0 && (
        <section className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8">More to Explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {districtContent.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{item.category}</Badge>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    {item.google_map_link && (
                      <Button variant="link" className="p-0 mt-2" asChild>
                        <a href={item.google_map_link} target="_blank" rel="noopener noreferrer">
                          <MapPin className="h-4 w-4 mr-1" /> View on Map
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Villages Directory */}
      {allVillages && allVillages.length > 0 && (
        <section id="all-villages" className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-2">Villages Directory</h2>
            <p className="text-muted-foreground mb-6">
              {allVillages.length} villages in {district.name}
            </p>
            <div className="relative max-w-md mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search villages..."
                value={villageSearch}
                onChange={(e) => setVillageSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredVillages?.map((village) => (
                <Link key={village.id} to={`/villages/${village.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {village.thumbnail_url && (
                      <div className="h-24 overflow-hidden rounded-t-lg">
                        <img
                          src={village.thumbnail_url}
                          alt={village.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{village.name}</CardTitle>
                      {village.tehsil && (
                        <CardDescription className="text-xs">{village.tehsil}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DistrictDetailPage;