import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Megaphone, Instagram, Globe, Sparkles, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet";

const promotionRequestSchema = z.object({
  business_name: z.string().trim().min(1, "Business name is required").max(100, "Business name must be under 100 characters"),
  contact_person: z.string().trim().min(1, "Contact person is required").max(100, "Contact person must be under 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be under 255 characters"),
  phone: z.string().trim().max(20, "Phone must be under 20 characters").optional().or(z.literal("")),
  instagram_handle: z.string().trim().max(50, "Instagram handle must be under 50 characters").optional().or(z.literal("")),
  business_type: z.string().trim().max(100, "Business type must be under 100 characters").optional().or(z.literal("")),
  city: z.string().trim().max(100, "City must be under 100 characters").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message must be under 1000 characters").optional().or(z.literal("")),
});

interface PromotionPackage {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  deliverables: string | null;
  price: number;
  price_currency: string;
  duration_days: number | null;
  is_active: boolean;
  sort_order: number;
}

const PromotionsPage = () => {
  const [selectedPackage, setSelectedPackage] = useState<PromotionPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    contact_person: "",
    email: "",
    phone: "",
    instagram_handle: "",
    business_type: "",
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["promotion-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as PromotionPackage[];
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "instagram": return <Instagram className="h-6 w-6" />;
      case "website": return <Globe className="h-6 w-6" />;
      case "combo": return <Sparkles className="h-6 w-6" />;
      default: return <Megaphone className="h-6 w-6" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "instagram": return "Instagram";
      case "website": return "Website";
      case "combo": return "Combo Package";
      default: return type;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setIsSubmitting(true);
    try {
      const validatedData = promotionRequestSchema.parse(formData);
      
      const { error } = await supabase.from("promotion_requests").insert({
        promotion_package_id: selectedPackage.id,
        business_name: validatedData.business_name,
        contact_person: validatedData.contact_person,
        email: validatedData.email,
        phone: validatedData.phone || null,
        instagram_handle: validatedData.instagram_handle || null,
        business_type: validatedData.business_type || null,
        city: validatedData.city || null,
        message: validatedData.message || null,
      });

      if (error) throw error;

      toast.success("Request submitted! We'll contact you soon.");
      setIsDialogOpen(false);
      setFormData({
        business_name: "",
        contact_person: "",
        email: "",
        phone: "",
        instagram_handle: "",
        business_type: "",
        city: "",
        message: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0]?.message || "Please check your input");
      } else {
        console.error("Error submitting request:", error);
        toast.error("Failed to submit request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Promotions & Advertising | Hum Pahadi Haii</title>
        <meta name="description" content="Promote your business on Hum Pahadi Haii - reach Uttarakhand's cultural community through Instagram and website promotions." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Megaphone className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary mb-4">Promote Your Business</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reach thousands of Pahadi culture enthusiasts through our platform. Choose a package that suits your needs.
            </p>
          </div>

          {/* Packages Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-32 bg-muted" />
                  <CardContent className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No promotion packages available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-primary">{getTypeIcon(pkg.type)}</div>
                      <Badge variant="secondary">{getTypeBadge(pkg.type)}</Badge>
                    </div>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pkg.deliverables && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">What's Included:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {pkg.deliverables.split("\n").map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold text-primary">₹{pkg.price.toLocaleString()}</span>
                        {pkg.duration_days && (
                          <span className="text-muted-foreground">/ {pkg.duration_days} days</span>
                        )}
                      </div>
                      
                      <Dialog open={isDialogOpen && selectedPackage?.id === pkg.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) setSelectedPackage(pkg);
                      }}>
                        <DialogTrigger asChild>
                          <Button className="w-full">Request This Package</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Request: {pkg.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="business_name">Business Name *</Label>
                                <Input
                                  id="business_name"
                                  required
                                  value={formData.business_name}
                                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="contact_person">Contact Person *</Label>
                                <Input
                                  id="contact_person"
                                  required
                                  value={formData.contact_person}
                                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
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
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                  id="phone"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="instagram_handle">Instagram Handle</Label>
                                <Input
                                  id="instagram_handle"
                                  placeholder="@yourbusiness"
                                  value={formData.instagram_handle}
                                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  value={formData.city}
                                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="business_type">Business Type</Label>
                              <Input
                                id="business_type"
                                placeholder="e.g., Hotel, Restaurant, Handicrafts"
                                value={formData.business_type}
                                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
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
                              {isSubmitting ? "Submitting..." : "Submit Request"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
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

export default PromotionsPage;
