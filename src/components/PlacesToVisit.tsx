import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Camera } from "lucide-react";

interface Place {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  google_map_link?: string | null;
  category: string;
}

interface PlacesToVisitProps {
  districtName: string;
  places: Place[];
}

const PlacesToVisit = ({ districtName, places }: PlacesToVisitProps) => {
  if (!places || places.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Places to Visit in {districtName}</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Must-see temples, viewpoints, and attractions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <Card 
              key={place.id} 
              className="overflow-hidden hover:shadow-xl transition-all group"
            >
              {place.image_url ? (
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={place.image_url}
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute bottom-3 left-3 bg-primary/90">
                    {place.category}
                  </Badge>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                  <Camera className="h-16 w-16 text-primary/30" />
                  <Badge className="absolute bottom-3 left-3 bg-primary/90">
                    {place.category}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-start justify-between gap-2">
                  <span>{place.title}</span>
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {place.description}
                </p>
                
                {place.google_map_link && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    asChild
                  >
                    <a 
                      href={place.google_map_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Google Maps
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlacesToVisit;
