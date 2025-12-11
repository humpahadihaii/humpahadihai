import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: "village" | "place" | "hotel" | "listing" | "default";
  link?: string;
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  title?: string;
  className?: string;
  showTitle?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

const markerColors: Record<string, string> = {
  village: "#22c55e", // green
  place: "#3b82f6",   // blue
  hotel: "#f59e0b",   // amber
  listing: "#8b5cf6", // purple
  default: "#ef4444", // red
};

const createCustomIcon = (type: string = "default") => {
  const color = markerColors[type] || markerColors.default;
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const LeafletMap = ({
  markers = [],
  center = { lat: 30.0668, lng: 79.0193 }, // Default: Uttarakhand
  zoom = 8,
  height = "400px",
  title,
  className = "",
  showTitle = true,
  onMarkerClick,
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom,
      scrollWheelZoom: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Enable scroll zoom on focus
    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());

    map.whenReady(() => setIsLoading(false));

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    markers.forEach((marker) => {
      const icon = createCustomIcon(marker.type);
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon }).addTo(map);

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-sm">${marker.title}</h3>
          ${marker.description ? `<p class="text-xs text-muted-foreground mt-1">${marker.description}</p>` : ""}
          ${marker.link ? `<a href="${marker.link}" class="text-xs text-primary hover:underline mt-2 inline-block">View details →</a>` : ""}
        </div>
      `;

      leafletMarker.bindPopup(popupContent);

      if (onMarkerClick) {
        leafletMarker.on("click", () => onMarkerClick(marker));
      }
    });

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [markers, onMarkerClick]);

  // Update center and zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || markers.length > 0) return;
    map.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom, markers.length]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      {showTitle && title && (
        <div className="p-3 border-b bg-muted/50 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{title}</span>
        </div>
      )}
      <div className="relative" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
      {markers.length > 0 && (
        <div className="p-2 border-t bg-muted/30 flex flex-wrap gap-3 text-xs">
          {Object.entries(markerColors).filter(([type]) => 
            markers.some(m => (m.type || "default") === type)
          ).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="capitalize text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LeafletMap;
