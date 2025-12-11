import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: "story" | "travel" | "product" | "promotion" | "seo" | "translate" | "villages";
  action: string;
  inputs: Record<string, string>;
}

const getSystemPrompt = (type: string) => {
  const basePrompt = `You are a content writer for "Hum Pahadi Haii", a platform celebrating Uttarakhand's culture, traditions, food, travel, and heritage. 
Write in an engaging, warm, and informative tone. Focus on authenticity and cultural richness.
Always respond with well-structured content that is ready to use. Do not include explanations or meta-commentary.`;

  const prompts: Record<string, string> = {
    story: `${basePrompt}
You specialize in writing stories and articles about Pahadi culture, traditions, festivals, food, and heritage.
Include vivid descriptions, cultural context, and authentic details about Uttarakhand.`,
    travel: `${basePrompt}
You specialize in creating travel package content for Uttarakhand destinations.
Include practical details, cultural highlights, scenic descriptions, and safety tips.
Focus on authentic Pahadi experiences and hidden gems.`,
    product: `${basePrompt}
You specialize in writing product descriptions for authentic Pahadi products.
Highlight traditional craftsmanship, organic origins, cultural significance, and quality.
Use marketing-friendly language that emphasizes authenticity and heritage.`,
    promotion: `${basePrompt}
You specialize in writing promotional package descriptions for businesses.
Be clear about deliverables, professional in tone, and highlight value.`,
    seo: `${basePrompt}
You specialize in SEO optimization. Generate search-engine-friendly titles and descriptions.
Keep titles under 60 characters and descriptions under 160 characters.`,
    translate: `${basePrompt}
You are a translator between English and Hindi. Maintain cultural nuances and the warm, authentic tone.
Translate naturally, not word-for-word.`,
    villages: `${basePrompt}
You are an expert on Uttarakhand geography and settlements. You have deep knowledge of villages, towns, and cities in all 13 districts.
Provide accurate, verifiable information about settlements. Include a mix of well-known towns and lesser-known villages.
Focus on authentic Pahadi names and locations.`,
  };

  return prompts[type] || basePrompt;
};

const buildPrompt = (request: AIRequest): string => {
  const { type, action, inputs } = request;

  switch (type) {
    case "story":
      switch (action) {
        case "generate":
          return `Write a complete article/story about: "${inputs.topic}"
Key points to cover: ${inputs.keyPoints || "general overview"}
Category: ${inputs.category || "Culture"}

Provide:
- Title (compelling and SEO-friendly)
- Excerpt (2-3 sentences summary)
- Full body content (4-6 paragraphs, rich with cultural details)
- Suggested tags (comma-separated)

Format as:
TITLE: [title]
EXCERPT: [excerpt]
BODY: [full article]
TAGS: [tags]`;

        case "expand":
          return `Expand and enrich this content with more cultural details, vivid descriptions, and authentic Pahadi elements:
"${inputs.content}"

Provide the expanded version directly.`;

        case "summarize":
          return `Summarize this content into a concise excerpt (2-3 sentences):
"${inputs.content}"`;

        case "improve":
          return `Improve the wording, flow, and engagement of this content while maintaining its meaning:
"${inputs.content}"`;

        case "raw":
          // Direct prompt passthrough for advanced use cases like AI seeding
          return inputs.prompt || "";

        default:
          return inputs.prompt || "";
      }

    case "travel":
      switch (action) {
        case "generate":
          return `Create a complete travel package description for:
Destination: ${inputs.destination}
Region: ${inputs.region || "Uttarakhand"}
Duration: ${inputs.duration || "3-4"} days
Difficulty: ${inputs.difficulty || "moderate"}
Trip type: ${inputs.tripType || "heritage and nature"}
Highlights: ${inputs.highlights || "local culture and scenery"}

Provide:
SHORT_DESCRIPTION: (2-3 sentences)
FULL_DESCRIPTION: (3-4 paragraphs about the experience)
ITINERARY:
Day 1: [activities]
Day 2: [activities]
(continue for all days)
INCLUSIONS: (bullet points)
EXCLUSIONS: (bullet points)
BEST_SEASON: (when to visit)`;

        case "itinerary":
          return `Create a detailed day-by-day itinerary for:
Destination: ${inputs.destination}
Duration: ${inputs.duration} days
Trip type: ${inputs.tripType || "cultural tour"}

Format each day as:
Day 1: [Title]
- Morning: [activity]
- Afternoon: [activity]
- Evening: [activity]
- Overnight: [location]`;

        default:
          return inputs.prompt || "";
      }

    case "product":
      switch (action) {
        case "generate":
          return `Create product descriptions for:
Product name: ${inputs.name}
Category: ${inputs.category}
Origin: ${inputs.origin || "Uttarakhand"}
Attributes: ${inputs.attributes || "traditional, authentic"}

Provide:
SHORT_DESCRIPTION: (1-2 sentences, marketing-friendly)
FULL_DESCRIPTION: (2-3 paragraphs covering origin, craftsmanship, uses, and cultural significance)
TAGS: (comma-separated relevant tags like "organic", "handmade", "pahadi")`;

        case "marketing":
          return `Create compelling marketing copy for this product:
"${inputs.content}"

Make it engaging, highlight benefits, and emphasize authenticity.`;

        default:
          return inputs.prompt || "";
      }

    case "promotion":
      switch (action) {
        case "generate":
          return `Create a promotion package description for:
Package type: ${inputs.packageType || "website"}
What's included: ${inputs.includes || "featured placement"}
Duration: ${inputs.duration || "7 days"}

Provide:
DESCRIPTION: (professional package description, 2-3 sentences)
DELIVERABLES: (clear bullet-point list of what the client gets)`;

        default:
          return inputs.prompt || "";
      }

    case "seo":
      return `Based on this content, generate SEO-optimized metadata:
Title: ${inputs.title}
Content: ${inputs.content || inputs.title}

Provide:
SEO_TITLE: (under 60 characters, include main keyword)
META_DESCRIPTION: (under 160 characters, compelling with call-to-action)`;

    case "translate":
      return `Translate the following to ${inputs.targetLanguage || "Hindi"}:
"${inputs.content}"

Provide only the translation, maintaining the original tone and cultural context.`;

    case "villages":
      return `List 15-20 important villages, towns, and small cities in ${inputs.districtName} district, Uttarakhand, India.

For each settlement, provide:
- name: The official name
- type: Either "village", "town", or "city"
- description: A brief one-sentence description of what makes it notable (temples, markets, historical significance, scenic beauty, etc.)

Return ONLY a valid JSON array with this exact structure, no other text:
[
  {"name": "Settlement Name", "type": "village", "description": "Brief description"},
  ...
]

Focus on:
1. District headquarters and major towns
2. Historically significant villages
3. Villages known for temples, festivals, or pilgrimage
4. Villages famous for handicrafts or local products
5. Scenic or touristy settlements

Be accurate with names - use authentic local spellings.`;

    default:
      return inputs.prompt || "";
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication before processing
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user with Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const request: AIRequest = await req.json();
    
    // Use Gemini API directly
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please set GEMINI_API_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = getSystemPrompt(request.type);
    const userPrompt = buildPrompt(request);

    console.log("AI Request:", { type: request.type, action: request.action });

    // Call Gemini API directly - using gemini-2.0-flash-exp (current available model)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    console.log("Calling Gemini API...");

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    let response;
    try {
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("Gemini API request timed out");
        return new Response(
          JSON.stringify({ error: "Request timed out. Please try again." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    console.log("Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: "API key invalid or quota exceeded." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    // Extract content from Gemini response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!content) {
      console.error("No content in Gemini response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No content generated. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
