import { useState, useMemo } from "react";
import { Search, MapPin, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouteCategoryDistricts, RouteDistrict } from "@/hooks/useRouteExplorer";

interface RouteDistrictsProps {
  categoryId: string;
  onSelectDistrict: (district: RouteDistrict) => void;
}

export function RouteDistricts({ categoryId, onSelectDistrict }: RouteDistrictsProps) {
  const [search, setSearch] = useState("");
  const { data: districts, isLoading } = useRouteCategoryDistricts(categoryId);

  const filtered = useMemo(() => {
    if (!districts) return [];
    if (!search.trim()) return districts;
    const term = search.toLowerCase();
    return districts.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.region?.toLowerCase().includes(term)
    );
  }, [districts, search]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
            placeholder="Search districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* District List */}
      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No districts found
          </div>
        ) : (
          filtered.map((district) => (
            <button
              key={district.id}
              onClick={() => onSelectDistrict(district)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left group"
            >
              {district.image_url ? (
                <img
                  src={district.image_url}
                  alt={district.name}
                  className="shrink-0 w-14 h-14 rounded-lg object-cover"
                />
              ) : (
                <div className="shrink-0 w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {district.name}
                </h3>
                {district.region && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {district.region} Region
                  </p>
                )}
              </div>
              <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
