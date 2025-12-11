import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeocodeRequest {
  address?: string;
  lat?: number;
  lng?: number;
  action?: "geocode" | "reverse" | "test";
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_SERVER_KEY = Deno.env.get("GOOGLE_MAPS_SERVER_KEY");
    
    if (!GOOGLE_MAPS_SERVER_KEY) {
      console.error("GOOGLE_MAPS_SERVER_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Maps API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { address, lat, lng, action = "geocode" }: GeocodeRequest = await req.json();

    // Test API key
    if (action === "test") {
      console.log("Testing Google Maps API key...");
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Uttarakhand,India&key=${GOOGLE_MAPS_SERVER_KEY}`;
      const testResponse = await fetch(testUrl);
      const testData = await testResponse.json();
      
      if (testData.status === "OK") {
        return new Response(
          JSON.stringify({ success: true, status: "OK", message: "API key is valid" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error("API test failed:", testData.status, testData.error_message);
        return new Response(
          JSON.stringify({ success: false, status: testData.status, error: testData.error_message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Forward geocoding (address to coordinates)
    if (action === "geocode" && address) {
      console.log("Geocoding address:", address);

      // Check cache first
      const { data: cached } = await supabase
        .from("geocode_cache")
        .select("*")
        .eq("address", address.toLowerCase().trim())
        .gt("expires_at", new Date().toISOString())
        .single();

      if (cached) {
        console.log("Cache hit for:", address);
        return new Response(
          JSON.stringify({
            success: true,
            cached: true,
            result: {
              latitude: cached.latitude,
              longitude: cached.longitude,
              formatted_address: cached.formatted_address,
              place_id: cached.place_id,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Call Google Geocoding API
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_SERVER_KEY}&region=in`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status !== "OK" || !data.results?.length) {
        console.error("Geocoding failed:", data.status, data.error_message);
        return new Response(
          JSON.stringify({ success: false, error: data.error_message || "No results found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = data.results[0];
      const geocodeResult: GeocodeResult = {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
      };

      // Cache the result
      await supabase.from("geocode_cache").upsert({
        address: address.toLowerCase().trim(),
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        formatted_address: geocodeResult.formatted_address,
        place_id: geocodeResult.place_id,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      console.log("Geocoding successful:", geocodeResult.formatted_address);
      return new Response(
        JSON.stringify({ success: true, cached: false, result: geocodeResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reverse geocoding (coordinates to address)
    if (action === "reverse" && lat !== undefined && lng !== undefined) {
      console.log("Reverse geocoding:", lat, lng);

      const reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_SERVER_KEY}`;
      const response = await fetch(reverseUrl);
      const data = await response.json();

      if (data.status !== "OK" || !data.results?.length) {
        console.error("Reverse geocoding failed:", data.status);
        return new Response(
          JSON.stringify({ success: false, error: data.error_message || "No results found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = data.results[0];
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            latitude: lat,
            longitude: lng,
            formatted_address: result.formatted_address,
            place_id: result.place_id,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request. Provide address for geocode or lat/lng for reverse." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Geocode function error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
