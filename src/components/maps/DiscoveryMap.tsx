import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscoveryMap, MapPOI } from "@/hooks/useDiscoveryMap";
import {
  Search,
  Filter,
  MapPin,
  Navigation,
  List,
  Map as MapIcon,
  X,
  ChevronRight,
  Star,
  Home,
  Compass,
  ShoppingBag,
  Calendar,
  Mountain,
  Hotel,
  Locate,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const TYPE_CONFIG: Record<string, { icon: typeof MapPin; color: string; label: string }> = {
  village: { icon: Home, color: "#22c55e", label: "Villages" },
  provider: { icon: Hotel, color: "#3b82f6", label: "Stays & Providers" },
  listing: { icon: Hotel, color: "#8b5cf6", label: "Listings" },
  package: { icon: Compass, color: "#f59e0b", label: "Travel Packages" },
  place: { icon: Mountain, color: "#ef4444", label: "Places to Visit" },
  event: { icon: Calendar, color: "#ec4899", label: "Events" },
  district: { icon: MapPin, color: "#6366f1", label: "Districts" },
};

const CATEGORY_OPTIONS = [
  { value: "homestay", label: "Homestay" },
  { value: "hotel", label: "Hotel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "guide", label: "Guide" },
  { value: "taxi", label: "Taxi" },
  { value: "experience", label: "Experience" },
  { value: "trek", label: "Trek" },
];

interface DiscoveryMapProps {
  height?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showLegend?: boolean;
  initialDistrict?: string;
  initialTypes?: string[];
  onPOIClick?: (poi: MapPOI) => void;
  className?: string;
}

export const DiscoveryMap: React.FC<DiscoveryMapProps> = ({
  height = "600px",
  showFilters = true,
  showSearch = true,
  showLegend = true,
  initialDistrict,
  initialTypes,
  onPOIClick,
  className = "",
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapPOI[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const {
    pois,
    highlights,
    districts,
    zoom,
    center,
    filters,
    selectedPOI,
    userLocation,
    isLoading,
    setBounds,
    setZoom,
    setCenter,
    setSelectedPOI,
    updateFilters,
    resetFilters,
    searchPOIs,
    navigateToPOI,
    requestUserLocation,
    getDistanceFromUser,
  } = useDiscoveryMap();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Create markers layer group
    markersRef.current = L.layerGroup().addTo(map);

    // Handle map events
    map.on("moveend", () => {
      const bounds = map.getBounds();
      setBounds({
        minLng: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLng: bounds.getEast(),
        maxLat: bounds.getNorth(),
      });
      setZoom(map.getZoom());
      setCenter({
        lat: map.getCenter().lat,
        lng: map.getCenter().lng,
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when POIs change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    pois.forEach((poi) => {
      if ((poi as any).isCluster) {
        // Render cluster marker
        const cluster = poi as any;
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: L.divIcon({
            className: "cluster-marker",
            html: `<div class="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">${cluster.clusterCount}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        });
        
        marker.on("click", () => {
          mapInstanceRef.current?.fitBounds([
            [cluster.bounds.minLat, cluster.bounds.minLng],
            [cluster.bounds.maxLat, cluster.bounds.maxLng],
          ]);
        });
        
        markersRef.current?.addLayer(marker);
      } else {
        // Render POI marker
        const poiItem = poi as MapPOI;
        const config = TYPE_CONFIG[poiItem.type] || TYPE_CONFIG.village;
        const marker = L.marker([poiItem.lat, poiItem.lng], {
          icon: L.divIcon({
            className: "poi-marker",
            html: `<div style="background-color: ${config.color}; color: white;" class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        });

        marker.on("click", () => {
          setSelectedPOI(poiItem);
          if (onPOIClick) {
            onPOIClick(poiItem);
          }
        });

        markersRef.current?.addLayer(marker);
      }
    });

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: "user-marker",
          html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-animation"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      });
      markersRef.current?.addLayer(userMarker);
    }
  }, [pois, userLocation, onPOIClick, setSelectedPOI]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPOIs(searchQuery);
      setSearchResults(results as MapPOI[]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchPOIs]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Navigate to entity page
  const handlePOINavigate = (poi: MapPOI) => {
    const routes: Record<string, string> = {
      village: `/villages/${poi.slug}`,
      provider: `/marketplace?provider=${poi.id}`,
      listing: `/marketplace/${poi.slug}`,
      package: `/travel-packages/${poi.slug}`,
      place: `/districts`,
      event: `/events/${poi.slug}`,
      district: `/districts/${poi.slug}`,
    };
    navigate(routes[poi.type] || "/");
  };

  // Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleLocate = () => {
    requestUserLocation();
    if (userLocation) {
      mapInstanceRef.current?.setView([userLocation.lat, userLocation.lng], 12);
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-[1000] md:left-4 md:right-auto md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search villages, stays, packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background/95 backdrop-blur shadow-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <Card className="mt-2 shadow-lg max-h-64 overflow-auto">
              <CardContent className="p-2">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="w-full p-2 text-left hover:bg-muted rounded-md flex items-center gap-3"
                    onClick={() => {
                      navigateToPOI(result);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: TYPE_CONFIG[result.type]?.color || "#6366f1" }}
                    >
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.district} • {TYPE_CONFIG[result.type]?.label}
                      </p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filter Button (Mobile) */}
      {showFilters && (
        <Sheet open={showFiltersPanel} onOpenChange={setShowFiltersPanel}>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 z-[1000] md:hidden shadow-lg"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterPanel
              filters={filters}
              districts={districts}
              updateFilters={updateFilters}
              resetFilters={resetFilters}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Filter Panel */}
      {showFilters && (
        <Card className="absolute top-20 left-4 z-[1000] w-64 hidden md:block shadow-lg">
          <CardContent className="p-4">
            <FilterPanel
              filters={filters}
              districts={districts}
              updateFilters={updateFilters}
              resetFilters={resetFilters}
              compact
            />
          </CardContent>
        </Card>
      )}

      {/* Map Controls */}
      <div className="absolute top-20 right-4 z-[1000] flex flex-col gap-2">
        <Button variant="secondary" size="icon" onClick={handleZoomIn} className="shadow-lg">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={handleZoomOut} className="shadow-lg">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={handleLocate} className="shadow-lg">
          <Locate className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
          className="shadow-lg"
        >
          {viewMode === "map" ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Map Container */}
      {viewMode === "map" ? (
        <div ref={mapRef} className="w-full h-full rounded-lg" />
      ) : (
        <ListView pois={pois as MapPOI[]} onSelect={handlePOINavigate} userLocation={userLocation} getDistance={getDistanceFromUser} />
      )}

      {/* Legend */}
      {showLegend && viewMode === "map" && (
        <Card className="absolute bottom-4 left-4 z-[1000] shadow-lg">
          <CardContent className="p-3">
            <p className="text-xs font-medium mb-2">Legend</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_CONFIG).slice(0, 6).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs">{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected POI Card */}
      {selectedPOI && viewMode === "map" && (
        <Card className="absolute bottom-4 right-4 z-[1000] w-72 shadow-lg">
          <CardContent className="p-0">
            {selectedPOI.image && (
              <img
                src={selectedPOI.image}
                alt={selectedPOI.title}
                className="w-full h-32 object-cover rounded-t-lg"
              />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge
                    style={{ backgroundColor: TYPE_CONFIG[selectedPOI.type]?.color }}
                    className="text-white mb-1"
                  >
                    {TYPE_CONFIG[selectedPOI.type]?.label}
                  </Badge>
                  <h3 className="font-semibold">{selectedPOI.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPOI(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedPOI.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {selectedPOI.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                {selectedPOI.district && <span>{selectedPOI.district}</span>}
                {selectedPOI.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {selectedPOI.rating}
                  </span>
                )}
                {selectedPOI.price && <span>₹{selectedPOI.price}</span>}
              </div>
              
              <Button
                className="w-full"
                onClick={() => handlePOINavigate(selectedPOI)}
              >
                View Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-[1001]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      <style>{`
        .poi-marker, .cluster-marker, .user-marker {
          background: transparent;
          border: none;
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  );
};

// Filter Panel Component
interface FilterPanelProps {
  filters: any;
  districts: any[] | undefined;
  updateFilters: (filters: any) => void;
  resetFilters: () => void;
  compact?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  districts,
  updateFilters,
  resetFilters,
  compact = false,
}) => {
  return (
    <ScrollArea className={compact ? "max-h-[400px]" : "h-full"}>
      <div className="space-y-4">
        {/* Type Filters */}
        <div>
          <p className="text-sm font-medium mb-2">Show on Map</p>
          <div className="space-y-2">
            {Object.entries(TYPE_CONFIG).slice(0, 6).map(([key, config]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.types.includes(key)}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...filters.types, key]
                      : filters.types.filter((t: string) => t !== key);
                    updateFilters({ types: newTypes });
                  }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm">{config.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <p className="text-sm font-medium mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <Badge
                key={cat.value}
                variant={filters.categories.includes(cat.value) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const newCats = filters.categories.includes(cat.value)
                    ? filters.categories.filter((c: string) => c !== cat.value)
                    : [...filters.categories, cat.value];
                  updateFilters({ categories: newCats });
                }}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* District Filter */}
        {districts && districts.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">District</p>
            <select
              className="w-full p-2 rounded-md border bg-background"
              value={filters.district || ""}
              onChange={(e) => updateFilters({ district: e.target.value || undefined })}
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Featured Only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.featured}
            onCheckedChange={(checked) => updateFilters({ featured: !!checked })}
          />
          <span className="text-sm">Featured only</span>
        </label>

        {/* Price Range */}
        <div>
          <p className="text-sm font-medium mb-2">Price Range (₹)</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => updateFilters({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) => updateFilters({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-20"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <p className="text-sm font-medium mb-2">Minimum Rating</p>
          <Slider
            value={[filters.minRating || 0]}
            max={5}
            step={0.5}
            onValueChange={([value]) => updateFilters({ minRating: value || undefined })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {filters.minRating || 0}+ stars
          </p>
        </div>

        {/* Reset */}
        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </ScrollArea>
  );
};

// List View Component
interface ListViewProps {
  pois: MapPOI[];
  onSelect: (poi: MapPOI) => void;
  userLocation: { lat: number; lng: number } | null;
  getDistance: (lat: number, lng: number) => number | null;
}

const ListView: React.FC<ListViewProps> = ({ pois, onSelect, userLocation, getDistance }) => {
  return (
    <ScrollArea className="h-full bg-background">
      <div className="p-4 space-y-3">
        {pois.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No results found</p>
          </div>
        ) : (
          pois.filter(p => !(p as any).isCluster).map((poi) => {
            const distance = getDistance(poi.lat, poi.lng);
            return (
              <Card
                key={`${poi.type}-${poi.id}`}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelect(poi)}
              >
                <CardContent className="p-3 flex gap-3">
                  {poi.image ? (
                    <img
                      src={poi.image}
                      alt={poi.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: TYPE_CONFIG[poi.type]?.color || "#6366f1" }}
                    >
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant="secondary"
                      className="mb-1 text-xs"
                      style={{ backgroundColor: `${TYPE_CONFIG[poi.type]?.color}20`, color: TYPE_CONFIG[poi.type]?.color }}
                    >
                      {TYPE_CONFIG[poi.type]?.label}
                    </Badge>
                    <h3 className="font-medium truncate">{poi.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{poi.district}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {poi.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {poi.rating}
                        </span>
                      )}
                      {poi.price && <span>₹{poi.price}</span>}
                      {distance && (
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
};

export default DiscoveryMap;
