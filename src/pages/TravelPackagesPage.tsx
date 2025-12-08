import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Mountain, Star, Search } from "lucide-react";
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

const TravelPackagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { data: packages = [], isLoading } = useQuery({
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

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "all" || pkg.region === regionFilter;
    const matchesDifficulty = difficultyFilter === "all" || pkg.difficulty_level === difficultyFilter;
    return matchesSearch && matchesRegion && matchesDifficulty;
  });

  const regions = [...new Set(packages.map((p) => p.region).filter(Boolean))];

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
        <title>Travel Packages | Explore Uttarakhand | Hum Pahadi Haii</title>
        <meta name="description" content="Discover curated travel packages to explore Uttarakhand - from Char Dham yatra to adventure treks in Garhwal and Kumaon." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Mountain className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary mb-4">Explore Uttarakhand</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated travel experiences through the majestic Himalayas. From spiritual journeys to adventure treks.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
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
          {isLoading ? (
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
        </div>
      </div>
    </>
  );
};

export default TravelPackagesPage;
