import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

  const filteredVillages = villages?.filter((village) =>
    village.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedHighlights = highlights?.reduce((acc, highlight) => {
    if (!acc[highlight.type]) acc[highlight.type] = [];
    acc[highlight.type].push(highlight);
    return acc;
  }, {} as Record<string, typeof highlights>);

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
