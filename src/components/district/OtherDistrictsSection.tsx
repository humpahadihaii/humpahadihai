import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface District {
  id: string;
  name: string;
  slug: string;
  overview?: string | null;
  image_url?: string | null;
  region?: string | null;
}

interface OtherDistrictsSectionProps {
  districts: District[];
  isLoading?: boolean;
}

export default function OtherDistrictsSection({
  districts,
  isLoading,
}: OtherDistrictsSectionProps) {
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!districts || districts.length === 0) return null;

  return (
    <section id="other-districts" className="py-16 px-4 bg-secondary/10">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">Explore Other Districts</h2>
            <p className="text-muted-foreground">Discover more of Uttarakhand</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {districts.map((district) => (
            <Link key={district.id} to={`/districts/${district.slug}`} className="block group">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-24 overflow-hidden bg-muted relative">
                  {district.image_url ? (
                    <img
                      src={district.image_url}
                      alt={district.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                    {district.name}
                    <ChevronRight className="h-3 w-3" />
                  </h4>
                  {district.region && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {district.region}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
