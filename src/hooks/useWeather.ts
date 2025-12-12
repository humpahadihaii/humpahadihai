import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  main: string;
  sunrise: number;
  sunset: number;
  wind_speed: number;
  city: string;
  country: string;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const fetchWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  const { data, error } = await supabase.functions.invoke("weather", {
    body: { lat, lng },
  });

  if (error) {
    throw new Error("Failed to fetch weather data");
  }

  return data;
};

export function useWeather(lat?: number | null, lng?: number | null) {
  return useQuery({
    queryKey: ["weather", lat, lng],
    queryFn: () => fetchWeather(lat!, lng!),
    enabled: !!lat && !!lng,
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type { WeatherData };
