import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const DistrictsPage = () => {
  const { data: districts, isLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Group by region
  const garhwalDistricts = districts?.filter(d => d.region === 'Garhwal') || [];
  const kumaonDistricts = districts?.filter(d => d.region === 'Kumaon') || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Explore Uttarakhand's Districts
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the unique culture, traditions, and heritage of all 13 districts of Uttarakhand, 
            spanning the historic regions of Garhwal and Kumaon.
          </p>
        </div>
      </section>

      {/* Districts Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto space-y-16">
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
            <>
              {/* Garhwal Region */}
              {garhwalDistricts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <Badge variant="default" className="text-lg px-4 py-2">Garhwal Region</Badge>
                    <span className="text-muted-foreground">({garhwalDistricts.length} districts)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {garhwalDistricts.map((district) => (
                      <DistrictCard key={district.id} district={district} />
                    ))}
                  </div>
                </div>
              )}

              {/* Kumaon Region */}
              {kumaonDistricts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <Badge variant="secondary" className="text-lg px-4 py-2">Kumaon Region</Badge>
                    <span className="text-muted-foreground">({kumaonDistricts.length} districts)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kumaonDistricts.map((district) => (
                      <DistrictCard key={district.id} district={district} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

interface DistrictCardProps {
  district: {
    id: string;
    name: string;
    slug: string;
    overview: string;
    image_url?: string | null;
    population?: string | null;
    region?: string | null;
  };
}

const DistrictCard = ({ district }: DistrictCardProps) => (
  <Link to={`/districts/${district.slug}`}>
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
      <div className="h-48 overflow-hidden bg-muted">
        {district.image_url ? (
          <img
            src={district.image_url}
            alt={district.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="group-hover:text-primary transition-colors">
            {district.name}
          </CardTitle>
          {district.region && (
            <Badge variant="outline" className="text-xs">
              {district.region}
            </Badge>
          )}
        </div>
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
);

export default DistrictsPage;
