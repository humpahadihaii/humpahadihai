import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: "lat and lng are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Weather API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    console.log("Fetching weather from:", url.replace(apiKey, "***"));
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenWeather API error:", response.status, errorText);
      throw new Error(`Failed to fetch weather data: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenWeather response for", data.name, ":", JSON.stringify({
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0]?.description
    }));

    const weatherData = {
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
