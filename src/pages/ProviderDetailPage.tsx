import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Star, Phone, Mail, Globe, MessageCircle, 
  ChevronRight, CheckCircle, Building2 
} from "lucide-react";
import StaticMapPreview from "@/components/maps/StaticMapPreview";

export default function ProviderDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider-detail", slug],
    queryFn: async () => {
      // First try by slug-like name match
      const { data, error } = await supabase
        .from("tourism_providers")
        .select(`
          *,
          district:districts(id, name, slug),
          village:villages(id, name, slug)
        `)
        .eq("is_active", true)
        .ilike("name", slug?.replace(/-/g, " ") || "")
        .single();
      
      if (error || !data) {
        // Fallback: try by ID
        const { data: byId } = await supabase
          .from("tourism_providers")
          .select(`
            *,
            district:districts(id, name, slug),
            village:villages(id, name, slug)
          `)
          .eq("id", slug || "")
          .eq("is_active", true)
          .single();
        return byId;
      }
      return data;
    },
    enabled: !!slug,
  });

  const { data: listings } = useQuery({
    queryKey: ["provider-listings", provider?.id],
    queryFn: async () => {
      if (!provider?.id) return [];
      const { data } = await supabase
        .from("tourism_listings")
        .select("*")
        .eq("provider_id", provider.id)
        .eq("is_active", true)
        .order("is_featured", { ascending: false });
      return data || [];
    },
    enabled: !!provider?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Provider Not Found</h1>
        <p className="text-muted-foreground mb-6">The provider you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  const getWhatsAppLink = () => {
    const phone = provider.whatsapp || provider.phone;
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}`;
  };

  const getPhoneLink = () => {
    if (!provider.phone) return null;
    return `tel:${provider.phone}`;
  };

  const getEmailLink = () => {
    if (!provider.email) return null;
    return `mailto:${provider.email}`;
  };

  return (
    <>
      <Helmet>
        <title>{provider.name} | Tourism Provider in Uttarakhand</title>
        <meta 
          name="description" 
          content={provider.description?.slice(0, 160) || `${provider.name} - ${provider.type} in ${provider.district?.name || "Uttarakhand"}`} 
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
              <span className="font-medium">{provider.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative">
          {provider.image_url ? (
            <div 
              className="h-64 md:h-80 bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${provider.image_url})` }}
            />
          ) : (
            <div className="h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-primary/30" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="container mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="capitalize">{provider.type}</Badge>
                {provider.is_verified && (
                  <Badge className="bg-green-500/90">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{provider.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                {provider.district && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {provider.village?.name && `${provider.village.name}, `}
                    {provider.district.name}
                  </span>
                )}
                {provider.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {provider.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {provider.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">{provider.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Listings */}
              {listings && listings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Services & Offerings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {listings.map((listing: any) => (
                        <Link 
                          key={listing.id} 
                          to={`/listings/${listing.id}`}
                          className="block p-4 border rounded-lg hover:border-primary transition-colors"
                        >
                          {listing.image_url && (
                            <img 
                              src={listing.image_url} 
                              alt={listing.title}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                          )}
                          <h3 className="font-medium mb-1">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {listing.short_description}
                          </p>
                          {listing.base_price && (
                            <p className="text-primary font-medium">
                              ₹{listing.base_price.toLocaleString()}
                              {listing.price_unit && <span className="text-sm text-muted-foreground"> /{listing.price_unit}</span>}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              {(provider.lat || provider.district?.slug) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StaticMapPreview 
                      lat={provider.lat} 
                      lng={provider.lng}
                      name={provider.name}
                      districtName={provider.district?.name}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getWhatsAppLink() && (
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <a href={getWhatsAppLink()!} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {getPhoneLink() && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={getPhoneLink()!}>
                        <Phone className="mr-2 h-4 w-4" />
                        {provider.phone}
                      </a>
                    </Button>
                  )}
                  {getEmailLink() && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={getEmailLink()!}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                  {provider.website_url && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={provider.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Location Info */}
              {provider.district && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {provider.village && (
                      <Link 
                        to={`/villages/${provider.village.slug}`}
                        className="block text-primary hover:underline"
                      >
                        {provider.village.name}
                      </Link>
                    )}
                    <Link 
                      to={`/districts/${provider.district.slug}`}
                      className="block text-muted-foreground hover:text-foreground"
                    >
                      {provider.district.name} District
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
