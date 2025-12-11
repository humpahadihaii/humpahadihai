import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, ChevronRight, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  cover_image_url?: string;
  start_at: string;
  end_at?: string;
  event_type: string;
  is_free: boolean;
  ticket_price?: number;
  village?: { id: string; name: string; slug: string };
}

interface EventCalendarWidgetProps {
  events?: Event[];
  isLoading?: boolean;
  title?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  compact?: boolean;
  // Optional: fetch events automatically by villageId or districtId
  villageId?: string;
  districtId?: string;
  limit?: number;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: "bg-orange-500",
  fair: "bg-purple-500",
  cultural: "bg-pink-500",
  religious: "bg-yellow-500",
  music: "bg-blue-500",
  food: "bg-green-500",
  sports: "bg-red-500",
  workshop: "bg-indigo-500",
  exhibition: "bg-cyan-500",
  other: "bg-gray-500",
};

export default function EventCalendarWidget({
  events: propEvents,
  isLoading: propLoading,
  title = "Upcoming Events",
  showViewAll = true,
  viewAllLink = "/events",
  compact = false,
  villageId,
  districtId,
  limit = 5,
}: EventCalendarWidgetProps) {
  // Fetch events automatically if villageId or districtId is provided
  const { data: fetchedEvents, isLoading: fetchLoading } = useQuery({
    queryKey: ["widget-events", villageId, districtId, limit],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          id, title, slug, short_description, cover_image_url, 
          start_at, end_at, event_type, is_free, ticket_price,
          village:villages(id, name, slug)
        `)
        .eq("status", "published")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(limit);

      if (villageId) {
        query = query.eq("village_id", villageId);
      }
      if (districtId) {
        query = query.eq("district_id", districtId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
    enabled: !propEvents && (!!villageId || !!districtId),
  });

  const events = propEvents || fetchedEvents || [];
  const isLoading = propLoading || fetchLoading;

  // Generate viewAllLink based on filters
  const computedViewAllLink = villageId 
    ? `/events?village=${villageId}` 
    : districtId 
    ? `/events?district=${districtId}` 
    : viewAllLink;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No upcoming events scheduled.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={computedViewAllLink} className="text-primary">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.slug}`}
            className="block group"
          >
            <div className={`flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${compact ? 'p-2' : ''}`}>
              {/* Date Badge */}
              <div className="flex-shrink-0 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground uppercase">
                    {format(new Date(event.start_at), "MMM")}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {format(new Date(event.start_at), "d")}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(event.start_at), "h:mm a")}</span>
                  {event.village && (
                    <>
                      <MapPin className="h-3 w-3 ml-2" />
                      <span className="truncate">{event.village.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs text-white ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other}`}
                  >
                    {event.event_type}
                  </Badge>
                  {event.is_free ? (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      Free
                    </Badge>
                  ) : event.ticket_price ? (
                    <Badge variant="outline" className="text-xs">
                      <Ticket className="h-3 w-3 mr-1" />
                      ₹{event.ticket_price}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Cover Image (optional, non-compact) */}
              {!compact && event.cover_image_url && (
                <div className="flex-shrink-0 hidden sm:block">
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
