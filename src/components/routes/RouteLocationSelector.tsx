import { useState, useMemo } from "react";
import { ChevronLeft, MapPin, Search, ChevronRight, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface District {
  id: string;
  name: string;
  slug: string;
}

interface Village {
  id: string;
  name: string;
  slug: string;
  tehsil: string | null;
}

interface RouteLocationSelectorProps {
  onClose: () => void;
}

export function RouteLocationSelector({ onClose }: RouteLocationSelectorProps) {
  const [step, setStep] = useState<"district" | "village" | "confirm">("district");
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [districtSearch, setDistrictSearch] = useState("");
  const [villageSearch, setVillageSearch] = useState("");

  // Fetch all districts
  const { data: districts, isLoading: districtsLoading } = useQuery({
    queryKey: ["route-districts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, slug")
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data as District[];
    },
    staleTime: 1000 * 60 * 60,
  });

  // Fetch villages for selected district
  const { data: villages, isLoading: villagesLoading } = useQuery({
    queryKey: ["route-villages", selectedDistrict?.id],
    queryFn: async () => {
      if (!selectedDistrict) return [];
      const { data, error } = await supabase
        .from("villages")
        .select("id, name, slug, tehsil")
        .eq("district_id", selectedDistrict.id)
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data as Village[];
    },
    enabled: !!selectedDistrict?.id,
    staleTime: 1000 * 60 * 30,
  });

  // Filter districts by search
  const filteredDistricts = useMemo(() => {
    if (!districts) return [];
    if (!districtSearch.trim()) return districts;
    const search = districtSearch.toLowerCase();
    return districts.filter(d => d.name.toLowerCase().includes(search));
  }, [districts, districtSearch]);

  // Filter villages by search
  const filteredVillages = useMemo(() => {
    if (!villages) return [];
    if (!villageSearch.trim()) return villages;
    const search = villageSearch.toLowerCase();
    return villages.filter(v => 
      v.name.toLowerCase().includes(search) || 
      v.tehsil?.toLowerCase().includes(search)
    );
  }, [villages, villageSearch]);

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setVillageSearch("");
    setStep("village");
  };

  const handleVillageSelect = (village: Village) => {
    setSelectedVillage(village);
    setStep("confirm");
  };

  const handleBack = () => {
    if (step === "village") {
      setStep("district");
      setSelectedDistrict(null);
      setSelectedVillage(null);
    } else if (step === "confirm") {
      setStep("village");
      setSelectedVillage(null);
    }
  };

  const getTitle = () => {
    if (step === "district") return "Select District";
    if (step === "village") return selectedDistrict?.name || "Select Village";
    return "Confirm Location";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {step !== "district" && (
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h3 className="font-display text-lg font-semibold flex-1">{getTitle()}</h3>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Step 1: District Selection */}
        {step === "district" && (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search districts..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {districtsLoading ? (
              <div className="space-y-2">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : filteredDistricts.length > 0 ? (
              <div className="space-y-2">
                {filteredDistricts.map((district) => (
                  <button
                    key={district.id}
                    onClick={() => handleDistrictSelect(district)}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-xl border border-border/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{district.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No districts found
              </p>
            )}
          </div>
        )}

        {/* Step 2: Village Selection */}
        {step === "village" && (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search villages..."
                value={villageSearch}
                onChange={(e) => setVillageSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {villagesLoading ? (
              <div className="space-y-2">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : filteredVillages.length > 0 ? (
              <div className="space-y-2">
                {filteredVillages.map((village) => (
                  <button
                    key={village.id}
                    onClick={() => handleVillageSelect(village)}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-xl border border-border/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <span className="font-medium block">{village.name}</span>
                        {village.tehsil && (
                          <span className="text-xs text-muted-foreground">{village.tehsil}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No villages found in {selectedDistrict?.name}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirm" && selectedDistrict && selectedVillage && (
          <div className="p-4">
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Selected Location</p>
                  <h4 className="font-display text-lg font-semibold">{selectedVillage.name}</h4>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">District</span>
                  <span className="font-medium">{selectedDistrict.name}</span>
                </div>
                {selectedVillage.tehsil && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tehsil</span>
                    <span className="font-medium">{selectedVillage.tehsil}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-muted/50 rounded-xl p-4 border border-border/50 text-center">
              <div className="h-10 w-10 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm mb-1">Route Planning Coming Soon</p>
              <p className="text-xs text-muted-foreground">
                We're working on detailed route guides to {selectedVillage.name}. Check back soon!
              </p>
            </div>

            <button
              onClick={() => {
                setStep("district");
                setSelectedDistrict(null);
                setSelectedVillage(null);
              }}
              className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Select Another Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
