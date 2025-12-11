import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, Ticket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    short_description?: string;
    cover_image_url?: string;
    start_at: string;
    end_at?: string;
    event_type: string;
    is_free: boolean;
    is_featured: boolean;
    ticket_price?: number;
    capacity?: number;
    seats_booked?: number;
    venue?: { name: string; address?: string };
    district?: { name: string; slug: string };
    village?: { name: string; slug: string };
  };
  variant?: "default" | "compact" | "featured";
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  festival: "Festival",
  fair: "Fair",
  cultural: "Cultural",
  religious: "Religious",
  music: "Music",
  food: "Food",
  sports: "Sports",
  workshop: "Workshop",
  exhibition: "Exhibition",
  other: "Event",
};

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

export default function EventCard({ event, variant = "default" }: EventCardProps) {
  const isSoldOut = event.capacity && event.seats_booked && event.seats_booked >= event.capacity;
  const spotsLeft = event.capacity ? event.capacity - (event.seats_booked || 0) : null;

  const location = event.venue?.name || event.village?.name || event.district?.name || "Uttarakhand";

  if (variant === "compact") {
    return (
      <Link to={`/events/${event.slug}`} className="block group">
        <div className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex-shrink-0 text-center">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground uppercase">
                {format(new Date(event.start_at), "MMM")}
              </span>
              <span className="text-xl font-bold text-primary">
                {format(new Date(event.start_at), "d")}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
              {event.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="overflow-hidden group">
        <div className="relative h-56">
          <img
            src={event.cover_image_url || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Featured Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
          </div>

          {/* Date Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-white rounded-lg p-2 text-center shadow-lg">
              <span className="block text-xs text-muted-foreground uppercase">
                {format(new Date(event.start_at), "MMM")}
              </span>
              <span className="block text-2xl font-bold text-primary">
                {format(new Date(event.start_at), "d")}
              </span>
            </div>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <Badge
              className={`mb-2 text-white ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other}`}
            >
              {EVENT_TYPE_LABELS[event.event_type] || "Event"}
            </Badge>
            <h3 className="text-xl font-bold line-clamp-2">{event.title}</h3>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(event.start_at), "h:mm a")}
              </span>
              {event.is_free ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Free Entry
                </Badge>
              ) : (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Ticket className="h-4 w-4" />
                  ₹{event.ticket_price}
                </span>
              )}
            </div>
            <Button asChild size="sm">
              <Link to={`/events/${event.slug}`}>View Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <div className="relative h-48">
        <img
          src={event.cover_image_url || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Date Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white rounded-lg p-2 text-center shadow-lg">
            <span className="block text-xs text-muted-foreground uppercase">
              {format(new Date(event.start_at), "MMM")}
            </span>
            <span className="block text-xl font-bold text-primary">
              {format(new Date(event.start_at), "d")}
            </span>
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            className={`text-white ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other}`}
          >
            {EVENT_TYPE_LABELS[event.event_type] || "Event"}
          </Badge>
        </div>

        {/* Featured or Sold Out Badge */}
        {(event.is_featured || isSoldOut) && (
          <div className="absolute bottom-3 left-3">
            {isSoldOut ? (
              <Badge variant="destructive">Sold Out</Badge>
            ) : event.is_featured ? (
              <Badge className="bg-primary">Featured</Badge>
            ) : null}
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          <Link to={`/events/${event.slug}`}>{event.title}</Link>
        </h3>
        
        {event.short_description && (
          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
            {event.short_description}
          </p>
        )}

        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {format(new Date(event.start_at), "EEE, MMM d")} at{" "}
              {format(new Date(event.start_at), "h:mm a")}
            </span>
          </div>
          {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 20 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>Only {spotsLeft} spots left!</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          {event.is_free ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Free Entry
            </Badge>
          ) : (
            <span className="font-semibold text-primary">
              ₹{event.ticket_price}
            </span>
          )}
          <Button asChild size="sm" variant="outline">
            <Link to={`/events/${event.slug}`}>Learn More</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
