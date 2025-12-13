import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useDestinationPlace, useDestinationPlaces } from "@/hooks/useDestinationGuides";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingShareButton } from "@/components/share/FloatingShareButton";
import { LeafletMap } from "@/components/maps";
import {
  MapPin,
  Clock,
  Ticket,
  Calendar,
  ChevronRight,
  Car,
  Footprints,
  Navigation as NavIcon,
  CheckCircle2,
  History,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Temple: "bg-amber-100 text-amber-800",
  Nature: "bg-green-100 text-green-800",
  Market: "bg-blue-100 text-blue-800",
  Experience: "bg-purple-100 text-purple-800",
  Wildlife: "bg-emerald-100 text-emerald-800",
  Historical: "bg-orange-100 text-orange-800",
  Adventure: "bg-red-100 text-red-800",
};

export default function DestinationPlaceDetailPage() {
  const { slug: destinationSlug, placeSlug } = useParams<{
    slug: string;
    placeSlug: string;
  }>();
  
  const { data, isLoading } = useDestinationPlace(destinationSlug, placeSlug);
  const place = data?.place;
  const destination = data?.destination;

  // Fetch nearby places for internal linking
  const { data: allPlaces } = useDestinationPlaces(destination?.id, true);
  const nearbyPlaces = allPlaces?.filter((p) => p.id !== place?.id).slice(0, 4);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="h-[40vh] relative">
            <Skeleton className="absolute inset-0" />
          </div>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full max-w-2xl mb-8" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!place || !destination) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Place Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The place you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to={`/destinations/${destinationSlug}`}>Back to {destination?.name || "Destination"}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const seoTitle = place.seo_title || `${place.name}, ${destination.name} - Hum Pahadi Haii`;
  const seoDescription =
    place.seo_description ||
    place.short_summary ||
    `Visit ${place.name} in ${destination.name}. ${place.historical_significance || place.spiritual_significance || ""}`;
  const pageUrl = `https://humpahadihaii.in/destinations/${destination.slug}/${place.slug}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {place.main_image && <meta property="og:image" content={place.main_image} />}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {place.main_image && <meta name="twitter:image" content={place.main_image} />}
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: place.name,
            description: place.short_summary,
            image: place.main_image,
            geo: place.latitude && place.longitude ? {
              "@type": "GeoCoordinates",
              latitude: place.latitude,
              longitude: place.longitude,
            } : undefined,
            isAccessibleForFree: place.entry_fee === "Free" || !place.entry_fee,
            openingHours: place.timings,
          })}
        </script>
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          {place.main_image ? (
            <img
              src={place.main_image}
              alt={place.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-white/70 text-sm mb-4 flex-wrap">
                <Link to="/" className="hover:text-white">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/destinations" className="hover:text-white">Destinations</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to={`/destinations/${destination.slug}`} className="hover:text-white">
                  {destination.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">{place.name}</span>
              </nav>
              
              <Badge className={CATEGORY_COLORS[place.category]}>
                {place.category}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
                {place.name}
              </h1>
              
              {place.short_summary && (
                <p className="text-lg text-white/90 max-w-3xl">
                  {place.short_summary}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Quick Info */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-6 py-4">
              {place.approx_duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{place.approx_duration}</span>
                </div>
              )}
              {place.entry_fee && (
                <div className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span>{place.entry_fee}</span>
                </div>
              )}
              {place.timings && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{place.timings}</span>
                </div>
              )}
              {place.best_visiting_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Best: {place.best_visiting_time}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* How to Reach */}
              {place.how_to_reach && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <NavIcon className="h-5 w-5 text-primary" />
                      How to Reach
                    </h2>
                    <div className="space-y-3">
                      {place.how_to_reach.by_road && (
                        <div className="flex items-start gap-3">
                          <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">By Road</p>
                            <p className="text-muted-foreground">{place.how_to_reach.by_road}</p>
                          </div>
                        </div>
                      )}
                      {place.how_to_reach.by_foot && (
                        <div className="flex items-start gap-3">
                          <Footprints className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">On Foot</p>
                            <p className="text-muted-foreground">{place.how_to_reach.by_foot}</p>
                          </div>
                        </div>
                      )}
                      {place.how_to_reach.distance_from_destination && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Distance from {destination.name}</p>
                            <p className="text-muted-foreground">
                              {place.how_to_reach.distance_from_destination}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Things to Do */}
              {place.things_to_do && place.things_to_do.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Things to Do
                    </h2>
                    <ul className="space-y-2">
                      {place.things_to_do.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Local Customs & Rituals */}
              {place.local_customs_rituals && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Local Customs & Rituals
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {place.local_customs_rituals}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Historical / Spiritual Significance */}
              {(place.historical_significance || place.spiritual_significance) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Cultural & Historical Importance
                    </h2>
                    {place.historical_significance && (
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Historical Significance</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {place.historical_significance}
                        </p>
                      </div>
                    )}
                    {place.spiritual_significance && (
                      <div>
                        <h3 className="font-medium mb-2">Spiritual Significance</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {place.spiritual_significance}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              {place.latitude && place.longitude && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Location
                      </h2>
                      {place.google_maps_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={place.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in Maps
                          </a>
                        </Button>
                      )}
                    </div>
                    <div className="h-[300px] rounded-lg overflow-hidden">
                      <LeafletMap
                        center={[place.latitude, place.longitude]}
                        zoom={15}
                        markers={[{ lat: place.latitude, lng: place.longitude, title: place.name }]}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Back to Destination */}
              <Card>
                <CardContent className="p-4">
                  <Link
                    to={`/destinations/${destination.slug}`}
                    className="flex items-center gap-3 hover:text-primary transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    <span>Back to {destination.name} Guide</span>
                  </Link>
                </CardContent>
              </Card>

              {/* Nearby Places */}
              {nearbyPlaces && nearbyPlaces.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">More Places to Visit</h3>
                    <div className="space-y-3">
                      {nearbyPlaces.map((p) => (
                        <Link
                          key={p.id}
                          to={`/destinations/${destination.slug}/${p.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          {p.main_image && (
                            <img
                              src={p.main_image}
                              alt={p.name}
                              className="h-12 w-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                              {p.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {p.category}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Facts */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quick Facts</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{place.category}</dd>
                    </div>
                    {place.approx_duration && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Duration</dt>
                        <dd className="font-medium">{place.approx_duration}</dd>
                      </div>
                    )}
                    {place.entry_fee && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Entry</dt>
                        <dd className="font-medium">{place.entry_fee}</dd>
                      </div>
                    )}
                    {place.timings && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Timings</dt>
                        <dd className="font-medium">{place.timings}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <FloatingShareButton />
      <Footer />
    </>
  );
}
