import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSettings } from "@/hooks/usePageSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Clock, Mountain, Star, Search, Check, ArrowRight, Home } from "lucide-react";
import { Helmet } from "react-helmet";

interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  destination: string | null;
  region: string | null;
  duration_days: number | null;
  difficulty_level: string | null;
  best_season: string | null;
  price_per_person: number;
  price_currency: string;
  thumbnail_image_url: string | null;
  is_featured: boolean;
}

interface TourismListing {
  id: string;
  title: string;
  short_description: string | null;
  category: string;
  base_price: number | null;
  price_unit: string | null;
  image_url: string | null;
  is_featured: boolean;
  provider: {
    id: string;
    name: string;
    is_verified: boolean;
    rating: number | null;
  } | null;
  district: {
    id: string;
    name: string;
  } | null;
}

const TravelPackagesPage = () => {
  const { data: pageSettings } = usePageSettings("travel-packages");
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("packages");

  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ["travel-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_packages")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TravelPackage[];
    },
  });

  const { data: staysListings = [], isLoading: staysLoading } = useQuery({
    queryKey: ["stays-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourism_listings")
        .select(`
          *,
          provider:tourism_providers(id, name, is_verified, rating),
          district:districts(id, name)
        `)
        .eq("is_active", true)
        .in("category", ["stay", "local_experience"])
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TourismListing[];
    },
  });

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "all" || pkg.region === regionFilter;
    const matchesDifficulty = difficultyFilter === "all" || pkg.difficulty_level === difficultyFilter;
    return matchesSearch && matchesRegion && matchesDifficulty;
  });

  const filteredStays = staysListings.filter((listing) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.title.toLowerCase().includes(query) ||
      listing.provider?.name.toLowerCase().includes(query) ||
      listing.district?.name.toLowerCase().includes(query)
    );
  });

  const regions = [...new Set(packages.map((p) => p.region).filter(Boolean))];
  const featuredPackages = packages.filter(p => p.is_featured).slice(0, 3);

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case "easy": return "bg-green-100 text-green-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "challenging": return "bg-orange-100 text-orange-800";
      case "difficult": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageSettings?.meta_title || "Travel Packages | Explore Uttarakhand | Hum Pahadi Haii"}</title>
        <meta 
          name="description" 
          content={pageSettings?.meta_description || "Discover curated travel packages to explore Uttarakhand - from Char Dham yatra to adventure treks in Garhwal and Kumaon."} 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24"
          style={pageSettings?.hero_image_url ? {
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${pageSettings.hero_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {
            background: 'linear-gradient(135deg, hsl(var(--primary)/0.1) 0%, hsl(var(--secondary)/0.1) 100%)',
          }}
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-3xl ${pageSettings?.hero_image_url ? 'text-white' : ''}`}>
              <Mountain className={`h-16 w-16 mb-4 ${pageSettings?.hero_image_url ? 'text-white' : 'text-primary'}`} />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {pageSettings?.hero_title || "Curated Travel Packages"}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-6">
                {pageSettings?.hero_subtitle || "Experience the magic of Uttarakhand with our carefully crafted travel packages. From spiritual Char Dham yatras to thrilling adventure treks."}
              </p>
              
              {pageSettings?.hero_bullets && pageSettings.hero_bullets.length > 0 && (
                <ul className="space-y-2 mb-8">
                  {pageSettings.hero_bullets.map((bullet, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className={`h-5 w-5 flex-shrink-0 ${pageSettings?.hero_image_url ? 'text-white' : 'text-primary'}`} />
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {pageSettings?.hero_cta_label && pageSettings?.hero_cta_link && (
                <Button asChild size="lg" variant={pageSettings?.hero_image_url ? "secondary" : "default"}>
                  <Link to={pageSettings.hero_cta_link}>
                    {pageSettings.hero_cta_label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Featured Packages */}
        {featuredPackages.length > 0 && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Popular Packages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredPackages.map((pkg) => (
                  <Link 
                    key={pkg.id} 
                    to={`/travel-packages/${pkg.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all group-hover:ring-2 ring-primary">
                      <div className="relative h-32 overflow-hidden">
                        {pkg.thumbnail_image_url ? (
                          <img
                            src={pkg.thumbnail_image_url}
                            alt={pkg.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Mountain className="h-8 w-8 text-primary/50" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-secondary">
                          <Star className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-1">{pkg.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {pkg.duration_days && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {pkg.duration_days}D
                            </span>
                          )}
                          <span className="font-semibold text-primary">
                            ₹{pkg.price_per_person.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="packages" className="flex items-center gap-2">
                  <Mountain className="h-4 w-4" />
                  Travel Packages
                </TabsTrigger>
                <TabsTrigger value="stays" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Local Stays & Experiences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="packages">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search packages..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region!}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                      <SelectItem value="difficult">Difficult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Packages Grid */}
                {packagesLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted" />
                        <CardContent className="space-y-3 pt-4">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredPackages.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">No travel packages found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map((pkg) => (
                      <Card key={pkg.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48 overflow-hidden">
                          {pkg.thumbnail_image_url ? (
                            <img
                              src={pkg.thumbnail_image_url}
                              alt={pkg.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                              <Mountain className="h-16 w-16 text-primary/50" />
                            </div>
                          )}
                          {pkg.is_featured && (
                            <Badge className="absolute top-3 right-3 bg-secondary">
                              <Star className="h-3 w-3 mr-1" /> Featured
                            </Badge>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            {pkg.destination && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {pkg.destination}
                              </span>
                            )}
                            {pkg.duration_days && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {pkg.duration_days} days
                              </span>
                            )}
                          </div>
                          <CardTitle className="line-clamp-2">{pkg.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{pkg.short_description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-2">
                              {pkg.difficulty_level && (
                                <Badge variant="outline" className={getDifficultyColor(pkg.difficulty_level)}>
                                  {pkg.difficulty_level}
                                </Badge>
                              )}
                              {pkg.region && (
                                <Badge variant="outline">{pkg.region}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-primary">₹{pkg.price_per_person.toLocaleString()}</span>
                              <span className="text-sm text-muted-foreground">/person</span>
                            </div>
                            <Button asChild>
                              <Link to={`/travel-packages/${pkg.slug}`}>View Details</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stays">
                {/* Search for Stays */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stays & experiences..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Stays Grid */}
                {staysLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted" />
                        <CardContent className="space-y-3 pt-4">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredStays.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">No stays found. Check out our <Link to="/marketplace" className="text-primary underline">full marketplace</Link>.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStays.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                              <Home className="h-12 w-12" />
                            </div>
                          )}
                          {listing.is_featured && (
                            <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-2">{listing.title}</h3>
                          {listing.provider && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <span>{listing.provider.name}</span>
                              {listing.provider.is_verified && (
                                <Badge variant="secondary" className="text-xs">Verified</Badge>
                              )}
                              {listing.provider.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {listing.provider.rating}
                                </span>
                              )}
                            </div>
                          )}
                          {listing.district && (
                            <p className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3" />
                              {listing.district.name}
                            </p>
                          )}
                          {listing.base_price && (
                            <p className="font-semibold text-primary">
                              ₹{listing.base_price.toLocaleString()}
                              {listing.price_unit && (
                                <span className="text-sm font-normal text-muted-foreground">
                                  {" "}/ {listing.price_unit}
                                </span>
                              )}
                            </p>
                          )}
                          <Button asChild className="w-full mt-4">
                            <Link to="/marketplace">View in Marketplace</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="text-center mt-8">
                  <Button asChild variant="outline" size="lg">
                    <Link to="/marketplace">
                      Explore Full Marketplace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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
    </>
  );
};

export default TravelPackagesPage;
