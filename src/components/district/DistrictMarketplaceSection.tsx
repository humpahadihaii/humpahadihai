import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Star, MapPin, ChevronRight, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Provider {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  image_url?: string | null;
  is_verified?: boolean;
  rating?: number | null;
}

interface Listing {
  id: string;
  title: string;
  short_description?: string | null;
  category: string;
  base_price?: number | null;
  price_unit?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  provider?: {
    id: string;
    name: string;
    type: string;
    is_verified: boolean;
    rating?: number | null;
  } | null;
}

interface DistrictMarketplaceSectionProps {
  districtName: string;
  districtSlug: string;
  providers: Provider[];
  listings: Listing[];
  isLoading?: boolean;
}

export default function DistrictMarketplaceSection({
  districtName,
  districtSlug,
  providers,
  listings,
  isLoading,
}: DistrictMarketplaceSectionProps) {
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (providers.length === 0 && listings.length === 0) return null;

  return (
    <section id="marketplace" className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Local Marketplace</h2>
              <p className="text-muted-foreground">Stays, guides & experiences in {districtName}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to={`/marketplace?district=${districtSlug}`}>
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Verified Providers */}
        {providers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Verified Providers</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex-shrink-0 w-56 bg-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {provider.is_verified && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Check className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                    {provider.rating && (
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {provider.rating}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1">{provider.name}</h4>
                  <Badge variant="outline" className="text-xs mt-1">{provider.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.slice(0, 8).map((listing) => (
              <Link key={listing.id} to="/marketplace" className="block group">
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-32 overflow-hidden bg-muted relative">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    {listing.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h4>
                    {listing.provider && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        by {listing.provider.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">{listing.category}</Badge>
                      {listing.base_price && (
                        <span className="text-sm font-semibold text-primary">
                          ₹{listing.base_price.toLocaleString()}
                          {listing.price_unit && <span className="text-xs font-normal">/{listing.price_unit}</span>}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
