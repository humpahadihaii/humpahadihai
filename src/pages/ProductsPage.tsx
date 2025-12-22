import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Search, Star, Package } from "lucide-react";
import { Helmet } from "react-helmet";
import { AuthenticityBadge, CulturalCueBadge } from "@/components/ui/authenticity-badge";
import { CardImage } from "@/components/ui/fast-image";

interface LocalProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  price: number;
  price_currency: string;
  unit_label: string | null;
  stock_status: string;
  thumbnail_image_url: string | null;
  tags: string[] | null;
  is_featured: boolean;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("local_product_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ProductCategory[];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["local-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("local_products")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LocalProduct[];
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Check if product has cultural tags
  const getCulturalTag = (tags: string[] | null) => {
    if (!tags) return null;
    const culturalKeywords = ["handmade", "traditional", "organic", "local", "artisan", "handcrafted"];
    return tags.find(tag => 
      culturalKeywords.some(kw => tag.toLowerCase().includes(kw))
    );
  };

  return (
    <>
      <Helmet>
        <title>Pahadi Store | Authentic Local Products from Uttarakhand</title>
        <meta name="description" content="Shop authentic Pahadi products - handcrafted items, organic foods, traditional clothing, and more from the hills of Uttarakhand." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10">
            <ShoppingBag className="h-14 w-14 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary mb-3">Pahadi Store</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Discover authentic local products from the hills of Uttarakhand. Handcrafted with love and tradition.
            </p>
            <AuthenticityBadge className="mx-auto" />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-square bg-muted" />
                  <CardContent className="space-y-3 pt-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map((product) => {
                const culturalTag = getCulturalTag(product.tags);
                
                return (
                  <Link 
                    key={product.id} 
                    to={`/products/${product.slug}`}
                    className="group block"
                  >
                    <Card className="h-full overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/60">
                      {/* Image with badges */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {product.thumbnail_image_url ? (
                          <CardImage
                            src={product.thumbnail_image_url}
                            alt={product.name}
                            className="group-hover:scale-105 transition-transform duration-300"
                            priority={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                        
                        {/* Overlay badges */}
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
                          <div className="flex flex-col gap-1.5">
                            {product.stock_status === "out_of_stock" && (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                            {product.stock_status === "made_to_order" && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Made to Order
                              </Badge>
                            )}
                          </div>
                          {product.is_featured && (
                            <Badge className="bg-secondary text-secondary-foreground">
                              <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                            </Badge>
                          )}
                        </div>

                        {/* Cultural tag at bottom of image */}
                        {culturalTag && (
                          <div className="absolute bottom-2 left-2">
                            <CulturalCueBadge label={culturalTag} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        
                        {product.short_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {product.short_description}
                          </p>
                        )}
                        
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-primary">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.unit_label && (
                            <span className="text-sm text-muted-foreground">
                              /{product.unit_label}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
