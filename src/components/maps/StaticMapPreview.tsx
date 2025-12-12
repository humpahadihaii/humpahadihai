import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";

interface StaticMapPreviewProps {
  lat?: number | null;
  lng?: number | null;
  name: string;
  districtName?: string;
  className?: string;
}

export default function StaticMapPreview({
  lat,
  lng,
  name,
  districtName,
  className = "",
}: StaticMapPreviewProps) {
  // Generate OpenStreetMap URL
  const mapUrl = lat && lng 
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(name + (districtName ? `, ${districtName}` : '') + ', Uttarakhand, India')}`;

  // Static map image URL using OpenStreetMap tiles
  const staticMapUrl = lat && lng
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=12&size=400x200&maptype=mapnik&markers=${lat},${lng},ol-marker`
    : null;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0 relative">
        {staticMapUrl ? (
          <img
            src={staticMapUrl}
            alt={`Map of ${name}`}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-primary/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{name}</p>
              {districtName && (
                <p className="text-xs text-muted-foreground">{districtName}, Uttarakhand</p>
              )}
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Button size="sm" variant="secondary" className="gap-1" asChild>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              Open Map
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
