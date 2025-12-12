import { Cloud, Sun, Droplets, Wind, Sunrise, Sunset, ThermometerSun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeather, getWeatherIconUrl, formatTime } from "@/hooks/useWeather";

interface WeatherWidgetProps {
  lat?: number | null;
  lng?: number | null;
  locationName?: string;
  compact?: boolean;
  className?: string;
}

export default function WeatherWidget({
  lat,
  lng,
  locationName,
  compact = false,
  className = "",
}: WeatherWidgetProps) {
  const { data: weather, isLoading, error } = useWeather(lat, lng);

  // Don't render if no coordinates or API key
  if (!lat || !lng || !import.meta.env.VITE_OPENWEATHER_API_KEY) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-200/50 ${className}`}>
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`bg-muted/50 ${className}`}>
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Cloud className="h-5 w-5" />
            <span>Weather unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={`bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-200/50 dark:from-sky-900/20 dark:to-blue-900/20 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.description}
              className="h-10 w-10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {locationName || weather.city}
              </p>
              <p className="text-xl font-bold">{weather.temp}°C</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="capitalize">{weather.description}</p>
              <p className="flex items-center gap-1 justify-end">
                <Droplets className="h-3 w-3" /> {weather.humidity}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-200/50 dark:from-sky-900/20 dark:to-blue-900/20 overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Weather</h3>
            <p className="font-medium">{locationName || weather.city}</p>
          </div>
          <img
            src={getWeatherIconUrl(weather.icon)}
            alt={weather.description}
            className="h-16 w-16 -mt-2 -mr-2"
          />
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold">{weather.temp}°C</span>
          <span className="text-muted-foreground capitalize">{weather.description}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ThermometerSun className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">Feels like</span>
            <span className="ml-auto font-medium">{weather.feels_like}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Humidity</span>
            <span className="ml-auto font-medium">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-teal-500" />
            <span className="text-muted-foreground">Wind</span>
            <span className="ml-auto font-medium">{weather.wind_speed} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">H/L</span>
            <span className="ml-auto font-medium">{weather.temp_max}°/{weather.temp_min}°</span>
          </div>
        </div>

        <div className="flex justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Sunrise className="h-3.5 w-3.5 text-orange-400" />
            <span>{formatTime(weather.sunrise)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="h-3.5 w-3.5 text-rose-400" />
            <span>{formatTime(weather.sunset)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
