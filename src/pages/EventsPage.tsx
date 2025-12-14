import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { Calendar, MapPin, Filter, Grid, List, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOHead from "@/components/SEOHead";
import { usePageSEO } from "@/hooks/useSEO";
import EventCard from "@/components/events/EventCard";

const EVENT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "festival", label: "Festival" },
  { value: "fair", label: "Fair" },
  { value: "cultural", label: "Cultural" },
  { value: "religious", label: "Religious" },
  { value: "music", label: "Music" },
  { value: "food", label: "Food" },
  { value: "sports", label: "Sports" },
  { value: "workshop", label: "Workshop" },
  { value: "exhibition", label: "Exhibition" },
];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const search = searchParams.get("search") || "";
  const eventType = searchParams.get("type") || "all";
  const districtId = searchParams.get("district") || "all";

  const seoMeta = usePageSEO("events", {
    name: "Events & Festivals",
    description: "Discover upcoming events, festivals, fairs and cultural celebrations across Uttarakhand. Find local events in villages and districts.",
  });

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["public-events", search, eventType, districtId],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          venue:event_venues(name, address),
          district:districts(id, name, slug),
          village:villages(id, name, slug)
        `)
        .eq("status", "published")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true });

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }
      if (eventType && eventType !== "all") {
        query = query.eq("event_type", eventType as any);
      }
      if (districtId && districtId !== "all") {
        query = query.eq("district_id", districtId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch districts for filter
  const { data: districts } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name")
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch featured events
  const { data: featuredEvents } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          venue:event_venues(name, address),
          district:districts(id, name, slug),
          village:villages(id, name, slug)
        `)
        .eq("status", "published")
        .eq("is_featured", true)
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsInMonth = useMemo(() => {
    if (!events) return {};
    const grouped: Record<string, typeof events> = {};
    events.forEach((event) => {
      const dateKey = format(new Date(event.start_at), "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = search || eventType !== "all" || districtId !== "all";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead meta={seoMeta} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              Events & Festivals
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Events in Uttarakhand
            </h1>
            <p className="text-lg text-muted-foreground">
              Experience the vibrant culture of Uttarakhand through festivals, fairs, and local celebrations across villages and districts.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters & Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="bg-card rounded-lg border p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
              <Select value={eventType} onValueChange={(v) => updateFilter("type", v)}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* District Filter */}
              <Select value={districtId} onValueChange={(v) => updateFilter("district", v)}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts?.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "calendar")}>
                  <TabsList>
                    <TabsTrigger value="grid">
                      <Grid className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                      <Calendar className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {eventsLoading ? (
                "Loading..."
              ) : (
                <>
                  Found <span className="font-medium text-foreground">{events?.length || 0}</span> upcoming events
                </>
              )}
            </p>
          </div>

          {/* Content */}
          {viewMode === "grid" ? (
            // Grid View
            <div>
              {eventsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or check back later for new events.
                  </p>
                </Card>
              )}
            </div>
          ) : (
            // Calendar View
            <Card>
              <CardContent className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-xl font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                  </h3>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month start */}
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Day cells */}
                  {daysInMonth.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayEvents = eventsInMonth[dateKey] || [];
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <div
                        key={dateKey}
                        className={`aspect-square p-1 border rounded-lg ${
                          isToday(day) ? "border-primary bg-primary/5" : "border-border"
                        } ${hasEvents ? "cursor-pointer hover:bg-accent" : ""}`}
                      >
                        <div className="text-sm font-medium text-center">
                          {format(day, "d")}
                        </div>
                        {hasEvents && (
                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <Link
                                key={event.id}
                                to={`/events/${event.slug}`}
                                className="block text-xs truncate px-1 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20"
                              >
                                {event.title}
                              </Link>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
