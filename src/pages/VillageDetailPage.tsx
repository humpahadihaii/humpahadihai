import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Landmark, ChevronRight, ArrowLeft } from "lucide-react";

const VillageDetailPage = () => {
  const { slug } = useParams();

  const { data: village, isLoading } = useQuery({
    queryKey: ["village", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("villages")
        .select("*, districts(id, name, slug)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch related content from the same district
  const { data: relatedFood } = useQuery({
    queryKey: ["village-related-food", village?.district_id],
    queryFn: async () => {
      if (!village?.district_id) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("id, title, slug, main_image_url")
        .eq("district_id", village.district_id)
        .eq("type", "food")
        .eq("status", "published")
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!village?.district_id,
  });

  const { data: relatedTravel } = useQuery({
    queryKey: ["village-related-travel", village?.district_id],
    queryFn: async () => {
      if (!village?.district_id) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("id, title, slug, main_image_url")
        .eq("district_id", village.district_id)
        .eq("type", "travel")
        .eq("status", "published")
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!village?.district_id,
  });

  const { data: relatedCulture } = useQuery({
    queryKey: ["village-related-culture", village?.district_id],
    queryFn: async () => {
      if (!village?.district_id) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("id, title, slug, main_image_url")
        .eq("district_id", village.district_id)
        .eq("type", "culture")
        .eq("status", "published")
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!village?.district_id,
  });

  const hasRelatedContent = 
    (relatedFood && relatedFood.length > 0) || 
    (relatedTravel && relatedTravel.length > 0) || 
    (relatedCulture && relatedCulture.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={village?.thumbnail_url || "/placeholder.svg"}
          alt={village?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            {village?.districts && (
              <Link 
                to={`/districts/${village.districts.slug}`}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {village.districts.name} District
              </Link>
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {village?.name}
            </h1>
            {village?.tehsil && (
              <Badge variant="secondary">{village.tehsil} Tehsil</Badge>
            )}
          </div>
        </div>
      </section>

      {/* Content with Sidebar Layout */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="introduction" className="space-y-8">
                <TabsList className="flex flex-wrap h-auto gap-2">
                  <TabsTrigger value="introduction">Introduction</TabsTrigger>
                  <TabsTrigger value="traditions">Traditions & Festivals</TabsTrigger>
                  <TabsTrigger value="food">Foods & Recipes</TabsTrigger>
                  <TabsTrigger value="crafts">Handicrafts</TabsTrigger>
                  <TabsTrigger value="stories">Stories</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="introduction" className="space-y-6">
                  {village?.introduction ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Introduction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {village.introduction}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Introduction content coming soon...</p>
                        <p className="text-sm mt-2">This village is being documented.</p>
                      </CardContent>
                    </Card>
                  )}

                  {village?.history && (
                    <Card>
                      <CardHeader>
                        <CardTitle>History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {village.history}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {village?.population && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Population</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {village.population.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">residents</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="traditions">
                  <div className="space-y-6">
                    {village?.traditions || village?.festivals ? (
                      <>
                        {village?.traditions && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Local Traditions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {village.traditions}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {village?.festivals && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Festivals</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {village.festivals}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <p>Traditions & festivals content coming soon...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="food">
                  <div className="space-y-6">
                    {village?.foods || village?.recipes ? (
                      <>
                        {village?.foods && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Local Foods</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {village.foods}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {village?.recipes && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Traditional Recipes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {village.recipes}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <p>Foods & recipes content coming soon...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="crafts">
                  <div className="space-y-6">
                    {village?.handicrafts || village?.artisans ? (
                      <>
                        {village?.handicrafts && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Handicrafts</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {village.handicrafts}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {village?.artisans && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Local Artisans</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {village.artisans}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <p>Handicrafts content coming soon...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stories">
                  {village?.stories ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Stories & Folklore</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {village.stories}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Stories & folklore content coming soon...</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="gallery">
                  <div className="space-y-6">
                    {village?.gallery_images && village.gallery_images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {village.gallery_images.map((imageUrl, index) => (
                          <div key={index} className="overflow-hidden rounded-lg aspect-video">
                            <img
                              src={imageUrl}
                              alt={`${village.name} - ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-12">
                        No gallery images available
                      </p>
                    )}

                    {village?.travel_tips && (
                      <Card className="mt-8">
                        <CardHeader>
                          <CardTitle>Travel Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {village.travel_tips}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - More in District */}
            <div className="lg:col-span-1">
              {hasRelatedContent && village?.districts && (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      More in {village.districts.name}
                    </CardTitle>
                    <CardDescription>
                      Explore nearby attractions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Related Food */}
                    {relatedFood && relatedFood.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Utensils className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Local Food</h4>
                        </div>
                        <div className="space-y-2">
                          {relatedFood.map((item) => (
                            <Link
                              key={item.id}
                              to={`/food/${item.slug}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              {item.main_image_url && (
                                <img
                                  src={item.main_image_url}
                                  alt={item.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <span className="text-sm font-medium line-clamp-2">{item.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Travel */}
                    {relatedTravel && relatedTravel.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Places to Visit</h4>
                        </div>
                        <div className="space-y-2">
                          {relatedTravel.map((item) => (
                            <Link
                              key={item.id}
                              to={`/travel/${item.slug}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              {item.main_image_url && (
                                <img
                                  src={item.main_image_url}
                                  alt={item.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <span className="text-sm font-medium line-clamp-2">{item.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Culture */}
                    {relatedCulture && relatedCulture.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Landmark className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Culture & Heritage</h4>
                        </div>
                        <div className="space-y-2">
                          {relatedCulture.map((item) => (
                            <Link
                              key={item.id}
                              to={`/culture/${item.slug}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              {item.main_image_url && (
                                <img
                                  src={item.main_image_url}
                                  alt={item.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <span className="text-sm font-medium line-clamp-2">{item.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/districts/${village.districts.slug}`}>
                        Explore {village.districts.name}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VillageDetailPage;