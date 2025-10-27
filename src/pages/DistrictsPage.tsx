import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const DistrictsPage = () => {
  const { data: districts, isLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Explore Uttarakhand's Districts
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the unique culture, traditions, and heritage of all 13 districts of Uttarakhand
          </p>
        </div>
      </section>

      {/* Districts Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {districts?.map((district) => (
                <Link key={district.id} to={`/districts/${district.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {district.image_url && (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={district.image_url}
                          alt={district.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{district.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {district.overview}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {district.population && (
                        <p className="text-sm text-muted-foreground">
                          Population: {district.population}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DistrictsPage;
