import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Droplets, Wind } from "lucide-react";
import { getWeatherIconUrl } from "@/hooks/useWeather";

interface DistrictWeather {
  id: string;
  name: string;
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

export default function AllDistrictsWeather() {
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
              description: data.description,
              icon: data.icon,
              humidity: data.humidity,
              wind_speed: data.wind_speed,
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Districts Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array(13).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            All Districts Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Weather data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Cloud className="h-5 w-5 text-sky-500" />
          All Districts Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {weatherData.map((weather) => (
            <div
              key={weather.id}
              className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-sky-200/50 dark:border-sky-800/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={getWeatherIconUrl(weather.icon)}
                  alt={weather.description}
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold">{weather.temp}°</span>
              </div>
              <p className="text-xs font-medium truncate">{weather.name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{weather.description}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Droplets className="h-3 w-3" /> {weather.humidity}%
                </span>
                <span className="flex items-center gap-0.5">
                  <Wind className="h-3 w-3" /> {weather.wind_speed}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
