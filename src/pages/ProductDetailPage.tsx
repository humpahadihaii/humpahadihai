import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeft, Tag, CheckCircle, ChevronRight, Home } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { usePageSEO } from "@/hooks/useSEO";
import { BookingModal } from "@/components/BookingModal";
import { BookingContactPrompt } from "@/components/BookingContactPrompt";
import { AuthenticityBadge, CulturalCueBadge } from "@/components/ui/authenticity-badge";
import { FastImage } from "@/components/ui/fast-image";

const productOrderSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be under 255 characters"),
  phone: z.string().trim().max(20, "Phone must be under 20 characters").optional().or(z.literal("")),
  city: z.string().trim().max(100, "City must be under 100 characters").optional().or(z.literal("")),
  pincode: z.string().trim().max(10, "Pincode must be under 10 characters").optional().or(z.literal("")),
  quantity: z.number().int().min(1, "At least 1 quantity required").max(1000, "Max quantity is 1000"),
  preferred_delivery: z.string().trim().max(100, "Delivery preference must be under 100 characters").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message must be under 1000 characters").optional().or(z.literal("")),
});

interface LocalProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  full_description: string | null;
  price: number;
  price_currency: string;
  unit_label: string | null;
  stock_status: string;
  thumbnail_image_url: string | null;
  gallery_images: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
}

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEnquirySuccess, setIsEnquirySuccess] = useState(false);
  const [submittedEnquiryData, setSubmittedEnquiryData] = useState<typeof formData | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    pincode: "",
    quantity: 1,
    preferred_delivery: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["local-product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("local_products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as LocalProduct;
    },
    enabled: !!slug,
  });

  // Fetch related products from same category
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.category_id, product?.id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      const { data, error } = await supabase
        .from("local_products")
        .select("id, name, slug, thumbnail_image_url, price, price_currency")
        .eq("is_active", true)
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .order("is_featured", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id && !!product?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    try {
      const validatedData = productOrderSchema.parse({
        ...formData,
        quantity: Number(formData.quantity),
      });
      
      const { error } = await supabase.from("product_order_requests").insert({
        local_product_id: product.id,
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        city: validatedData.city || null,
        pincode: validatedData.pincode || null,
        quantity: validatedData.quantity,
        preferred_delivery: validatedData.preferred_delivery || null,
        message: validatedData.message || null,
      });

      if (error) throw error;

      toast.success("Order request submitted! We'll contact you soon.");
      setSubmittedEnquiryData({ ...formData });
      setIsEnquirySuccess(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0]?.message || "Please check your input");
      } else {
        console.error("Error submitting order:", error);
        toast.error("Failed to submit order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnquiryDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setIsEnquirySuccess(false);
      setSubmittedEnquiryData(null);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        city: "",
        pincode: "",
        quantity: 1,
        preferred_delivery: "",
        message: "",
      });
    }
  };

  // SEO metadata with entity-specific overrides
  const seoMeta = usePageSEO('product', product ? {
    name: product.name,
    title: product.seo_title || product.name,
    slug: product.slug,
    description: product.seo_description || product.short_description || product.full_description,
    image: product.seo_image_url || product.gallery_images?.[0],
    price: product.price,
  } : null);

  const sharePreview = product ? {
    title: product.seo_title || product.name,
    description: product.seo_description || product.short_description?.slice(0, 160),
    image: product.seo_image_url || product.gallery_images?.[0],
    ogType: 'product',
  } : undefined;

  const getStockBadge = (status: string) => {
    switch (status) {
      case "in_stock": return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">In Stock</Badge>;
      case "out_of_stock": return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Out of Stock</Badge>;
      case "made_to_order": return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Made to Order</Badge>;
      default: return null;
    }
  };

  // Get cultural tags
  const getCulturalTags = (tags: string[] | null) => {
    if (!tags) return [];
    const culturalKeywords = ["handmade", "traditional", "organic", "local", "artisan", "handcrafted"];
    return tags.filter(tag => 
      culturalKeywords.some(kw => tag.toLowerCase().includes(kw))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-5xl animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const culturalTags = getCulturalTags(product.tags);

  return (
    <>
      <SEOHead meta={seoMeta} sharePreview={sharePreview} />

      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/products" className="hover:text-foreground transition-colors">
              Pahadi Store
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted border">
                {product.thumbnail_image_url ? (
                  <FastImage
                    src={product.thumbnail_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <ShoppingBag className="h-24 w-24 text-primary/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Authenticity Badge + Stock */}
              <div className="flex flex-wrap items-center gap-3">
                <AuthenticityBadge />
                {getStockBadge(product.stock_status)}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{product.name}</h1>
              
              {/* Short description */}
              {product.short_description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.unit_label && (
                  <span className="text-lg text-muted-foreground">/{product.unit_label}</span>
                )}
              </div>

              {/* Cultural & regular tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {culturalTags.map((tag, i) => (
                    <CulturalCueBadge key={i} label={tag} />
                  ))}
                  {product.tags.filter(t => !culturalTags.includes(t)).map((tag, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  size="lg" 
                  className="flex-1" 
                  disabled={product.stock_status === "out_of_stock"}
                  onClick={() => setIsBookingOpen(true)}
                >
                  {product.stock_status === "out_of_stock" ? "Out of Stock" : "Order Now"}
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={handleEnquiryDialogClose}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="flex-1" disabled={product.stock_status === "out_of_stock"}>
                      Enquire
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    {isEnquirySuccess && submittedEnquiryData ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <CheckCircle className="h-16 w-16 text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Order Request Submitted!</h3>
                        <p className="text-muted-foreground mb-4">
                          Thank you! We've received your order for {product.name}. We will contact you soon.
                        </p>
                        
                        <BookingContactPrompt
                          booking={{
                            type: "product",
                            itemName: product.name,
                            name: submittedEnquiryData.full_name,
                            email: submittedEnquiryData.email,
                            phone: submittedEnquiryData.phone,
                            quantity: submittedEnquiryData.quantity,
                            notes: submittedEnquiryData.message,
                            city: submittedEnquiryData.city,
                            pincode: submittedEnquiryData.pincode,
                          }}
                        />
                        
                        <Button onClick={() => handleEnquiryDialogClose(false)} className="mt-4">Close</Button>
                      </div>
                    ) : (
                      <>
                        <DialogHeader>
                          <DialogTitle>Order: {product.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="full_name">Full Name *</Label>
                              <Input
                                id="full_name"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                min={1}
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pincode">Pincode</Label>
                              <Input
                                id="pincode"
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="preferred_delivery">Preferred Delivery</Label>
                            <Input
                              id="preferred_delivery"
                              placeholder="e.g., Courier, Speed Post, Pick-up"
                              value={formData.preferred_delivery}
                              onChange={(e) => setFormData({ ...formData, preferred_delivery: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Additional Message</Label>
                            <Textarea
                              id="message"
                              rows={3}
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                          </div>

                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Order Request"}
                          </Button>
                        </form>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {/* Trust signals */}
              <div className="text-sm text-muted-foreground border-t pt-4 mt-4 space-y-1">
                <p>✓ Authentic product from Uttarakhand</p>
                <p>✓ Direct from local artisans</p>
                <p>✓ Secure payment & easy returns</p>
              </div>
            </div>
          </div>

          {/* Full Description */}
          {product.full_description && (
            <Card className="mt-10">
              <CardHeader>
                <CardTitle>About This Product</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {product.full_description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Related Products</h2>
                <Button variant="ghost" asChild>
                  <Link to="/products">
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/products/${item.slug}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-square bg-muted overflow-hidden">
                        {item.thumbnail_image_url ? (
                          <img
                            src={item.thumbnail_image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {item.name}
                        </h4>
                        <p className="text-lg font-bold text-primary">
                          {item.price_currency || "₹"}{item.price?.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Store Link */}
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link to="/products">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Pahadi Store
              </Link>
            </Button>
          </div>

          {/* Booking Modal */}
          <BookingModal
            open={isBookingOpen}
            onOpenChange={setIsBookingOpen}
            type="product"
            item={{
              id: product.id,
              title: product.name,
              price: product.price,
            }}
            source="shop"
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
