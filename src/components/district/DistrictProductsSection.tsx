import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  thumbnail_image_url?: string | null;
  price?: number | null;
  price_currency?: string | null;
  is_featured?: boolean;
  stock_status?: string | null;
}

interface DistrictProductsSectionProps {
  districtName: string;
  products: Product[];
  isLoading?: boolean;
}

export default function DistrictProductsSection({
  districtName,
  products,
  isLoading,
}: DistrictProductsSectionProps) {
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section id="products" className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Local Products</h2>
              <p className="text-muted-foreground">Handcrafted goods from {districtName}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">
              Shop All <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="block group">
              <Card className="h-full overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {product.thumbnail_image_url ? (
                    <img
                      src={product.thumbnail_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <ShoppingBag className="h-10 w-10 text-primary/30" />
                    </div>
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Featured</Badge>
                  )}
                  {product.stock_status === "out_of_stock" && (
                    <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1 min-h-[2.5rem]">
                    {product.name}
                  </h4>
                  {product.price && (
                    <p className="text-lg font-bold text-primary">
                      {product.price_currency || "₹"}{product.price.toLocaleString()}
                    </p>
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
