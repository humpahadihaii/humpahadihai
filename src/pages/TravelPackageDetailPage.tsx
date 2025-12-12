import { useState } from "react";
import DOMPurify from "dompurify";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Clock, Mountain, Calendar, CheckCircle, XCircle, ArrowLeft, Star, Home, ExternalLink, CalendarPlus } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { usePageSEO } from "@/hooks/useSEO";
import { BookingModal } from "@/components/BookingModal";
import { BookingContactPrompt } from "@/components/BookingContactPrompt";

interface TourismListing {
  id: string;
  title: string;
  short_description: string | null;
  category: string;
  base_price: number | null;
  price_unit: string | null;
  image_url: string | null;
  provider: {
    name: string;
    is_verified: boolean;
    rating: number | null;
  } | null;
}

const TravelPackageDetailPage = () => {
  const { slug } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEnquirySuccess, setIsEnquirySuccess] = useState(false);
  const [submittedEnquiryData, setSubmittedEnquiryData] = useState<typeof formData | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_start_date: "",
    month_or_season: "",
    number_of_travellers: 1,
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["travel-package", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_packages")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch related marketplace listings based on region
  const { data: relatedListings = [] } = useQuery({
    queryKey: ["related-listings", pkg?.region],
    queryFn: async () => {
      if (!pkg?.region) return [];
      
      // Get districts matching the region
      const { data: districts } = await supabase
        .from("districts")
        .select("id")
        .eq("region", pkg.region);
      
      if (!districts || districts.length === 0) return [];
      
      const districtIds = districts.map(d => d.id);
      
      const { data, error } = await supabase
        .from("tourism_listings")
        .select(`
          id, title, short_description, category, base_price, price_unit, image_url,
          provider:tourism_providers(name, is_verified, rating)
        `)
        .eq("is_active", true)
        .in("category", ["stay", "local_experience"])
        .in("district_id", districtIds)
        .order("is_featured", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as TourismListing[];
    },
    enabled: !!pkg?.region,
  });

  // SEO metadata - MUST be called before any early returns
  const seoMeta = usePageSEO('travel_package', pkg ? {
    name: pkg.title,
    title: pkg.title,
    slug: pkg.slug,
    description: pkg.short_description || pkg.full_description,
    image: pkg.thumbnail_image_url,
    duration: pkg.duration_days ? `${pkg.duration_days} Days` : undefined,
    price: pkg.price_per_person,
    region: pkg.region,
  } : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("travel_booking_requests").insert({
        travel_package_id: pkg.id,
        ...formData,
        number_of_travellers: Number(formData.number_of_travellers),
      });

      if (error) throw error;

      toast.success("Enquiry submitted! We'll contact you soon.");
      setSubmittedEnquiryData({ ...formData });
      setIsEnquirySuccess(true);
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnquiryDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset on close
      setIsEnquirySuccess(false);
      setSubmittedEnquiryData(null);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        preferred_start_date: "",
        month_or_season: "",
        number_of_travellers: 1,
        city: "",
        message: "",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl animate-pulse">
          <div className="h-64 bg-muted rounded-lg mb-8" />
          <div className="h-8 bg-muted rounded w-1/2 mb-4" />
          <div className="h-4 bg-muted rounded w-full mb-2" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
          <Button asChild>
            <Link to="/travel-packages">Browse All Packages</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead meta={seoMeta} />

      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/travel-packages">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Packages
            </Link>
          </Button>

          {/* Hero Image */}
          {pkg.thumbnail_image_url && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
              <img
                src={pkg.thumbnail_image_url}
                alt={pkg.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {pkg.region && <Badge variant="secondary">{pkg.region}</Badge>}
              {pkg.difficulty_level && <Badge variant="outline">{pkg.difficulty_level}</Badge>}
              {pkg.best_season && <Badge variant="outline">{pkg.best_season}</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{pkg.title}</h1>
            <p className="text-lg text-muted-foreground">{pkg.short_description}</p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {pkg.destination && (
              <Card>
                <CardContent className="p-4 text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{pkg.destination}</p>
                </CardContent>
              </Card>
            )}
            {pkg.duration_days && (
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{pkg.duration_days} Days</p>
                </CardContent>
              </Card>
            )}
            {pkg.starting_point && (
              <Card>
                <CardContent className="p-4 text-center">
                  <Mountain className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Starts From</p>
                  <p className="font-medium">{pkg.starting_point}</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Best Season</p>
                <p className="font-medium">{pkg.best_season || "Year Round"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {pkg.full_description && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About This Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pkg.full_description) }}
                />
              </CardContent>
            </Card>
          )}

          {/* Itinerary */}
          {pkg.itinerary && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pkg.itinerary) }}
                />
              </CardContent>
            </Card>
          )}

          {/* Inclusions & Exclusions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {pkg.inclusions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Inclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.inclusions.split("\n").map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {pkg.exclusions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Exclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.exclusions.split("\n").map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Related Marketplace Listings */}
          {relatedListings.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Local Stays & Experiences in {pkg.region}
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/marketplace?region=${pkg.region}`}>
                    View All
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-32 bg-muted">
                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Home className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
                      {listing.provider && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{listing.provider.name}</span>
                          {listing.provider.rating && (
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {listing.provider.rating}
                            </span>
                          )}
                        </div>
                      )}
                      {listing.base_price && (
                        <p className="text-sm font-semibold text-primary mt-1">
                          ₹{listing.base_price.toLocaleString()}
                          {listing.price_unit && (
                            <span className="text-xs font-normal text-muted-foreground"> / {listing.price_unit}</span>
                          )}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={`/marketplace`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Price & CTA */}
          <Card className="sticky bottom-4 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price per person</p>
                  <span className="text-3xl font-bold text-primary">₹{pkg.price_per_person.toLocaleString()}</span>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button size="lg" className="flex-1 md:flex-none" onClick={() => setIsBookingOpen(true)}>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={handleEnquiryDialogClose}>
                    <DialogTrigger asChild>
                      <Button size="lg" variant="outline" className="flex-1 md:flex-none">
                        Enquire
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      {isEnquirySuccess && submittedEnquiryData ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <CheckCircle className="h-16 w-16 text-primary mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Enquiry Submitted!</h3>
                          <p className="text-muted-foreground mb-4">
                            Thank you! We've received your enquiry for {pkg.title}. We will contact you soon.
                          </p>
                          
                          <BookingContactPrompt
                            booking={{
                              type: "enquiry",
                              itemName: pkg.title,
                              name: submittedEnquiryData.full_name,
                              email: submittedEnquiryData.email,
                              phone: submittedEnquiryData.phone,
                              startDate: submittedEnquiryData.preferred_start_date || undefined,
                              adults: submittedEnquiryData.number_of_travellers,
                              notes: submittedEnquiryData.message,
                              city: submittedEnquiryData.city,
                            }}
                          />
                          
                          <Button onClick={() => handleEnquiryDialogClose(false)} className="mt-4">Close</Button>
                        </div>
                      ) : (
                        <>
                          <DialogHeader>
                            <DialogTitle>Enquire: {pkg.title}</DialogTitle>
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
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  value={formData.city}
                                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="preferred_start_date">Preferred Date</Label>
                                <Input
                                  id="preferred_start_date"
                                  type="date"
                                  value={formData.preferred_start_date}
                                  onChange={(e) => setFormData({ ...formData, preferred_start_date: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="number_of_travellers">No. of Travellers</Label>
                                <Input
                                  id="number_of_travellers"
                                  type="number"
                                  min={1}
                                  value={formData.number_of_travellers}
                                  onChange={(e) => setFormData({ ...formData, number_of_travellers: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="month_or_season">Preferred Month/Season</Label>
                              <Input
                                id="month_or_season"
                                placeholder="e.g., March, Summer, Monsoon"
                                value={formData.month_or_season}
                                onChange={(e) => setFormData({ ...formData, month_or_season: e.target.value })}
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
                              {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                            </Button>
                          </form>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Modal */}
          <BookingModal
            open={isBookingOpen}
            onOpenChange={setIsBookingOpen}
            type="package"
            item={{
              id: pkg.id,
              title: pkg.title,
              price: pkg.price_per_person,
              duration_days: pkg.duration_days || undefined,
              district: pkg.destination || pkg.region || undefined,
            }}
            source="travel_package_page"
          />
        </div>
      </div>
    </>
  );
};

export default TravelPackageDetailPage;
