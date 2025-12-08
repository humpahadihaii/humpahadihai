import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Search, Star, Package } from "lucide-react";
import { Helmet } from "react-helmet";

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

  const getStockBadge = (status: string) => {
    switch (status) {
      case "in_stock": return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case "out_of_stock": return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      case "made_to_order": return <Badge className="bg-blue-100 text-blue-800">Made to Order</Badge>;
      default: return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Pahadi Store | Local Products | Hum Pahadi Haii</title>
        <meta name="description" content="Shop authentic Pahadi products - handcrafted items, organic foods, traditional clothing, and more from Uttarakhand." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary mb-4">Pahadi Store</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover authentic local products from the hills of Uttarakhand. Handcrafted with love and tradition.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square overflow-hidden">
                    {product.thumbnail_image_url ? (
                      <img
                        src={product.thumbnail_image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-secondary">
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg line-clamp-1 mb-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mb-3">{product.short_description}</CardDescription>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                        {product.unit_label && (
                          <span className="text-sm text-muted-foreground">/{product.unit_label}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStockBadge(product.stock_status)}
                      <Button size="sm" asChild>
                        <Link to={`/products/${product.slug}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
