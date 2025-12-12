import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Star, ChevronRight, CheckCircle, Clock, 
  IndianRupee, Check, X, ChevronLeft
} from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import StaticMapPreview from "@/components/maps/StaticMapPreview";
import DOMPurify from "dompurify";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourism_listings")
        .select(`
          *,
          provider:tourism_providers(id, name, type, phone, email, whatsapp, is_verified, rating, image_url),
          district:districts(id, name, slug),
          village:villages(id, name, slug)
        `)
        .eq("id", id || "")
        .eq("is_active", true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
        <p className="text-muted-foreground mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  const galleryImages = (listing as any)?.gallery_images as string[] | undefined;
  const images = galleryImages?.length 
    ? [listing.image_url, ...galleryImages].filter(Boolean) 
    : listing.image_url ? [listing.image_url] : [];

  const duration = (listing as any)?.duration as string | undefined;
  const inclusions = (listing as any)?.inclusions as string[] | undefined;
  const exclusions = (listing as any)?.exclusions as string[] | undefined;

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      stay: "Stays & Homestays",
      trek: "Treks & Tours",
      day_trip: "Day Trips",
      local_experience: "Local Experiences",
      taxi_service: "Taxi Services",
    };
    return labels[cat] || cat;
  };

  return (
    <>
      <Helmet>
        <title>{listing.title} | {getCategoryLabel(listing.category)} in Uttarakhand</title>
        <meta 
          name="description" 
          content={listing.short_description?.slice(0, 160) || `${listing.title} - Book now in ${listing.district?.name || "Uttarakhand"}`} 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link to="/marketplace" className="text-muted-foreground hover:text-foreground">Marketplace</Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium line-clamp-1">{listing.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={images[selectedImage]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors ${
                            idx === selectedImage ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary">{getCategoryLabel(listing.category)}</Badge>
                  {listing.is_featured && <Badge>Featured</Badge>}
                  {listing.provider?.is_verified && (
                    <Badge className="bg-green-500/90">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Provider
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {listing.district && (
                    <Link 
                      to={`/districts/${listing.district.slug}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <MapPin className="h-4 w-4" />
                      {listing.village?.name && `${listing.village.name}, `}
                      {listing.district.name}
                    </Link>
                  )}
                  {listing.provider?.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {listing.provider.rating.toFixed(1)}
                    </span>
                  )}
                  {duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {listing.short_description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{listing.short_description}</p>
                  </CardContent>
                </Card>
              )}

              {listing.full_description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(listing.full_description) }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Inclusions / Exclusions */}
              {(inclusions && inclusions.length > 0 || exclusions && exclusions.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {inclusions && inclusions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Included
                          </h4>
                          <ul className="space-y-2">
                            {inclusions.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {exclusions && exclusions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Not Included
                          </h4>
                          <ul className="space-y-2">
                            {exclusions.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              {(listing.lat || listing.district?.slug) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StaticMapPreview 
                      lat={listing.lat} 
                      lng={listing.lng}
                      name={listing.title}
                      districtName={listing.district?.name}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Book Now</span>
                    {listing.base_price && (
                      <span className="text-2xl text-primary">
                        <IndianRupee className="h-5 w-5 inline" />
                        {listing.base_price.toLocaleString()}
                        {listing.price_unit && (
                          <span className="text-sm text-muted-foreground font-normal">
                            /{listing.price_unit}
                          </span>
                        )}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => setBookingOpen(true)}
                  >
                    Book Now
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    No payment required now. We'll contact you to confirm.
                  </p>
                </CardContent>
              </Card>

              {/* Provider Card */}
              {listing.provider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Offered By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link 
                      to={`/providers/${listing.provider.id}`}
                      className="flex items-center gap-3 p-3 -m-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      {listing.provider.image_url ? (
                        <img 
                          src={listing.provider.image_url} 
                          alt={listing.provider.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {listing.provider.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{listing.provider.name}</span>
                          {listing.provider.is_verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {listing.provider.type}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Location Info */}
              {listing.district && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {listing.village && (
                      <Link 
                        to={`/villages/${listing.village.slug}`}
                        className="block text-primary hover:underline"
                      >
                        {listing.village.name}
                      </Link>
                    )}
                    <Link 
                      to={`/districts/${listing.district.slug}`}
                      className="block text-muted-foreground hover:text-foreground"
                    >
                      {listing.district.name} District
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        type="listing"
        item={{
          id: listing.id,
          title: listing.title,
          price: listing.base_price || undefined,
          category: listing.category,
          district: listing.district?.name,
        }}
        source="listing-detail"
      />
    </>
  );
}
