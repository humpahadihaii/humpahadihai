import { useState, useMemo } from "react";
import { Search, Mountain, MountainSnow, Church, Footprints, Car, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouteCategories, RouteCategory } from "@/hooks/useRouteExplorer";

interface RouteCategoriesProps {
  onSelectCategory: (category: RouteCategory) => void;
}

const iconMap: Record<string, React.ElementType> = {
  mountain: Mountain,
  "mountain-snow": MountainSnow,
  church: Church,
  footprints: Footprints,
  car: Car,
  "map-pin": MapPin,
};

export function RouteCategories({ onSelectCategory }: RouteCategoriesProps) {
  const [search, setSearch] = useState("");
  const { data: categories, isLoading } = useRouteCategories();

  const filtered = useMemo(() => {
    if (!categories) return [];
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
    );
  }, [categories, search]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
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
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No routes found
          </div>
        ) : (
          filtered.map((category) => {
            const Icon = iconMap[category.icon || "map-pin"] || MapPin;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

import { ChevronRight } from "lucide-react";
