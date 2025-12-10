import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface AISeedProvidersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "providers" | "listings";
  preSelectedDistrictId?: string;
}

const PROVIDER_TYPES = [
  { value: "homestay", label: "Homestay" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "guide", label: "Guide" },
  { value: "taxi", label: "Taxi" },
  { value: "trek_operator", label: "Trek Operator" },
  { value: "experience", label: "Experience Host" },
];

export function AISeedProvidersModal({ 
  open, 
  onOpenChange, 
  mode,
  preSelectedDistrictId 
}: AISeedProvidersModalProps) {
  const queryClient = useQueryClient();
  const [districtId, setDistrictId] = useState(preSelectedDistrictId || "");
  const [count, setCount] = useState([4]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["homestay", "guesthouse", "guide"]);

  const { data: districts = [] } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("districts").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const selectedDistrict = districts.find(d => d.id === districtId);

  const seedMutation = useMutation({
    mutationFn: async () => {
      if (!districtId || !selectedDistrict) throw new Error("Select a district");

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      // Call AI to generate providers using direct prompt
      const prompt = mode === "providers" 
        ? `Generate a JSON array of ${count[0]} fictional tourism providers in ${selectedDistrict.name} district, Uttarakhand, India.
For each provider, include:
- name: A realistic Pahadi business name
- type: One of: ${selectedTypes.join(", ")}
- short_description: 1-2 sentences about the business
- village_name: A realistic village/town name in ${selectedDistrict.name}
- sample_phone: A fake but realistic Indian mobile number (10 digits starting with 9/8/7)
- price_hint: A rough price string like "₹800-1500 per night" or "₹2000 per trip"

Return ONLY valid JSON array, no other text:
[{"name": "...", "type": "...", "short_description": "...", "village_name": "...", "sample_phone": "...", "price_hint": "..."}, ...]`
        : `Generate a JSON array of ${count[0]} fictional tourism listings/services in ${selectedDistrict.name} district, Uttarakhand, India.
For each listing, include:
- title: A catchy service name
- category: One of: stay, trek, experience, taxi, day_trip
- short_description: 1-2 sentences
- base_price: A number (INR, reasonable for Uttarakhand)
- price_unit: per night, per person, per trip, etc.

Return ONLY valid JSON array, no other text:
[{"title": "...", "category": "...", "short_description": "...", "base_price": 1500, "price_unit": "per night"}, ...]`;

      // Use the story type with a raw prompt approach
      const response = await supabase.functions.invoke("ai-content", {
        body: {
          type: "story",
          action: "raw", // Use raw action to pass prompt directly
          inputs: { prompt },
        },
      });

      // Handle error response properly
      if (response.error) {
        const errorMessage = response.error.message || "Edge Function returned an error";
        throw new Error(errorMessage);
      }

      // Check for error in response data
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const content = response.data?.content || "";
      
      if (!content) {
        throw new Error("AI returned empty content. Please try again.");
      }
      
      // Parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Could not parse AI response. Please try again.");
      
      const items = JSON.parse(jsonMatch[0]);

      if (mode === "providers") {
        // Insert providers
        const providersToInsert = items.map((item: any) => ({
          name: item.name,
          type: item.type || "homestay",
          description: item.short_description,
          district_id: districtId,
          phone: item.sample_phone || null,
          is_active: true,
          is_verified: false,
          is_sample: true,
          source: "ai_generated",
        }));

        const { error } = await supabase.from("tourism_providers").insert(providersToInsert);
        if (error) throw error;

        return { count: providersToInsert.length };
      } else {
        // For listings, we need existing providers
        const { data: providers } = await supabase
          .from("tourism_providers")
          .select("id")
          .eq("district_id", districtId)
          .limit(10);

        if (!providers?.length) {
          throw new Error("No providers found in this district. Create providers first.");
        }

        const listingsToInsert = items.map((item: any, idx: number) => ({
          title: item.title,
          category: item.category || "stay",
          short_description: item.short_description,
          base_price: item.base_price || null,
          price_unit: item.price_unit || null,
          district_id: districtId,
          provider_id: providers[idx % providers.length].id,
          is_active: true,
          is_featured: false,
          is_sample: true,
        }));

        const { error } = await supabase.from("tourism_listings").insert(listingsToInsert);
        if (error) throw error;

        return { count: listingsToInsert.length };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tourism-providers"] });
      queryClient.invalidateQueries({ queryKey: ["tourism-listings"] });
      toast.success(`Generated ${data?.count || 0} sample ${mode}!`);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to generate samples");
    },
  });

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI: Generate Sample {mode === "providers" ? "Providers" : "Listings"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label>District *</Label>
            <Select value={districtId} onValueChange={setDistrictId}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Number to Generate: {count[0]}</Label>
            <Slider
              value={count}
              onValueChange={setCount}
              min={2}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          {mode === "providers" && (
            <div>
              <Label className="mb-2 block">Types to Include</Label>
              <div className="flex flex-wrap gap-3">
                {PROVIDER_TYPES.map((type) => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => toggleType(type.value)}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> AI-generated samples are marked with an "is_sample" flag. 
              You can edit or delete them like normal entries. They're meant to populate your 
              marketplace quickly while you onboard real providers.
            </p>
          </div>

          <Button 
            onClick={() => seedMutation.mutate()} 
            disabled={!districtId || seedMutation.isPending || (mode === "providers" && selectedTypes.length === 0)}
            className="w-full"
          >
            {seedMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {count[0]} Sample {mode === "providers" ? "Providers" : "Listings"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
