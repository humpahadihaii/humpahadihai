import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home, Landmark } from "lucide-react";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "village" | "place" | "district";
  description?: string;
}

interface DistrictMapProps {
  districtName: string;
  centerLat?: number;
  centerLng?: number;
  villages?: Array<{
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    introduction?: string;
  }>;
  places?: Array<{
    id: string;
    title: string;
    description?: string;
    google_map_link?: string | null;
  }>;
}

const DistrictMap = ({ districtName, centerLat, centerLng, villages = [], places = [] }: DistrictMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  // Default center for Uttarakhand
  const defaultLat = centerLat || 30.0668;
  const defaultLng = centerLng || 79.0193;

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 9);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap.current);

    // Create custom icons
    const villageIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    const placeIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="bg-orange-500 text-white p-1.5 rounded-full shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    // Add village markers
    villages.forEach((village) => {
      if (village.latitude && village.longitude) {
        L.marker([village.latitude, village.longitude], { icon: villageIcon })
          .addTo(leafletMap.current!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${village.name}</h3>
              <p class="text-xs text-gray-600 mt-1">${village.introduction?.substring(0, 100) || "Village in " + districtName}...</p>
              <a href="/villages/${village.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}" class="text-primary text-xs font-medium mt-2 inline-block">View Details →</a>
            </div>
          `);
      }
    });

    // Note: For places, we'd need to geocode or store lat/lng
    // For now, places without coordinates won't appear on map

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [defaultLat, defaultLng, villages, places, districtName]);

  const villagesWithCoords = villages.filter((v) => v.latitude && v.longitude);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="h-5 w-5 text-primary" />
          Map of {districtName}
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Villages ({villagesWithCoords.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Places to Visit</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
};

export default DistrictMap;
