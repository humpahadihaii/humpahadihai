import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: "story" | "travel" | "product" | "promotion" | "seo" | "translate" | "villages" | "village" | "cultural" | "bulk";
  action: string;
  inputs: Record<string, string>;
  input?: Record<string, string>;
}

// Gemini API pricing (as of 2024) - per 1M tokens
const GEMINI_PRICING = {
  "gemini-2.5-flash": { input: 0.075, output: 0.30 },
  "gemini-2.0-pro": { input: 1.25, output: 5.00 },
  "gemini-1.5-pro": { input: 1.25, output: 5.00 },
};

const estimateCost = (model: string, inputTokens: number, outputTokens: number): number => {
  const pricing = GEMINI_PRICING[model as keyof typeof GEMINI_PRICING] || GEMINI_PRICING["gemini-2.5-flash"];
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1000000;
};

const getSystemPrompt = (type: string) => {
  const basePrompt = `You are a content writer for "Hum Pahadi Haii", a platform celebrating Uttarakhand's culture, traditions, food, travel, and heritage. 
Write in an engaging, warm, and informative tone. Focus on authenticity and cultural richness.
Always respond with well-structured content that is ready to use. Do not include explanations or meta-commentary.
Do not use emojis. Do not use markdown unless explicitly requested. Do not fabricate sources or citations.`;

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
    village: `${basePrompt}
You specialize in writing detailed, authentic content about villages in Uttarakhand.
Include cultural details, local traditions, food specialties, handicrafts, and historical significance.
Write in an engaging narrative style that brings the village to life for readers.`,
    cultural: `${basePrompt}
You specialize in writing detailed cultural content about Uttarakhand's traditions, food, festivals, temples, and heritage.
Provide accurate historical and cultural context. Include local names and terminology.`,
  };

  return prompts[type] || basePrompt;
};

const buildPrompt = (request: AIRequest): string => {
  const { type, action, inputs: rawInputs, input } = request;
  const inputs = rawInputs || input || {};

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

    case "village":
      switch (action) {
        case "generate_section":
          return inputs.prompt || `Write detailed content about ${inputs.section} for ${inputs.villageName} village in ${inputs.districtName} district, Uttarakhand.`;
        
        case "generate_all":
          return `Write comprehensive content for ${inputs.villageName} village in ${inputs.districtName} district, Uttarakhand, India.

Provide content for each section:

INTRODUCTION:
(2-3 paragraphs about the village's location, significance, and overview)

HISTORY:
(2 paragraphs about historical background)

TRADITIONS:
(2 paragraphs about local customs and cultural practices)

FESTIVALS:
(List major festivals celebrated with brief descriptions)

FOODS:
(Describe traditional local cuisine and specialties)

RECIPES:
(1-2 traditional recipe descriptions)

HANDICRAFTS:
(Describe local crafts and artisan traditions)

ARTISANS:
(Information about local craftspeople)

STORIES:
(Local folklore, legends, or notable stories)

TRAVEL_TIPS:
(How to reach, best time to visit, accommodation options)`;

        default:
          return inputs.prompt || "";
      }

    case "cultural":
      switch (action) {
        case "generate_overview":
          return `Write a comprehensive overview for "${inputs.title}" in ${inputs.districtName} district, Uttarakhand.
Category: ${inputs.category}
Subcategory: ${inputs.subcategory || "General"}

Provide a 2-3 paragraph introduction covering what it is, its significance, and why it matters to Pahadi culture.`;

        case "generate_history":
          return `Write the historical background for "${inputs.title}" in Uttarakhand.
Include origin stories, historical significance, and evolution over time.
2-3 paragraphs.`;

        case "generate_cultural_significance":
          return `Explain the cultural significance of "${inputs.title}" in Uttarakhand's Pahadi culture.
Include its role in local traditions, community life, and identity.
2-3 paragraphs.`;

        case "generate_faqs":
          return `Generate 5 frequently asked questions and answers about "${inputs.title}" in Uttarakhand.
Format as JSON array:
[
  {"question": "...", "answer": "..."},
  ...
]`;

        case "generate_all":
          return `Write comprehensive content for "${inputs.title}" - a ${inputs.category} from ${inputs.districtName} district, Uttarakhand.

Provide content for each section:

SHORT_INTRO: (2-3 sentences)

CULTURAL_SIGNIFICANCE: (2 paragraphs)

ORIGIN_HISTORY: (2 paragraphs)

${inputs.category === "Food" ? `
INGREDIENTS: (list of main ingredients)
PREPARATION_METHOD: (how it's made)
TASTE_DESCRIPTION: (what it tastes like)
CONSUMPTION_OCCASIONS: (when it's typically eaten)
` : ""}

${inputs.category === "Temple" || inputs.category === "Spiritual" ? `
SPIRITUAL_SIGNIFICANCE: (religious importance)
TIMINGS: (visiting hours)
ENTRY_FEE: (if any)
DOS_AND_DONTS: (visitor guidelines)
` : ""}

FUN_FACTS: (3-5 interesting facts)

FAQS: (5 Q&A pairs as JSON array)`;

        default:
          return inputs.prompt || "";
      }

    default:
      return inputs.prompt || "";
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for logging, anon key for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const request: AIRequest = await req.json();
    
    // Get Gemini API key from Supabase secrets (NOT from database)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured in secrets");
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured. Please add GEMINI_API_KEY in Admin Settings." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active model from config
    let activeModel = "gemini-2.5-flash";
    try {
      const { data: configData } = await supabaseService
        .from("ai_config")
        .select("setting_value")
        .eq("setting_key", "active_model")
        .single();
      
      if (configData?.setting_value) {
        activeModel = JSON.parse(JSON.stringify(configData.setting_value)).replace(/"/g, '');
      }
    } catch (configError) {
      console.log("Using default model:", activeModel);
    }

    // Check if API is enabled
    try {
      const { data: enabledConfig } = await supabaseService
        .from("ai_config")
        .select("setting_value")
        .eq("setting_key", "api_enabled")
        .single();
      
      if (enabledConfig?.setting_value === false || enabledConfig?.setting_value === "false") {
        return new Response(
          JSON.stringify({ error: "AI generation is currently disabled by administrator." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      // Continue if config check fails
    }

    const systemPrompt = getSystemPrompt(request.type);
    const userPrompt = buildPrompt(request);

    console.log("AI Request:", { type: request.type, action: request.action, model: activeModel });

    // Call Google Gemini API directly
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent`;

    console.log("Calling Gemini API...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let response;
    const startTime = Date.now();
    
    try {
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        // Log failed request
        await logUsage(supabaseService, user, request, activeModel, 0, 0, "failed", "Request timed out");
        return new Response(
          JSON.stringify({ error: "Request timed out. Please try again." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    console.log("Gemini API response status:", response.status, "Time:", responseTime, "ms");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      let errorMessage = "AI service temporarily unavailable. Please try again.";
      let logStatus = "failed";

      if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
        logStatus = "rate_limited";
      } else if (response.status === 400) {
        errorMessage = "Invalid request. Please check your input and try again.";
      } else if (response.status === 403) {
        errorMessage = "API key invalid or expired. Please check your Gemini API key.";
      }

      await logUsage(supabaseService, user, request, activeModel, 0, 0, logStatus, errorMessage);

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    // Extract content from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Extract token usage from response
    const usageMetadata = data.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    const totalTokens = usageMetadata.totalTokenCount || inputTokens + outputTokens;

    if (!content) {
      console.error("No content in AI response:", JSON.stringify(data));
      await logUsage(supabaseService, user, request, activeModel, inputTokens, outputTokens, "failed", "No content generated");
      return new Response(
        JSON.stringify({ error: "No content generated. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful usage
    await logUsage(supabaseService, user, request, activeModel, inputTokens, outputTokens, "success");

    return new Response(
      JSON.stringify({ 
        content,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          model: activeModel,
          estimatedCost: estimateCost(activeModel, inputTokens, outputTokens),
        }
      }),
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

async function logUsage(
  supabase: any,
  user: any,
  request: AIRequest,
  model: string,
  inputTokens: number,
  outputTokens: number,
  status: string,
  errorMessage?: string
) {
  try {
    const estimatedCost = estimateCost(model, inputTokens, outputTokens);
    
    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action_type: `${request.type}_${request.action}`,
      content_type: request.type,
      model_used: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      estimated_cost_usd: estimatedCost,
      status,
      error_message: errorMessage || null,
      request_metadata: {
        action: request.action,
        inputs_keys: Object.keys(request.inputs || request.input || {}),
      },
    });
    
    console.log("Usage logged:", { model, tokens: inputTokens + outputTokens, cost: estimatedCost, status });
  } catch (logError) {
    console.error("Failed to log usage:", logError);
  }
}
