import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

async function fetchWeatherForLocation(lat: number, lng: number, apiKey: string) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather: ${response.status}`);
  }

  const data = await response.json();
  
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Weather API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle batch mode for multiple locations
    if (body.batch && Array.isArray(body.locations)) {
      console.log(`Batch weather request for ${body.locations.length} locations`);
      
      const results = await Promise.all(
        body.locations.map(async (loc: WeatherLocation) => {
          try {
            const weather = await fetchWeatherForLocation(loc.lat, loc.lng, apiKey);
            return {
              id: loc.id,
              name: loc.name,
              ...weather,
            };
          } catch (err) {
            console.error(`Failed to fetch weather for ${loc.name}:`, err);
            return null;
          }
        })
      );
      
      const validResults = results.filter(Boolean);
      console.log(`Successfully fetched weather for ${validResults.length}/${body.locations.length} locations`);
      
      return new Response(JSON.stringify(validResults), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle single location request
    const { lat, lng } = body;

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: "lat and lng are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Single weather request for lat=${lat}, lng=${lng}`);
    const weatherData = await fetchWeatherForLocation(lat, lng, apiKey);

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weather error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch weather" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
