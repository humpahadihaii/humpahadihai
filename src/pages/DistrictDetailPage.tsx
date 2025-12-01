import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type DistrictContent = Database["public"]["Tables"]["district_content"]["Row"];

const DistrictDetailPage = () => {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: highlights, isLoading: highlightsLoading } = useQuery({
    queryKey: ["district-highlights", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("district_highlights")
        .select("*")
        .eq("district_id", district.id);
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

  const { data: villages, isLoading: villagesLoading } = useQuery({
    queryKey: ["villages", district?.id],
    queryFn: async () => {
      if (!district?.id) return [];
      const { data, error } = await supabase
        .from("villages")
        .select("*")
        .eq("district_id", district.id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!district?.id,
  });

  const { data: districtContent, isLoading: contentLoading } = useQuery({
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

  const filteredVillages = villages?.filter((village) =>
    village.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedHighlights = highlights?.reduce((acc, highlight) => {
    if (!acc[highlight.type]) acc[highlight.type] = [];
    acc[highlight.type].push(highlight);
    return acc;
  }, {} as Record<string, typeof highlights>);

  const festivals = districtContent?.filter((c) => c.category === "Festival") || [];
  const foods = districtContent?.filter((c) => c.category === "Food") || [];
  const places = districtContent?.filter((c) => c.category === "Place") || [];
  const culture = districtContent?.filter((c) => c.category === "Culture") || [];

  if (districtLoading) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      {district?.image_url && (
        <section className="relative h-96 overflow-hidden">
          <img
            src={district.image_url}
            alt={district.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {district.name}
              </h1>
            </div>
          </div>
        </section>
      )}

      {/* Overview & Quick Facts */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {district?.overview}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {district?.population && (
                  <div>
                    <p className="font-semibold">Population</p>
                    <p className="text-muted-foreground">{district.population}</p>
                  </div>
                )}
                {district?.geography && (
                  <div>
                    <p className="font-semibold">Geography</p>
                    <p className="text-muted-foreground">{district.geography}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Highlights Section */}
          {highlightsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            groupedHighlights && (
              <div className="space-y-12">
                {Object.entries(groupedHighlights).map(([type, items]) => (
                  <div key={type}>
                    <h2 className="text-3xl font-bold mb-6 capitalize">
                      {type === "festival" ? "Festivals" : type === "food" ? "Foods" : type === "craft" ? "Handicrafts" : "Attractions"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <Card key={item.id}>
                          {item.image_url && (
                            <div className="h-48 overflow-hidden rounded-t-lg">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <Badge variant="secondary" className="w-fit">
                              {type}
                            </Badge>
                          </CardHeader>
                          {item.description && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tabbed Content Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Explore {district?.name}</h2>
            <Tabs defaultValue="festivals" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                <TabsTrigger value="festivals">Festivals</TabsTrigger>
                <TabsTrigger value="food">Food</TabsTrigger>
                <TabsTrigger value="places">Places</TabsTrigger>
                <TabsTrigger value="culture">Culture</TabsTrigger>
              </TabsList>

              <TabsContent value="festivals" className="mt-6">
                {contentLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </div>
                ) : festivals.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No festivals information available yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {festivals.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="food" className="mt-6">
                {contentLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </div>
                ) : foods.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No food information available yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foods.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="places" className="mt-6">
                {contentLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </div>
                ) : places.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No places information available yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {places.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            {item.google_map_link && (
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a
                                  href={item.google_map_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Map
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="culture" className="mt-6">
                {contentLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </div>
                ) : culture.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No culture information available yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {culture.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Villages Directory */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Villages</h2>
            <Input
              placeholder="Search villages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-6 max-w-md"
            />
            {villagesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredVillages?.map((village) => (
                  <Link key={village.id} to={`/villages/${village.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      {village.thumbnail_url && (
                        <div className="h-32 overflow-hidden rounded-t-lg">
                          <img
                            src={village.thumbnail_url}
                            alt={village.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{village.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DistrictDetailPage;
