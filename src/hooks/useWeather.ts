import { useQuery } from "@tanstack/react-query";

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

interface WeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  wind: {
    speed: number;
  };
  name: string;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const fetchWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Weather API key not configured");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data: WeatherResponse = await response.json();

  return {
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    temp_min: Math.round(data.main.temp_min),
    temp_max: Math.round(data.main.temp_max),
    humidity: data.main.humidity,
    description: data.weather[0]?.description || "Unknown",
    icon: data.weather[0]?.icon || "01d",
    main: data.weather[0]?.main || "Unknown",
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    wind_speed: data.wind.speed,
    city: data.name,
    country: data.sys.country,
  };
};

export function useWeather(lat?: number | null, lng?: number | null) {
  return useQuery({
    queryKey: ["weather", lat, lng],
    queryFn: () => fetchWeather(lat!, lng!),
    enabled: !!lat && !!lng && !!import.meta.env.VITE_OPENWEATHER_API_KEY,
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
