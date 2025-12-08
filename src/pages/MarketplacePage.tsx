import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Star, Phone, Mail, Globe } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface TourismListing {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  category: string;
  base_price: number | null;
  price_unit: string | null;
  image_url: string | null;
  is_featured: boolean;
  provider: {
    id: string;
    name: string;
    type: string;
    phone: string | null;
    email: string | null;
    website_url: string | null;
    is_verified: boolean;
    rating: number | null;
  } | null;
  district: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface District {
  id: string;
  name: string;
  slug: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "stay", label: "Stays & Homestays" },
  { value: "trek", label: "Treks & Tours" },
  { value: "day_trip", label: "Day Trips" },
  { value: "local_experience", label: "Local Experiences" },
  { value: "taxi_service", label: "Taxi Services" },
];

export default function MarketplacePage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [enquiryListing, setEnquiryListing] = useState<TourismListing | null>(null);
  const [enquiryForm, setEnquiryForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_dates: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: districts } = useQuery({
    queryKey: ["districts-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, slug")
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data as District[];
    },
  });

  const { data: listings, isLoading } = useQuery({
    queryKey: ["marketplace-listings", selectedDistrict, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("tourism_listings")
        .select(`
          *,
          provider:tourism_providers(id, name, type, phone, email, website_url, is_verified, rating),
          district:districts(id, name, slug)
        `)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order");

      if (selectedDistrict !== "all") {
        query = query.eq("district_id", selectedDistrict);
      }
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TourismListing[];
    },
  });

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryListing) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("tourism_inquiries").insert({
        listing_id: enquiryListing.id,
        provider_id: enquiryListing.provider?.id,
        full_name: enquiryForm.full_name,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        preferred_dates: enquiryForm.preferred_dates,
        message: enquiryForm.message,
        source: "marketplace",
        status: "new",
      });

      if (error) throw error;

      toast.success("Enquiry submitted successfully! We'll get back to you soon.");
      setEnquiryListing(null);
      setEnquiryForm({ full_name: "", email: "", phone: "", preferred_dates: "", message: "" });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  return (
    <>
      <Helmet>
        <title>Tourism Marketplace | Local Stays & Experiences in Uttarakhand</title>
        <meta
          name="description"
          content="Discover authentic homestays, local guides, taxis, and unique experiences in Uttarakhand. Book directly with local providers."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-primary/10 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tourism Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover authentic local stays, experienced guides, reliable taxis, and unique
              experiences across Uttarakhand. Connect directly with verified local providers.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-xs">
                <Label className="text-sm mb-1.5 block">District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts?.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 max-w-xs">
                <Label className="text-sm mb-1.5 block">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card
                    key={listing.id}
                    className={`overflow-hidden hover:shadow-lg transition-shadow ${
                      listing.is_featured ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="relative h-48 bg-muted">
                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      {listing.is_featured && (
                        <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                        <Badge variant="outline" className="shrink-0">
                          {getCategoryLabel(listing.category)}
                        </Badge>
                      </div>
                      {listing.provider && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{listing.provider.name}</span>
                          {listing.provider.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          {listing.provider.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {listing.provider.rating}
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pb-3">
                      {listing.district && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {listing.district.name}
                        </p>
                      )}
                      {listing.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {listing.short_description}
                        </p>
                      )}
                      {listing.base_price && (
                        <p className="mt-2 font-semibold text-primary">
                          ₹{listing.base_price.toLocaleString()}
                          {listing.price_unit && (
                            <span className="text-sm font-normal text-muted-foreground">
                              {" "}
                              / {listing.price_unit}
                            </span>
                          )}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        className="w-full"
                        onClick={() => setEnquiryListing(listing)}
                      >
                        Enquire Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No listings found. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Enquiry Dialog */}
      <Dialog open={!!enquiryListing} onOpenChange={() => setEnquiryListing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enquire About This Listing</DialogTitle>
            <DialogDescription>
              {enquiryListing?.title}
              {enquiryListing?.provider && ` by ${enquiryListing.provider.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnquirySubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Your Name *</Label>
              <Input
                id="full_name"
                required
                value={enquiryForm.full_name}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={enquiryForm.email}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={enquiryForm.phone}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="preferred_dates">Preferred Dates</Label>
              <Input
                id="preferred_dates"
                placeholder="e.g., 15-20 December 2024"
                value={enquiryForm.preferred_dates}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, preferred_dates: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={3}
                placeholder="Tell us about your requirements..."
                value={enquiryForm.message}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
