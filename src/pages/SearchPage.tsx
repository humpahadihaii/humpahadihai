import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Search, Filter, MapPin, Star, ArrowRight } from "lucide-react";
import { SearchBox } from "@/components/search/SearchBox";
import { useSearch, SearchFilters, SearchResult } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  { value: "village", label: "Villages", icon: "🏘️" },
  { value: "district", label: "Districts", icon: "🗺️" },
  { value: "listing", label: "Stays & Experiences", icon: "🏡" },
  { value: "package", label: "Travel Packages", icon: "🎒" },
  { value: "product", label: "Local Products", icon: "🛍️" },
  { value: "story", label: "Stories", icon: "📖" },
  { value: "event", label: "Events", icon: "🎉" },
  { value: "thought", label: "Thoughts", icon: "💭" },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    content_type: searchParams.get("type")?.split(",") || [],
  });

  const {
    query,
    setQuery,
    setFilters,
    results,
    total,
    isLoading,
    trackClick,
    timings,
    page,
    setPage,
  } = useSearch();

  // Initialize from URL
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery, setQuery]);

  // Update filters
  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters, setFilters]);

  const handleSearch = (q: string) => {
    setSearchParams({ q, ...(activeFilters.content_type?.length ? { type: activeFilters.content_type.join(",") } : {}) });
    setQuery(q);
  };

  const toggleContentType = (type: string) => {
    setActiveFilters((prev) => {
      const types = prev.content_type || [];
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];
      return { ...prev, content_type: newTypes };
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const handleResultClick = (result: SearchResult, index: number) => {
    trackClick(result, index);
  };

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Content Type</h3>
        <div className="space-y-2">
          {CONTENT_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={activeFilters.content_type?.includes(type.value)}
                onCheckedChange={() => toggleContentType(type.value)}
              />
              <Label
                htmlFor={type.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {(activeFilters.content_type?.length || 0) > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{query ? `${query} - Search` : "Search"} | Hum Pahadi Haii</title>
        <meta
          name="description"
          content={`Search results for "${query}" - Discover villages, stays, travel packages, and more in Uttarakhand.`}
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Navigation is rendered by App.tsx - don't duplicate it here */}

      <main className="min-h-screen bg-background">
        {/* Search Header */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <SearchBox
                variant="hero"
                autoFocus
                onSearch={handleSearch}
                placeholder="Search villages, stays, packages, products..."
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-4">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <FiltersPanel />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  {query && (
                    <h1 className="text-2xl font-bold">
                      Results for "{query}"
                    </h1>
                  )}
                  {!isLoading && (
                    <p className="text-muted-foreground mt-1">
                      {total} result{total !== 1 ? "s" : ""} found
                      {timings && (
                        <span className="text-xs ml-2">
                          ({timings.total_ms}ms)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {(activeFilters.content_type?.length || 0) > 0 && (
                        <Badge className="ml-2" variant="secondary">
                          {activeFilters.content_type?.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersPanel />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filter Chips */}
              {(activeFilters.content_type?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {activeFilters.content_type?.map((type) => {
                    const typeInfo = CONTENT_TYPES.find((t) => t.value === type);
                    return (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => toggleContentType(type)}
                      >
                        {typeInfo?.icon} {typeInfo?.label} ✕
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* No Query State */}
              {!query && !isLoading && (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Start your search
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Search for villages, travel packages, local products, stays,
                    and more across Uttarakhand.
                  </p>
                </div>
              )}

              {/* No Results State */}
              {query && !isLoading && results.length === 0 && (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    No results found
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    We couldn't find anything matching "{query}". Try different
                    keywords or check your spelling.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" asChild>
                      <Link to="/villages">Browse Villages</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/travel-packages">Travel Packages</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/marketplace">Marketplace</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {!isLoading && results.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {results.map((result, index) => (
                    <Link
                      key={result.id}
                      to={result.url}
                      onClick={() => handleResultClick(result, index)}
                      className="group"
                    >
                      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {result.image_url ? (
                              <img
                                src={result.image_url}
                                alt={result.title}
                                className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center text-3xl flex-shrink-0">
                                {CONTENT_TYPES.find((t) => t.value === result.type)?.icon || "📄"}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1">
                                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                  {result.title}
                                </h3>
                                {result.is_promoted && (
                                  <Badge variant="default" className="flex-shrink-0 text-xs">
                                    Featured
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {result.type}
                                </Badge>
                                {result.district && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {result.district}
                                  </span>
                                )}
                                {result.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {result.rating}
                                  </span>
                                )}
                              </div>

                              {result.excerpt && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {result.excerpt}
                                </p>
                              )}

                              {result.price && (
                                <p className="text-sm font-medium text-primary mt-2">
                                  ₹{result.price.toLocaleString()}
                                </p>
                              )}
                            </div>

                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && total > 12 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(total / 12)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= Math.ceil(total / 12)}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer is rendered by App.tsx - don't duplicate it here */}
    </>
  );
}
