import { useState, useMemo } from "react";
import { Search, MapPin, Check, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDistrictPlaces, PlaceGuide } from "@/hooks/useRouteExplorer";

interface RoutePlacesProps {
  districtId: string;
  districtSlug: string;
  categorySlug: string;
  onSelectPlace: (place: PlaceGuide) => void;
}

const categoryColors: Record<string, string> = {
  temple: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  hill: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  lake: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  trek: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  village: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  wildlife: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  attraction: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

export function RoutePlaces({
  districtId,
  onSelectPlace,
}: RoutePlacesProps) {
  const [search, setSearch] = useState("");
  const { data: places, isLoading } = useDistrictPlaces(districtId);

  const filtered = useMemo(() => {
    if (!places) return [];
    if (!search.trim()) return places;
    const term = search.toLowerCase();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.short_description?.toLowerCase().includes(term)
    );
  }, [places, search]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Places List */}
      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No places found in this district
          </div>
        ) : (
          filtered.map((place) => {
            const categoryClass =
              categoryColors[place.category?.toLowerCase() || "attraction"] ||
              categoryColors.attraction;

            return (
              <button
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className="w-full flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left group"
              >
                {place.cover_image ? (
                  <img
                    src={place.cover_image}
                    alt={place.name}
                    className="shrink-0 w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {place.name}
                    </h3>
                    {place.has_full_guide ? (
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      >
                        <Check className="h-3 w-3" />
                        Guide
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 bg-muted text-muted-foreground"
                      >
                        <Clock className="h-3 w-3" />
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  {place.category && (
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1.5 ${categoryClass}`}
                    >
                      {place.category}
                    </span>
                  )}
                  {place.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {place.short_description}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
