import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Package, ShoppingBag, Star, Check, ChevronRight, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Provider {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  image_url?: string | null;
  is_verified?: boolean;
  is_local?: boolean;
  rating?: number | null;
  phone?: string | null;
  email?: string | null;
}

interface Listing {
  id: string;
  title: string;
  short_description?: string | null;
  category: string;
  base_price?: number | null;
  price_unit?: string | null;
  image_url?: string | null;
}

interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  thumbnail_image_url?: string | null;
  duration_days?: number | null;
  price_per_person?: number | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail_image_url?: string | null;
  price?: number | null;
}

interface VillageMarketplaceSectionProps {
  villageName: string;
  providers: Provider[];
  listings: Listing[];
  packages: TravelPackage[];
  products: Product[];
  isLoading?: boolean;
}

export default function VillageMarketplaceSection({
  villageName,
  providers,
  listings,
  packages,
  products,
  isLoading,
}: VillageMarketplaceSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const hasContent = providers.length > 0 || listings.length > 0 || packages.length > 0 || products.length > 0;
  
  if (!hasContent) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p>No local economy listings yet</p>
          <p className="text-sm mt-2">Local providers, stays, and products will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Local Providers */}
      {providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" />
              Local Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {provider.image_url ? (
                    <img
                      src={provider.image_url}
                      alt={provider.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <Store className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium line-clamp-1">{provider.name}</h4>
                      {provider.is_verified && (
                        <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                          <Check className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Badge variant="outline" className="text-xs">{provider.type}</Badge>
                      {provider.is_local && (
                        <Badge variant="outline" className="text-xs text-green-600">Local</Badge>
                      )}
                      {provider.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {provider.rating}
                        </span>
                      )}
                    </div>
                    {provider.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {provider.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marketplace Listings */}
      {listings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Stays & Experiences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  to="/marketplace"
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-20 h-16 rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h4>
                    <Badge variant="outline" className="text-xs mt-1">{listing.category}</Badge>
                    {listing.short_description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {listing.short_description}
                      </p>
                    )}
                    {listing.base_price && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        From ₹{listing.base_price.toLocaleString()}
                        {listing.price_unit && <span className="text-xs font-normal">/{listing.price_unit}</span>}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Travel Packages */}
      {packages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Travel Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/travel-packages/${pkg.slug}`}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  {pkg.thumbnail_image_url ? (
                    <img
                      src={pkg.thumbnail_image_url}
                      alt={pkg.title}
                      className="w-20 h-16 rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {pkg.title}
                    </h4>
                    {pkg.duration_days && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {pkg.duration_days} days
                      </Badge>
                    )}
                    {pkg.short_description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {pkg.short_description}
                      </p>
                    )}
                    {pkg.price_per_person && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        ₹{pkg.price_per_person.toLocaleString()}/person
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Products */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Local Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden bg-muted">
                      {product.thumbnail_image_url ? (
                        <img
                          src={product.thumbnail_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      {product.price && (
                        <p className="text-primary font-bold text-sm">
                          ₹{product.price.toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA to Marketplace */}
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link to="/marketplace">
            Explore Full Marketplace
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
