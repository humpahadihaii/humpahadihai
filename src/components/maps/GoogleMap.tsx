import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapSettings } from "@/hooks/useMapSettings";

// Google Maps types
type GoogleMap = google.maps.Map;
type GoogleMapOptions = google.maps.MapOptions;
type GoogleMarker = google.maps.marker.AdvancedMarkerElement;
type GoogleInfoWindow = google.maps.InfoWindow;
type GoogleLatLngBounds = google.maps.LatLngBounds;
type GooglePinElement = google.maps.marker.PinElement;

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: "village" | "place" | "hotel" | "listing" | "district";
  link?: string;
}

interface GoogleMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showTitle?: boolean;
  title?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  enableClustering?: boolean;
  className?: string;
}

let isLoadingScript = false;
let isScriptLoaded = false;
const loadCallbacks: (() => void)[] = [];

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isScriptLoaded && window.google?.maps) {
      resolve();
      return;
    }

    if (isLoadingScript) {
      loadCallbacks.push(() => resolve());
      return;
    }

    isLoadingScript = true;

    window.initGoogleMaps = () => {
      isScriptLoaded = true;
      isLoadingScript = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      isLoadingScript = false;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });
};

const GoogleMap = ({
  markers = [],
  center,
  zoom,
  height = "400px",
  showTitle = true,
  title = "Map",
  onMarkerClick,
  enableClustering = true,
  className = "",
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings, apiKey, isLoading: settingsLoading } = useMapSettings();

  const defaultCenter = {
    lat: settings?.default_lat || 30.0668,
    lng: settings?.default_lng || 79.0193,
  };
  const defaultZoom = settings?.default_zoom || 9;

  const initMap = useCallback(async () => {
    if (!mapRef.current || !apiKey) return;

    try {
      await loadGoogleMapsScript(apiKey);

      if (!mapRef.current) return;

      const mapCenter = center || defaultCenter;
      const mapZoom = zoom || defaultZoom;

      const mapOptions: google.maps.MapOptions = {
        center: mapCenter,
        zoom: mapZoom,
        mapTypeId: (settings?.map_style as google.maps.MapTypeId) || "roadmap",
        mapId: "hum_pahadi_map",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: settings?.enable_street_view || false,
        fullscreenControl: true,
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Clear existing markers
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];

      // Add markers
      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();

        markers.forEach((marker) => {
          const position = { lat: marker.lat, lng: marker.lng };
          bounds.extend(position);

          const pinColor = getMarkerColor(marker.type);
          const pinElement = new google.maps.marker.PinElement({
            background: pinColor,
            borderColor: "#ffffff",
            glyphColor: "#ffffff",
            scale: 1.1,
          });

          const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
            position,
            map: mapInstanceRef.current,
            title: marker.title,
            content: pinElement.element,
          });

          // Info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${marker.title}</h3>
                ${marker.description ? `<p style="font-size: 12px; color: #666; margin-bottom: 8px;">${marker.description.substring(0, 100)}...</p>` : ""}
                ${marker.link ? `<a href="${marker.link}" style="color: #2563eb; font-size: 12px;">View Details →</a>` : ""}
              </div>
            `,
          });

          advancedMarker.addListener("click", () => {
            infoWindow.open(mapInstanceRef.current, advancedMarker);
            if (onMarkerClick) onMarkerClick(marker);
          });

          markersRef.current.push(advancedMarker);
        });

        if (markers.length > 1) {
          mapInstanceRef.current.fitBounds(bounds);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to load map");
      setIsLoading(false);
    }
  }, [apiKey, markers, center, zoom, settings, onMarkerClick]);

  useEffect(() => {
    if (!settingsLoading && settings?.maps_enabled !== false) {
      initMap();
    } else if (!settingsLoading && settings?.maps_enabled === false) {
      setError("Maps are currently disabled");
      setIsLoading(false);
    }

    return () => {
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];
    };
  }, [initMap, settingsLoading, settings?.maps_enabled]);

  const getMarkerColor = (type?: string): string => {
    switch (type) {
      case "village":
        return "#16a34a";
      case "place":
        return "#ea580c";
      case "hotel":
        return "#7c3aed";
      case "listing":
        return "#0891b2";
      case "district":
        return "#dc2626";
      default:
        return "#2563eb";
    }
  };

  if (settingsLoading) {
    return <Skeleton className={`w-full ${className}`} style={{ height }} />;
  }

  if (error) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {showTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {markers.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span>Villages</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-600" />
                <span>Places</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-violet-600" />
                <span>Hotels</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-cyan-600" />
                <span>Listings</span>
              </div>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <div ref={mapRef} style={{ height, width: "100%" }} />
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
