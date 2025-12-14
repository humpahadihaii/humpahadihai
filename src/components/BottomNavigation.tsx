import { useState } from "react";
import { Search, Cloud, MapPinned, Phone, Info, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchModal } from "@/components/search/SearchContext";
import { getWeatherIconUrl } from "@/hooks/useWeather";
import { RouteExplorer } from "@/components/routes/RouteExplorer";

interface DistrictWeather {
  id: string;
  name: string;
  temp: number;
  description: string;
  icon: string;
}

const EMERGENCY_NUMBERS = [
  { name: "Police", number: "100" },
  { name: "Fire", number: "101" },
  { name: "Ambulance", number: "102" },
  { name: "Disaster Helpline", number: "1070" },
  { name: "Women Helpline", number: "1091" },
  { name: "Tourist Helpline", number: "1363" },
];

export function BottomNavigation() {
  const [activeModal, setActiveModal] = useState<"weather" | "routes" | "emergency" | "details" | null>(null);
  const [showRouteExplorer, setShowRouteExplorer] = useState(false);
  const { openSearch } = useSearchModal();

  // Fetch districts for weather
  const { data: districts } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, latitude, longitude")
        .order("name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch weather for all districts
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ["bottom-nav-weather", districts?.map(d => d.id).join(",")],
    queryFn: async () => {
      if (!districts?.length) return [];
      
      const validDistricts = districts.filter(d => d.latitude && d.longitude);
      const results: DistrictWeather[] = [];
      
      // Fetch weather for each district (4 at a time to avoid rate limits)
      const batchSize = 4;
      for (let i = 0; i < validDistricts.length; i += batchSize) {
        const batch = validDistricts.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (district) => {
            try {
              const { data, error } = await supabase.functions.invoke("weather", {
                body: { lat: district.latitude, lng: district.longitude },
              });
              if (error) return null;
              return {
                id: district.id,
                name: district.name,
                temp: data.temp,
                description: data.description,
                icon: data.icon,
              } as DistrictWeather;
            } catch {
              return null;
            }
          })
        );
        results.push(...batchResults.filter(Boolean) as DistrictWeather[]);
      }
      
      return results;
    },
    enabled: !!districts?.length && activeModal === "weather",
    staleTime: 1000 * 60 * 15, // 15 min cache
    gcTime: 1000 * 60 * 30,
  });

  const closeModal = () => setActiveModal(null);

  const handleRoutesClick = () => {
    setShowRouteExplorer(true);
    setActiveModal(null);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-lg md:hidden">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={openSearch}
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Search className="h-5 w-5" />
            <span className="text-xs font-medium">Search</span>
          </button>
          
          <button
            onClick={() => setActiveModal("weather")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeModal === "weather" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Cloud className="h-5 w-5" />
            <span className="text-xs font-medium">Weather</span>
          </button>
          
          <button
            onClick={handleRoutesClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              showRouteExplorer ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <MapPinned className="h-5 w-5" />
            <span className="text-xs font-medium">Routes</span>
          </button>
          
          <button
            onClick={() => setActiveModal("details")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeModal === "details" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Info className="h-5 w-5" />
            <span className="text-xs font-medium">Details</span>
          </button>
          
          <button
            onClick={() => setActiveModal("emergency")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeModal === "emergency" ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive"
            }`}
          >
            <Phone className="h-5 w-5" />
            <span className="text-xs font-medium">Emergency</span>
          </button>
        </div>
      </nav>

      {/* Modal Backdrop */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
          onClick={closeModal}
        />
      )}

      {/* Weather Modal */}
      {activeModal === "weather" && (
        <div className="fixed bottom-16 left-4 right-4 bg-background rounded-2xl shadow-xl z-50 max-h-[60vh] overflow-hidden md:hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-display text-lg font-semibold">Weather Snapshot</h3>
            <button onClick={closeModal} className="p-1 rounded-full hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(60vh-60px)]">
            {weatherLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : weatherData && weatherData.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {weatherData.map((weather) => (
                  <div
                    key={weather.id}
                    className="bg-muted/50 rounded-xl p-3 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{weather.name}</span>
                      <img
                        src={getWeatherIconUrl(weather.icon)}
                        alt={weather.description}
                        className="h-8 w-8"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{weather.temp}°C</span>
                      <span className="text-xs text-muted-foreground capitalize truncate">{weather.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Weather data unavailable</p>
            )}
          </div>
        </div>
      )}

      {/* Route Explorer - Full Screen */}
      <RouteExplorer 
        isOpen={showRouteExplorer} 
        onClose={() => setShowRouteExplorer(false)} 
      />

      {/* Details Modal */}
      {activeModal === "details" && (
        <div className="fixed bottom-16 left-4 right-4 bg-background rounded-2xl shadow-xl z-50 max-h-[60vh] overflow-hidden md:hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-display text-lg font-semibold">About Hum Pahadi Haii</h3>
            <button onClick={closeModal} className="p-1 rounded-full hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(60vh-60px)] space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Discover the beauty, culture, and traditions of Uttarakhand — the Land of Gods. Explore villages, districts, local cuisine, festivals, and plan your journey through the Himalayas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-2xl font-bold text-primary">13</p>
                <p className="text-xs text-muted-foreground">Districts</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-2xl font-bold text-primary">16K+</p>
                <p className="text-xs text-muted-foreground">Villages</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-2xl font-bold text-primary">3</p>
                <p className="text-xs text-muted-foreground">Cultures</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-2xl font-bold text-primary">∞</p>
                <p className="text-xs text-muted-foreground">Stories</p>
              </div>
            </div>
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Kumaoni • Garhwali • Jaunsari
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {activeModal === "emergency" && (
        <div className="fixed bottom-16 left-4 right-4 bg-background rounded-2xl shadow-xl z-50 max-h-[60vh] overflow-hidden md:hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-border bg-destructive/5">
            <h3 className="font-display text-lg font-semibold text-destructive">Emergency Numbers</h3>
            <button onClick={closeModal} className="p-1 rounded-full hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(60vh-60px)]">
            <div className="grid grid-cols-2 gap-3">
              {EMERGENCY_NUMBERS.map((item, i) => (
                <a
                  key={i}
                  href={`tel:${item.number}`}
                  className="bg-destructive/5 hover:bg-destructive/10 rounded-xl p-3 border border-destructive/20 text-center transition-colors"
                >
                  <p className="font-bold text-xl text-destructive">{item.number}</p>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for bottom nav on mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}
