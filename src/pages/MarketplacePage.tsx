import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { usePageSettings } from "@/hooks/usePageSettings";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { MapPin, Star, Check, Search, ArrowRight, List, Map as MapIcon, Filter, SlidersHorizontal } from "lucide-react";
import LeafletMap, { MapMarker } from "@/components/maps/LeafletMap";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingModal } from "@/components/BookingModal";

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
  lat: number | null;
  lng: number | null;
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
    latitude: number | null;
    longitude: number | null;
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

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Rating: High to Low" },
];

export default function MarketplacePage() {
  const { data: pageSettings } = usePageSettings("marketplace");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [enquiryListing, setEnquiryListing] = useState<TourismListing | null>(null);
  const [bookingListing, setBookingListing] = useState<TourismListing | null>(null);
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
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: listings, isLoading } = useQuery({
    queryKey: ["marketplace-listings", selectedDistrict, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("tourism_listings")
        .select(`
          *,
          provider:tourism_providers(id, name, type, phone, email, website_url, is_verified, rating),
          district:districts(id, name, slug, latitude, longitude)
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: featuredProviders } = useQuery({
    queryKey: ["featured-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourism_providers")
        .select("*, district:districts(name)")
        .eq("is_active", true)
        .eq("is_verified", true)
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredListings = listings
    ?.filter(listing => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          listing.title.toLowerCase().includes(query) ||
          listing.provider?.name.toLowerCase().includes(query) ||
          listing.district?.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      // Rating filter
      if (minRating > 0 && (listing.provider?.rating || 0) < minRating) return false;
      // Price filter
      if (listing.base_price) {
        if (listing.base_price < priceRange[0] || listing.base_price > priceRange[1]) return false;
      }
      return true;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return (a.base_price || 0) - (b.base_price || 0);
        case "price_high":
          return (b.base_price || 0) - (a.base_price || 0);
        case "rating":
          return (b.provider?.rating || 0) - (a.provider?.rating || 0);
        case "recommended":
        default:
          // Featured first, then by rating
          if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
          return (b.provider?.rating || 0) - (a.provider?.rating || 0);
      }
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
        <title>{pageSettings?.meta_title || "Tourism Marketplace | Local Stays & Experiences in Uttarakhand"}</title>
        <meta
          name="description"
          content={pageSettings?.meta_description || "Discover authentic homestays, local guides, taxis, and unique experiences in Uttarakhand. Book directly with local providers."}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section 
          className="relative bg-primary/10 py-16 md:py-24"
          style={pageSettings?.hero_image_url ? {
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${pageSettings.hero_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-3xl ${pageSettings?.hero_image_url ? 'text-white' : ''}`}>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {pageSettings?.hero_title || "Tourism Marketplace"}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-6">
                {pageSettings?.hero_subtitle || "Discover authentic local stays, experienced guides, reliable taxis, and unique experiences across Uttarakhand."}
              </p>
              
              {pageSettings?.hero_bullets && pageSettings.hero_bullets.length > 0 && (
                <ul className="space-y-2 mb-8">
                  {pageSettings.hero_bullets.map((bullet, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {pageSettings?.hero_cta_label && pageSettings?.hero_cta_link && (
                <Button asChild size="lg" className="mt-4">
                  <Link to={pageSettings.hero_cta_link}>
                    {pageSettings.hero_cta_label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="py-4 border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4">
              {/* Main filter row */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings or providers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-full md:w-44">
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-44">
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? "bg-primary/10" : ""}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-r-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("map")}
                      className="rounded-l-none"
                    >
                      <MapIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Advanced filters row */}
              {showFilters && (
                <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm mb-2 block">Minimum Rating</Label>
                    <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm mb-2 block">Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}</Label>
                    <Slider
                      min={0}
                      max={50000}
                      step={500}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      className="mt-3"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMinRating(0);
                        setPriceRange([0, 50000]);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        {featuredProviders && featuredProviders.length > 0 && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-semibold mb-4">Verified Providers</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {featuredProviders.map((provider: any) => (
                  <div 
                    key={provider.id} 
                    className="flex-shrink-0 w-48 bg-card rounded-lg p-4 border shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                      {provider.rating && (
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {provider.rating}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{provider.name}</h3>
                    {provider.district && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {provider.district.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Listings Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {filteredListings?.length || 0} Listings Found
              </h2>
              <span className="text-sm text-muted-foreground">
                {viewMode === "map" ? "Map View" : "List View"}
              </span>
            </div>

            {viewMode === "map" ? (
              (() => {
                const mapMarkers: MapMarker[] = (filteredListings || [])
                  .filter(listing => (listing.lat && listing.lng) || (listing.district?.latitude && listing.district?.longitude))
                  .map(listing => ({
                    id: listing.id,
                    lat: listing.lat || listing.district?.latitude || 0,
                    lng: listing.lng || listing.district?.longitude || 0,
                    title: listing.title,
                    description: listing.provider?.name || listing.category,
                    type: "listing" as const,
                    link: `/listings/${listing.id}`,
                  }));

                return mapMarkers.length > 0 ? (
                  <LeafletMap
                    markers={mapMarkers}
                    height="500px"
                    title={`${mapMarkers.length} Listings on Map`}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="relative rounded-lg overflow-hidden border bg-muted/20" style={{ height: "500px" }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <MapIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Listings with Location Data</h3>
                      <p className="text-muted-foreground max-w-md">
                        Listings in this view don't have location coordinates yet.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setViewMode("list")}>
                        <List className="h-4 w-4 mr-2" />
                        Switch to List View
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    {/* Fixed aspect ratio skeleton to prevent CLS */}
                    <div className="aspect-video bg-muted skeleton-shimmer" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredListings && filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing, index) => (
                  <Card
                    key={listing.id}
                    className={`overflow-hidden hover:shadow-lg transition-shadow ${
                      listing.is_featured ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {/* Fixed aspect ratio container to prevent CLS */}
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={listing.image_url || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80`}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding={index < 3 ? "sync" : "async"}
                        fetchPriority={index < 3 ? "high" : "auto"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80`;
                        }}
                      />
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
                              {" "}/ {listing.price_unit}
                            </span>
                          )}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => setBookingListing(listing)}
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEnquiryListing(listing)}
                      >
                        Enquire
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

        {/* Custom Request CTA */}
        {pageSettings?.custom_section_title && (
          <section className="py-12 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {pageSettings.custom_section_title}
              </h2>
              {pageSettings.custom_section_description && (
                <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                  {pageSettings.custom_section_description}
                </p>
              )}
              {pageSettings.custom_section_cta_label && pageSettings.custom_section_cta_link && (
                <Button asChild size="lg">
                  <Link to={pageSettings.custom_section_cta_link}>
                    {pageSettings.custom_section_cta_label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {pageSettings?.faqs && pageSettings.faqs.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  {pageSettings.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* Bottom SEO Text */}
        {pageSettings?.bottom_seo_text && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {pageSettings.bottom_seo_text}
              </div>
            </div>
          </section>
        )}
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
              <Label htmlFor="phone">Phone / WhatsApp</Label>
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

      {/* Booking Modal */}
      {bookingListing && (
        <BookingModal
          open={!!bookingListing}
          onOpenChange={(open) => !open && setBookingListing(null)}
          type="listing"
          item={{
            id: bookingListing.id,
            title: bookingListing.title,
            price: bookingListing.base_price || undefined,
            category: bookingListing.category,
            district: bookingListing.district?.name,
          }}
          source="marketplace"
        />
      )}
    </>
  );
}
