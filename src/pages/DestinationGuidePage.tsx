import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useDestinationGuide, useDestinationPlaces, DestinationPlace } from "@/hooks/useDestinationGuides";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeafletMap } from "@/components/maps";
import {
  MapPin,
  Clock,
  Calendar,
  Thermometer,
  Sun,
  Cloud,
  Snowflake,
  ChevronRight,
  Mountain,
  TreePine,
  Building2,
  Compass,
  Users,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Temple: <Mountain className="h-5 w-5" />,
  Nature: <TreePine className="h-5 w-5" />,
  Market: <Building2 className="h-5 w-5" />,
  Experience: <Compass className="h-5 w-5" />,
  Wildlife: <TreePine className="h-5 w-5" />,
  Historical: <Building2 className="h-5 w-5" />,
  Adventure: <Compass className="h-5 w-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Temple: "bg-amber-100 text-amber-800 border-amber-200",
  Nature: "bg-green-100 text-green-800 border-green-200",
  Market: "bg-blue-100 text-blue-800 border-blue-200",
  Experience: "bg-purple-100 text-purple-800 border-purple-200",
  Wildlife: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Historical: "bg-orange-100 text-orange-800 border-orange-200",
  Adventure: "bg-red-100 text-red-800 border-red-200",
};

export default function DestinationGuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: destination, isLoading: destLoading } = useDestinationGuide(slug);
  const { data: places, isLoading: placesLoading } = useDestinationPlaces(destination?.id, true);

  const isLoading = destLoading || placesLoading;

  // Group places by category
  const groupedPlaces = places?.reduce((acc, place) => {
    const cat = place.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(place);
    return acc;
  }, {} as Record<string, DestinationPlace[]>);

  // Category display order
  const categoryOrder = ["Temple", "Nature", "Wildlife", "Historical", "Market", "Experience", "Adventure"];
  const sortedCategories = Object.keys(groupedPlaces || {}).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="h-[50vh] relative">
            <Skeleton className="absolute inset-0" />
          </div>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full max-w-2xl mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!destination) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Destination Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The destination you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/destinations">Browse All Destinations</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const seoTitle = destination.seo_title || `${destination.name} Travel Guide - Hum Pahadi Haii`;
  const seoDescription =
    destination.seo_description ||
    destination.short_introduction ||
    `Complete travel guide for ${destination.name}, Uttarakhand. Discover temples, nature spots, local food, and culture.`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {destination.hero_image && <meta property="og:image" content={destination.hero_image} />}
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://humpahadihaii.in/destinations/${destination.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: destination.name,
            description: destination.short_introduction,
            image: destination.hero_image,
            geo: destination.latitude && destination.longitude ? {
              "@type": "GeoCoordinates",
              latitude: destination.latitude,
              longitude: destination.longitude,
            } : undefined,
          })}
        </script>
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {destination.hero_image ? (
            <img
              src={destination.hero_image}
              alt={destination.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-white/70 text-sm mb-4">
                <Link to="/" className="hover:text-white">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/destinations" className="hover:text-white">Destinations</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">{destination.name}</span>
              </nav>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {destination.name}
              </h1>
              
              {destination.region && (
                <Badge variant="secondary" className="mb-4">
                  {destination.region} Region
                </Badge>
              )}
              
              {destination.short_introduction && (
                <p className="text-lg md:text-xl text-white/90 max-w-3xl">
                  {destination.short_introduction}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Quick Info Bar */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4">
              {destination.best_time_to_visit && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Best Time:</span>
                  <span className="font-medium">{destination.best_time_to_visit}</span>
                </div>
              )}
              {destination.ideal_duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{destination.ideal_duration}</span>
                </div>
              )}
              {destination.temperature_info && (
                <div className="flex items-center gap-4 text-sm">
                  <Thermometer className="h-4 w-4 text-primary" />
                  {destination.temperature_info.summer && (
                    <span className="flex items-center gap-1">
                      <Sun className="h-3 w-3 text-yellow-500" />
                      {destination.temperature_info.summer}
                    </span>
                  )}
                  {destination.temperature_info.monsoon && (
                    <span className="flex items-center gap-1">
                      <Cloud className="h-3 w-3 text-blue-500" />
                      {destination.temperature_info.monsoon}
                    </span>
                  )}
                  {destination.temperature_info.winter && (
                    <span className="flex items-center gap-1">
                      <Snowflake className="h-3 w-3 text-cyan-500" />
                      {destination.temperature_info.winter}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Culture & Customs Section */}
          {(destination.local_people_culture || destination.local_customs_etiquette) && (
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-6">
                {destination.local_people_culture && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold">Local People & Culture</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {destination.local_people_culture}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {destination.local_customs_etiquette && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Mountain className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold">Local Customs & Etiquette</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {destination.local_customs_etiquette}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* Places by Category */}
          {sortedCategories.map((category) => (
            <section key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${CATEGORY_COLORS[category]?.split(" ")[0]} ${CATEGORY_COLORS[category]?.split(" ")[1]}`}>
                  {CATEGORY_ICONS[category]}
                </div>
                <h2 className="text-2xl font-bold">
                  {category === "Temple" && "Spiritual & Historical Landmarks"}
                  {category === "Nature" && "Nature & Parks"}
                  {category === "Wildlife" && "Wildlife & Sanctuaries"}
                  {category === "Historical" && "Historical Sites"}
                  {category === "Market" && "Markets & Shopping"}
                  {category === "Experience" && "City Highlights & Experiences"}
                  {category === "Adventure" && "Adventure Activities"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedPlaces?.[category]?.map((place) => (
                  <PlaceCard key={place.id} place={place} destinationSlug={destination.slug} />
                ))}
              </div>
            </section>
          ))}

          {/* Map Section */}
          {destination.latitude && destination.longitude && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Location</h2>
              <div className="h-[400px] rounded-lg overflow-hidden border">
              <LeafletMap
                  center={{ lat: destination.latitude, lng: destination.longitude }}
                  zoom={12}
                  markers={[{ id: destination.id, lat: destination.latitude, lng: destination.longitude, title: destination.name }]}
                />
              </div>
            </section>
          )}

          {/* Suggested Itinerary - Auto Generated */}
          {places && places.length > 3 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Suggested Itinerary</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Day 1: Spiritual Exploration</h3>
                      <div className="flex flex-wrap gap-2">
                        {places
                          .filter((p) => p.category === "Temple" || p.category === "Historical")
                          .slice(0, 3)
                          .map((p) => (
                            <Badge key={p.id} variant="outline">
                              {p.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Day 2: Nature & Leisure</h3>
                      <div className="flex flex-wrap gap-2">
                        {places
                          .filter((p) => p.category === "Nature" || p.category === "Wildlife")
                          .slice(0, 3)
                          .map((p) => (
                            <Badge key={p.id} variant="outline">
                              {p.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Day 3: Local Experiences</h3>
                      <div className="flex flex-wrap gap-2">
                        {places
                          .filter((p) => p.category === "Market" || p.category === "Experience")
                          .slice(0, 3)
                          .map((p) => (
                            <Badge key={p.id} variant="outline">
                              {p.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Future Monetization Placeholders (hidden by default) */}
          {/* These will be toggleable from admin */}
          <div className="hidden">
            <section className="mb-12" data-placeholder="hotels">
              <h2 className="text-2xl font-bold mb-6">Where to Stay</h2>
              {/* Hotel listings will go here */}
            </section>
            <section className="mb-12" data-placeholder="taxis">
              <h2 className="text-2xl font-bold mb-6">Transportation</h2>
              {/* Taxi services will go here */}
            </section>
            <section className="mb-12" data-placeholder="guides">
              <h2 className="text-2xl font-bold mb-6">Local Guides</h2>
              {/* Guide listings will go here */}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Place Card Component
function PlaceCard({ place, destinationSlug }: { place: DestinationPlace; destinationSlug: string }) {
  return (
    <Link to={`/destinations/${destinationSlug}/${place.slug}`}>
      <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          {place.main_image ? (
            <img
              src={place.main_image}
              alt={place.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              {CATEGORY_ICONS[place.category]}
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className={CATEGORY_COLORS[place.category]}>
              {place.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          {place.short_summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {place.short_summary}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {place.approx_duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {place.approx_duration}
              </span>
            )}
            {place.how_to_reach?.distance_from_destination && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {place.how_to_reach.distance_from_destination}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
