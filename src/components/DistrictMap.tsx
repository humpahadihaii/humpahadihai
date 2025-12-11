import { useMemo } from "react";
import LeafletMap, { MapMarker } from "@/components/maps/LeafletMap";
import { useMapSettings } from "@/hooks/useMapSettings";

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
    name?: string;
    title?: string;
    description?: string;
    short_description?: string;
    map_lat?: number | null;
    map_lng?: number | null;
    google_map_link?: string | null;
  }>;
  hotels?: Array<{
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    description?: string;
  }>;
}

const DistrictMap = ({ 
  districtName, 
  centerLat, 
  centerLng, 
  villages = [], 
  places = [],
  hotels = []
}: DistrictMapProps) => {
  const { settings } = useMapSettings();

  // Default center for Uttarakhand
  const defaultLat = centerLat || 30.0668;
  const defaultLng = centerLng || 79.0193;

  const markers = useMemo<MapMarker[]>(() => {
    const allMarkers: MapMarker[] = [];

    // Add village markers
    villages.forEach((village) => {
      if (village.latitude && village.longitude) {
        allMarkers.push({
          id: village.id,
          lat: village.latitude,
          lng: village.longitude,
          title: village.name,
          description: village.introduction?.substring(0, 100),
          type: "village",
          link: `/villages/${village.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        });
      }
    });

    // Add places markers
    places.forEach((place) => {
      if (place.map_lat && place.map_lng) {
        allMarkers.push({
          id: place.id,
          lat: place.map_lat,
          lng: place.map_lng,
          title: place.name || place.title || "Place",
          description: place.description || place.short_description,
          type: "place",
        });
      }
    });

    // Add hotel markers
    hotels.forEach((hotel) => {
      if (hotel.latitude && hotel.longitude) {
        allMarkers.push({
          id: hotel.id,
          lat: hotel.latitude,
          lng: hotel.longitude,
          title: hotel.name,
          description: hotel.description?.substring(0, 100),
          type: "hotel",
        });
      }
    });

    return allMarkers;
  }, [villages, places, hotels]);

  // Check if maps are enabled for districts
  if (settings && !settings.show_on_districts) {
    return null;
  }

  return (
    <LeafletMap
      markers={markers}
      center={{ lat: defaultLat, lng: defaultLng }}
      zoom={9}
      title={`Map of ${districtName}`}
      height="400px"
    />
  );
};

export default DistrictMap;
