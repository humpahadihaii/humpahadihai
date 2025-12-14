import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  MapPin, 
  Plane, 
  Train, 
  Car, 
  CloudSun, 
  ListChecks, 
  Lightbulb, 
  Phone, 
  AlertTriangle,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePlaceGuideByDistrict } from "@/hooks/usePlaceGuide";
import SEOHead from "@/components/SEOHead";
import LeafletMap from "@/components/maps/LeafletMap";

export default function PlaceGuidePage() {
  const { categorySlug, districtSlug, placeSlug } = useParams();
  const { data: guide, isLoading, error } = usePlaceGuideByDistrict(districtSlug, placeSlug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold">Place Not Found</h1>
          <p className="text-muted-foreground">
            The place guide you're looking for doesn't exist or isn't available yet.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const howToReach = guide.how_to_reach as { by_air?: string; by_rail?: string; by_road?: string } | null;
  const emergencyInfo = guide.emergency_info as { police?: string; hospital?: string; fire?: string; ambulance?: string } | null;

  return (
    <>
      <SEOHead
        title={`${guide.name} Travel Guide | Hum Pahadi Haii`}
        description={guide.short_description || `Complete travel guide to ${guide.name} in ${guide.district?.name || 'Uttarakhand'}`}
        canonicalUrl={`/routes/${categorySlug}/${districtSlug}/${placeSlug}`}
      />

      <div className="min-h-screen bg-background pb-24">
        {/* Breadcrumbs */}
        <nav className="container max-w-4xl py-4">
          <ol className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <li>
              <span className="hover:text-foreground transition-colors cursor-pointer">
                Routes
              </span>
            </li>
            {guide.district && (
              <>
                <ChevronRight className="h-4 w-4 shrink-0" />
                <li>
                  <Link
                    to={`/districts/${guide.district.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {guide.district.name}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight className="h-4 w-4 shrink-0" />
            <li className="text-foreground font-medium truncate">{guide.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="container max-w-4xl">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to={guide.district ? `/districts/${guide.district.slug}` : "/"}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>

          <div className="relative rounded-2xl overflow-hidden">
            {guide.cover_image ? (
              <img
                src={guide.cover_image}
                alt={guide.name}
                className="w-full h-48 sm:h-64 md:h-80 object-cover"
              />
            ) : (
              <div className="w-full h-48 sm:h-64 md:h-80 bg-muted flex items-center justify-center">
                <MapPin className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                {guide.category && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {guide.category}
                  </Badge>
                )}
                {guide.district && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {guide.district.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{guide.name}</h1>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="container max-w-4xl mt-6 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                About {guide.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {guide.about_the_place ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {guide.about_the_place}
                </p>
              ) : guide.short_description ? (
                <p className="text-muted-foreground leading-relaxed">
                  {guide.short_description}
                </p>
              ) : (
                <ComingSoon />
              )}
            </CardContent>
          </Card>

          {/* How to Reach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-primary" />
                How to Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              {howToReach && (howToReach.by_air || howToReach.by_rail || howToReach.by_road) ? (
                <div className="space-y-4">
                  {howToReach.by_air && (
                    <div className="flex gap-3">
                      <Plane className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">By Air</p>
                        <p className="text-muted-foreground text-sm">{howToReach.by_air}</p>
                      </div>
                    </div>
                  )}
                  {howToReach.by_rail && (
                    <div className="flex gap-3">
                      <Train className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">By Rail</p>
                        <p className="text-muted-foreground text-sm">{howToReach.by_rail}</p>
                      </div>
                    </div>
                  )}
                  {howToReach.by_road && (
                    <div className="flex gap-3">
                      <Car className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">By Road</p>
                        <p className="text-muted-foreground text-sm">{howToReach.by_road}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ComingSoon />
              )}
            </CardContent>
          </Card>

          {/* Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CloudSun className="h-5 w-5 text-primary" />
                Weather & Best Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {guide.weather_info ? (
                <p className="text-muted-foreground leading-relaxed">{guide.weather_info}</p>
              ) : (
                <ComingSoon />
              )}
            </CardContent>
          </Card>

          {/* Things to Do */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5 text-primary" />
                Things to Do
              </CardTitle>
            </CardHeader>
            <CardContent>
              {guide.things_to_do && guide.things_to_do.length > 0 ? (
                <ul className="space-y-2">
                  {guide.things_to_do.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <ComingSoon />
              )}
            </CardContent>
          </Card>

          {/* Local Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
                Local Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              {guide.local_tips ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {guide.local_tips}
                </p>
              ) : (
                <ComingSoon />
              )}
            </CardContent>
          </Card>

          {/* Emergency Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emergencyInfo && (emergencyInfo.police || emergencyInfo.hospital || emergencyInfo.ambulance) ? (
                <div className="grid grid-cols-2 gap-4">
                  {emergencyInfo.police && (
                    <div>
                      <p className="font-medium text-sm">Police</p>
                      <a href={`tel:${emergencyInfo.police}`} className="text-primary text-sm">
                        {emergencyInfo.police}
                      </a>
                    </div>
                  )}
                  {emergencyInfo.hospital && (
                    <div>
                      <p className="font-medium text-sm">Hospital</p>
                      <a href={`tel:${emergencyInfo.hospital}`} className="text-primary text-sm">
                        {emergencyInfo.hospital}
                      </a>
                    </div>
                  )}
                  {emergencyInfo.ambulance && (
                    <div>
                      <p className="font-medium text-sm">Ambulance</p>
                      <a href={`tel:${emergencyInfo.ambulance}`} className="text-primary text-sm">
                        {emergencyInfo.ambulance}
                      </a>
                    </div>
                  )}
                  {emergencyInfo.fire && (
                    <div>
                      <p className="font-medium text-sm">Fire</p>
                      <a href={`tel:${emergencyInfo.fire}`} className="text-primary text-sm">
                        {emergencyInfo.fire}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Police</p>
                    <a href="tel:100" className="text-primary">100</a>
                  </div>
                  <div>
                    <p className="font-medium">Ambulance</p>
                    <a href="tel:102" className="text-primary">102</a>
                  </div>
                  <div>
                    <p className="font-medium">Fire</p>
                    <a href="tel:101" className="text-primary">101</a>
                  </div>
                  <div>
                    <p className="font-medium">Disaster Helpline</p>
                    <a href="tel:1070" className="text-primary">1070</a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          {guide.latitude && guide.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </span>
                  {guide.google_maps_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={guide.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open in Maps
                      </a>
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg overflow-hidden">
                  <LeafletMap
                    center={[Number(guide.latitude), Number(guide.longitude)]}
                    zoom={13}
                    markers={[
                      {
                        position: [Number(guide.latitude), Number(guide.longitude)],
                        popup: guide.name,
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function ComingSoon() {
  return (
    <div className="text-center py-4 text-muted-foreground">
      <p className="text-sm">Information coming soon</p>
    </div>
  );
}
