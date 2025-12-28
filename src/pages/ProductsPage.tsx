import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Search, Star, Package, ArrowRight, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet";
import { AuthenticityBadge, CulturalCueBadge } from "@/components/ui/authenticity-badge";
import { Button } from "@/components/ui/button";

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

  const categoryName = categoryFilter !== "all" 
    ? categories.find(c => c.id === categoryFilter)?.name 
    : null;

  return (
    <>
      <Helmet>
        <title>Pahadi Store | Authentic Local Products from Uttarakhand</title>
        <meta name="description" content="Shop authentic Pahadi products - handcrafted items, organic foods, traditional clothing, and more from the hills of Uttarakhand." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <section className="py-10 md:py-16 px-4 bg-gradient-to-b from-primary/5 via-muted/30 to-background">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Authentic Pahadi Products</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Pahadi Store
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
              Discover authentic local products from the hills of Uttarakhand. Handcrafted with love and tradition.
            </p>
            <AuthenticityBadge className="mx-auto" />
          </div>
        </section>

        {/* Filters - Sticky */}
        <section className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 py-4 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-52 h-11">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-8 md:py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : (
                  <>
                    <span className="font-medium text-foreground">{filteredProducts.length}</span>
                    {" "}products {categoryName && `in ${categoryName}`}
                  </>
                )}
              </p>
              {(searchQuery || categoryFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="overflow-hidden border-0 shadow-sm">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <CardContent className="space-y-3 pt-4 pb-4">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground mb-6">Try adjusting your search or filters</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  View all products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => {
                  const culturalTag = getCulturalTag(product.tags);
                  const isOutOfStock = product.stock_status === "out_of_stock";
                  
                  return (
                    <Link 
                      key={product.id} 
                      to={`/products/${product.slug}`}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                    >
                      <Card className={`h-full overflow-hidden border-0 shadow-sm transition-all duration-300 rounded-xl ${
                        isOutOfStock 
                          ? 'opacity-75' 
                          : 'hover:shadow-xl md:hover:-translate-y-1'
                      }`}>
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          {product.thumbnail_image_url ? (
                            <img
                              src={product.thumbnail_image_url}
                              alt={product.name}
                              loading={index < 8 ? "eager" : "lazy"}
                              decoding={index < 8 ? "sync" : "async"}
                              className={`w-full h-full object-cover transition-transform duration-300 ${
                                !isOutOfStock ? 'group-hover:scale-105' : ''
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <ShoppingBag className="h-10 w-10 text-primary/40" />
                            </div>
                          )}
                          
                          {/* Badges overlay */}
                          <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
                            <div className="flex flex-col gap-1.5">
                              {isOutOfStock && (
                                <Badge variant="destructive" className="text-xs font-medium">
                                  Sold Out
                                </Badge>
                              )}
                              {product.stock_status === "made_to_order" && (
                                <Badge className="bg-blue-500/90 text-white text-xs font-medium">
                                  Made to Order
                                </Badge>
                              )}
                            </div>
                            {product.is_featured && (
                              <Badge className="bg-amber-500/90 text-white text-xs font-medium">
                                <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                              </Badge>
                            )}
                          </div>

                          {/* Cultural tag */}
                          {culturalTag && (
                            <div className="absolute bottom-2 left-2">
                              <CulturalCueBadge label={culturalTag} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <CardContent className="p-3 md:p-4">
                          <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1.5 group-hover:text-primary transition-colors min-h-[2.5rem]">
                            {product.name}
                          </h3>
                          
                          {product.short_description && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3 hidden sm:block">
                              {product.short_description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg md:text-xl font-bold text-primary">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.unit_label && (
                                <span className="text-xs text-muted-foreground">
                                  /{product.unit_label}
                                </span>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                              <ArrowRight className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: "🏔️", label: "Made in Uttarakhand" },
                { icon: "🤝", label: "Direct from Artisans" },
                { icon: "✨", label: "Handcrafted Quality" },
                { icon: "📦", label: "Secure Packaging" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Back to Marketplace */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/marketplace">
                Explore Full Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductsPage;
