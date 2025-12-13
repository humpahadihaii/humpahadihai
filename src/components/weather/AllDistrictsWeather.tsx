import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Droplets, Wind, ThermometerSun, Sunrise, Sunset } from "lucide-react";
import { getWeatherIconUrl, formatTime } from "@/hooks/useWeather";
import { useState } from "react";

interface DistrictWeather {
  id: string;
  name: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  sunrise: number;
  sunset: number;
}

export default function AllDistrictsWeather() {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const { data: districts } = useQuery({
    queryKey: ["districts-for-weather"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, latitude, longitude")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ["all-districts-weather", districts?.map(d => d.id)],
    queryFn: async () => {
      if (!districts?.length) return [];
      
      const weatherPromises = districts
        .filter(d => d.latitude && d.longitude)
        .map(async (district) => {
          try {
            const { data, error } = await supabase.functions.invoke("weather", {
              body: { lat: district.latitude, lng: district.longitude },
            });
            if (error) throw error;
            return {
              id: district.id,
              name: district.name,
              temp: data.temp,
              feels_like: data.feels_like,
              temp_min: data.temp_min,
              temp_max: data.temp_max,
              description: data.description,
              icon: data.icon,
              humidity: data.humidity,
              wind_speed: data.wind_speed,
              sunrise: data.sunrise,
              sunset: data.sunset,
            } as DistrictWeather;
          } catch {
            return null;
          }
        });

      const results = await Promise.all(weatherPromises);
      return results.filter(Boolean) as DistrictWeather[];
    },
    enabled: !!districts?.length,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const hoveredWeather = weatherData?.find(w => w.id === hoveredDistrict);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Weather Across Uttarakhand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {Array(13).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData?.length) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Cloud className="h-5 w-5 text-muted-foreground" />
            Weather Across Uttarakhand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Weather data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Weather Across Uttarakhand
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* District Weather Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {weatherData.map((weather) => (
            <div
              key={weather.id}
              onMouseEnter={() => setHoveredDistrict(weather.id)}
              onMouseLeave={() => setHoveredDistrict(null)}
              className={`
                relative cursor-pointer rounded-xl p-3 transition-all duration-300 ease-out
                bg-gradient-to-br from-sky-500/10 to-blue-500/10 
                dark:from-sky-900/20 dark:to-blue-900/20 
                border border-sky-200/50 dark:border-sky-800/30
                ${hoveredDistrict === weather.id 
                  ? 'scale-105 shadow-lg border-primary/40 z-10' 
                  : 'hover:scale-102 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={getWeatherIconUrl(weather.icon)}
                  alt={weather.description}
                  className="h-8 w-8"
                  loading="lazy"
                />
                <span className="text-xl font-bold">{weather.temp}°</span>
              </div>
              <p className="text-xs font-medium truncate">{weather.name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{weather.description}</p>
            </div>
          ))}
        </div>

        {/* Hover Detail Panel */}
        <div 
          className={`
            mt-4 overflow-hidden transition-all duration-300 ease-out
            ${hoveredWeather ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          {hoveredWeather && (
            <div className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-sky-200/50 dark:border-sky-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getWeatherIconUrl(hoveredWeather.icon)}
                    alt={hoveredWeather.description}
                    className="h-12 w-12"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{hoveredWeather.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{hoveredWeather.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">{hoveredWeather.temp}°C</span>
                  <p className="text-xs text-muted-foreground">H: {hoveredWeather.temp_max}° L: {hoveredWeather.temp_min}°</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Feels like</span>
                  <span className="ml-auto font-medium">{hoveredWeather.feels_like}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Humidity</span>
                  <span className="ml-auto font-medium">{hoveredWeather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-teal-500" />
                  <span className="text-muted-foreground">Wind</span>
                  <span className="ml-auto font-medium">{hoveredWeather.wind_speed} m/s</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Sunrise className="h-4 w-4 text-orange-400" />
                    <span className="text-xs">{formatTime(hoveredWeather.sunrise)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sunset className="h-4 w-4 text-rose-400" />
                    <span className="text-xs">{formatTime(hoveredWeather.sunset)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}