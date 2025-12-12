import { Link } from "react-router-dom";
import { Sparkles, Calendar, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFestivalSpotlight, SpotlightFestival } from "@/hooks/useFestivalSpotlight";

interface FestivalSpotlightProps {
  districtId?: string;
  showTitle?: boolean;
  limit?: number;
  className?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=600&h=400&fit=crop&q=80";

function FestivalCard({ festival }: { festival: SpotlightFestival }) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={festival.image_url || FALLBACK_IMAGE}
          alt={festival.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {festival.is_spotlight && (
          <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Spotlight
          </Badge>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-white text-lg line-clamp-1">
            {festival.name}
          </h3>
          {festival.district && (
            <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {festival.district.name}
            </p>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        {festival.month && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span>{festival.month}</span>
          </div>
        )}
        {festival.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {festival.description}
          </p>
        )}
        {festival.district && (
          <Button variant="link" className="p-0 h-auto mt-2" asChild>
            <Link to={`/districts/${festival.district.slug}`}>
              Learn More <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function FestivalSpotlight({
  districtId,
  showTitle = true,
  limit = 3,
  className = "",
}: FestivalSpotlightProps) {
  const { data: festivals, isLoading } = useFestivalSpotlight({ districtId, limit });

  if (isLoading) {
    return (
      <section className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Festival Spotlight</h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!festivals || festivals.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Festival Spotlight</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/culture">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}
      <div className={`grid grid-cols-1 ${festivals.length === 1 ? '' : 'md:grid-cols-2'} ${festivals.length >= 3 ? 'lg:grid-cols-3' : ''} gap-6`}>
        {festivals.map((festival) => (
          <FestivalCard key={festival.id} festival={festival} />
        ))}
      </div>
    </section>
  );
}
