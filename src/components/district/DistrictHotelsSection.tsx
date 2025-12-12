import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Star, MapPin, Phone, Globe, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Hotel {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  location?: string | null;
  contact_info?: string | null;
  image_url?: string | null;
  price_range?: string | null;
  rating?: number | null;
  website?: string | null;
}

interface DistrictHotelsSectionProps {
  districtName: string;
  hotels: Hotel[];
  isLoading?: boolean;
}

export default function DistrictHotelsSection({ 
  districtName, 
  hotels, 
  isLoading 
}: DistrictHotelsSectionProps) {
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!hotels || hotels.length === 0) return null;

  return (
    <section id="hotels" className="py-16 px-4 bg-secondary/10">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Hotels & Stays</h2>
              <p className="text-muted-foreground">Where to stay in {districtName}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden bg-muted">
                {hotel.image_url ? (
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-1">{hotel.name}</CardTitle>
                  <Badge variant="outline" className="shrink-0">{hotel.category}</Badge>
                </div>
                {hotel.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{hotel.location}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {hotel.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {hotel.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hotel.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{hotel.rating}</span>
                      </div>
                    )}
                    {hotel.price_range && (
                      <Badge variant="secondary">{hotel.price_range}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {hotel.website && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {hotel.contact_info && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`tel:${hotel.contact_info}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
