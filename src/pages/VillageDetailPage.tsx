import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VillageDetailPage = () => {
  const { slug } = useParams();

  const { data: village, isLoading } = useQuery({
    queryKey: ["village", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("villages")
        .select("*, districts(name)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

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
      {village?.thumbnail_url && (
        <section className="relative h-96 overflow-hidden">
          <img
            src={village.thumbnail_url}
            alt={village.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <p className="text-lg text-white/80 mb-2">
                {village.districts?.name}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {village.name}
              </h1>
            </div>
          </div>
        </section>
      )}

      {/* Content Tabs */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
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
              <Card>
                <CardHeader>
                  <CardTitle>Introduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {village?.introduction}
                  </p>
                </CardContent>
              </Card>

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
            </TabsContent>

            <TabsContent value="traditions">
              <div className="space-y-6">
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
              </div>
            </TabsContent>

            <TabsContent value="food">
              <div className="space-y-6">
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
              </div>
            </TabsContent>

            <TabsContent value="crafts">
              <div className="space-y-6">
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
              </div>
            </TabsContent>

            <TabsContent value="stories">
              {village?.stories && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stories & Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {village.stories}
                    </p>
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
      </section>
    </div>
  );
};

export default VillageDetailPage;
