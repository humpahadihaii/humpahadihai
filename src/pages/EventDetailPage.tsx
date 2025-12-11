import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, Ticket, Users, Phone, Mail, Globe, Share2, Heart, ChevronRight, MessageCircle } from "lucide-react";
import { useEvent, useEventPromotions, useSubmitEventInquiry } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import { usePageSEO } from "@/hooks/useSEO";
import { toast } from "sonner";

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: "bg-orange-500",
  fair: "bg-purple-500",
  cultural: "bg-pink-500",
  religious: "bg-yellow-500",
  music: "bg-blue-500",
  food: "bg-green-500",
  sports: "bg-red-500",
  workshop: "bg-indigo-500",
  exhibition: "bg-cyan-500",
  other: "bg-gray-500",
};

export default function EventDetailPage() {
  const { slug } = useParams();
  const { data: event, isLoading } = useEvent(slug || "");
  const { data: promotions } = useEventPromotions(event?.id || "");
  const submitInquiry = useSubmitEventInquiry();

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    seats_requested: 1,
  });

  const seoMeta = usePageSEO("event", event ? {
    name: event.title,
    slug: event.slug,
    description: event.short_description || event.description?.slice(0, 160),
    image: event.cover_image_url,
    eventDate: event.start_at,
    location: event.venue?.name || event.village?.name || event.district?.name,
  } : {});

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    await submitInquiry.mutateAsync({
      event_id: event.id,
      ...inquiryForm,
    });

    setInquiryOpen(false);
    setInquiryForm({ name: "", email: "", phone: "", message: "", seats_requested: 1 });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.short_description,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[50vh] w-full" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This event may have ended or been removed.
          </p>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isSoldOut = event.capacity && event.seats_booked >= event.capacity;
  const spotsLeft = event.capacity ? event.capacity - event.seats_booked : null;
  const location = event.venue?.name || event.village?.name || event.district?.name || "Uttarakhand";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.short_description || event.description,
    startDate: event.start_at,
    endDate: event.end_at || event.start_at,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.village?.name || event.district?.name,
        addressRegion: "Uttarakhand",
        addressCountry: "IN",
      },
    },
    image: event.cover_image_url,
    organizer: event.organizer ? {
      "@type": "Organization",
      name: event.organizer.name,
    } : undefined,
    offers: event.is_free ? {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    } : event.ticket_price ? {
      "@type": "Offer",
      price: event.ticket_price,
      priceCurrency: "INR",
      availability: isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: event.ticket_url,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead meta={seoMeta} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={event.cover_image_url || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Breadcrumb */}
        <div className="absolute top-4 left-4">
          <nav className="flex items-center gap-2 text-sm text-white/80">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/events" className="hover:text-white">Events</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{event.title}</span>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={`text-white ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other}`}>
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </Badge>
              {event.is_featured && <Badge className="bg-primary">Featured</Badge>}
              {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(new Date(event.start_at), "EEEE, MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {format(new Date(event.start_at), "h:mm a")}
                {event.end_at && ` - ${format(new Date(event.end_at), "h:mm a")}`}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                {event.short_description && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {event.short_description}
                  </p>
                )}
                {event.description && (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Venue Details */}
            {event.venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-lg">{event.venue.name}</h4>
                  {event.venue.address && (
                    <p className="text-muted-foreground">{event.venue.address}</p>
                  )}
                  {event.venue.website && (
                    <a 
                      href={event.venue.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 mt-2"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {event.gallery_images && event.gallery_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.gallery_images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${event.title} - Image ${index + 1}`}
                        className="rounded-lg object-cover aspect-square"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {event.is_free ? (
                    <div>
                      <p className="text-3xl font-bold text-green-600">Free Entry</p>
                      <p className="text-muted-foreground">No ticket required</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold">₹{event.ticket_price}</p>
                      <p className="text-muted-foreground">per person</p>
                    </div>
                  )}
                </div>

                {spotsLeft !== null && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-sm">
                    <Users className="h-4 w-4" />
                    {isSoldOut ? (
                      <span className="text-destructive font-medium">Sold Out</span>
                    ) : spotsLeft <= 20 ? (
                      <span className="text-orange-600 font-medium">Only {spotsLeft} spots left!</span>
                    ) : (
                      <span className="text-muted-foreground">{spotsLeft} spots available</span>
                    )}
                  </div>
                )}

                {event.ticket_url ? (
                  <Button asChild className="w-full" size="lg" disabled={isSoldOut}>
                    <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                      <Ticket className="h-4 w-4 mr-2" />
                      {isSoldOut ? "Sold Out" : "Get Tickets"}
                    </a>
                  </Button>
                ) : (
                  <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={isSoldOut}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {isSoldOut ? "Sold Out" : "Register / Inquire"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register for {event.title}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleInquirySubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={inquiryForm.name}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inquiryForm.email}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={inquiryForm.phone}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="seats">Number of Seats</Label>
                          <Input
                            id="seats"
                            type="number"
                            min="1"
                            max={spotsLeft || 10}
                            value={inquiryForm.seats_requested}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, seats_requested: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            value={inquiryForm.message}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                            placeholder="Any questions or special requirements?"
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={submitInquiry.isPending}>
                          {submitInquiry.isPending ? "Submitting..." : "Submit Registration"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Contact Info */}
                {(event.contact_email || event.contact_phone || event.contact_whatsapp) && (
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Contact Organizer</p>
                    {event.contact_email && (
                      <a href={`mailto:${event.contact_email}`} className="flex items-center gap-2 text-sm hover:text-primary">
                        <Mail className="h-4 w-4" />
                        {event.contact_email}
                      </a>
                    )}
                    {event.contact_phone && (
                      <a href={`tel:${event.contact_phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                        <Phone className="h-4 w-4" />
                        {event.contact_phone}
                      </a>
                    )}
                    {event.contact_whatsapp && (
                      <a 
                        href={`https://wa.me/${event.contact_whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Links */}
            {(event.village || event.district) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.village && (
                    <Link 
                      to={`/villages/${event.village.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {event.village.name}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                  {event.district && (
                    <Link 
                      to={`/districts/${event.district.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {event.district.name} District
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
