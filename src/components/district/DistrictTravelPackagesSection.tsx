import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, Mountain, ChevronRight, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  thumbnail_image_url?: string | null;
  duration_days?: number | null;
  difficulty_level?: string | null;
  price_per_person?: number | null;
  destination?: string | null;
  region?: string | null;
  is_featured?: boolean;
}

interface DistrictTravelPackagesSectionProps {
  districtName: string;
  packages: TravelPackage[];
  isLoading?: boolean;
}

export default function DistrictTravelPackagesSection({
  districtName,
  packages,
  isLoading,
}: DistrictTravelPackagesSectionProps) {
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!packages || packages.length === 0) return null;

  return (
    <section id="travel-packages" className="py-16 px-4 bg-secondary/10">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Travel Packages</h2>
              <p className="text-muted-foreground">Curated trips in & around {districtName}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/travel-packages">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Link key={pkg.id} to={`/travel-packages/${pkg.slug}`} className="block group">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden bg-muted relative">
                  {pkg.thumbnail_image_url ? (
                    <img
                      src={pkg.thumbnail_image_url}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Package className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  {pkg.is_featured && (
                    <Badge className="absolute top-3 right-3 bg-primary">Featured</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors mb-2">
                    {pkg.title}
                  </h3>
                  {pkg.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {pkg.short_description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    {pkg.duration_days && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {pkg.duration_days} days
                      </span>
                    )}
                    {pkg.difficulty_level && (
                      <span className="flex items-center gap-1">
                        <Mountain className="h-4 w-4" />
                        {pkg.difficulty_level}
                      </span>
                    )}
                    {pkg.destination && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {pkg.destination}
                      </span>
                    )}
                  </div>
                  {pkg.price_per_person && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Starting from</span>
                      <span className="text-lg font-bold text-primary">
                        ₹{pkg.price_per_person.toLocaleString()}/person
                      </span>
                    </div>
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
