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
import { ShoppingBag, ArrowLeft, Tag, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { usePageSEO } from "@/hooks/useSEO";
import { BookingModal } from "@/components/BookingModal";
import { BookingContactPrompt } from "@/components/BookingContactPrompt";

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
      return data;
    },
    enabled: !!slug,
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
      case "in_stock": return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case "out_of_stock": return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      case "made_to_order": return <Badge className="bg-blue-100 text-blue-800">Made to Order</Badge>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl animate-pulse">
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

  return (
    <>
      <SEOHead meta={seoMeta} sharePreview={sharePreview} />

      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Store
            </Link>
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {product.thumbnail_image_url ? (
                <img
                  src={product.thumbnail_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getStockBadge(product.stock_status)}
                </div>
                <h1 className="text-3xl font-bold text-primary mb-2">{product.name}</h1>
                <p className="text-lg text-muted-foreground">{product.short_description}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.unit_label && (
                  <span className="text-lg text-muted-foreground">/{product.unit_label}</span>
                )}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
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
            </div>
          </div>

          {/* Full Description */}
          {product.full_description && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{product.full_description}</p>
              </CardContent>
            </Card>
          )}

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
