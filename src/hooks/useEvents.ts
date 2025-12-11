import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Event {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  cover_image_url?: string;
  gallery_images?: string[];
  start_at: string;
  end_at?: string;
  timezone: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  recurrence_end_at?: string;
  event_type: string;
  organizer_id?: string;
  venue_id?: string;
  district_id?: string;
  village_id?: string;
  is_featured: boolean;
  is_free: boolean;
  ticket_price?: number;
  ticket_url?: string;
  capacity?: number;
  seats_booked: number;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  tags?: string[];
  map_visible: boolean;
  status: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  venue?: EventVenue;
  district?: { id: string; name: string; slug: string };
  village?: { id: string; name: string; slug: string };
  organizer?: { id: string; name: string };
}

export interface EventVenue {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  village_id?: string;
  district_id?: string;
  phone?: string;
  website?: string;
  capacity?: number;
  is_active: boolean;
}

export interface EventOccurrence {
  id: string;
  event_id: string;
  occurrence_start: string;
  occurrence_end?: string;
  is_cancelled: boolean;
  override_title?: string;
  override_description?: string;
  override_venue_id?: string;
}

export interface EventInquiry {
  id: string;
  event_id: string;
  occurrence_id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  seats_requested: number;
  status: string;
  admin_notes?: string;
  created_at: string;
}

export interface EventPromotion {
  id: string;
  event_id: string;
  item_type: "package" | "listing" | "product";
  item_id: string;
  promote: boolean;
  priority: number;
  discount_percent?: number;
  promo_code?: string;
}

export interface EventFilters {
  status?: string;
  event_type?: string;
  district_id?: string;
  village_id?: string;
  is_featured?: boolean;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// Fetch events with filters
export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          venue:event_venues(*),
          district:districts(id, name, slug),
          village:villages(id, name, slug),
          organizer:tourism_providers(id, name)
        `)
        .order("start_at", { ascending: true });

      if (filters.status) {
        query = query.eq("status", filters.status as any);
      }
      if (filters.event_type) {
        query = query.eq("event_type", filters.event_type as any);
      }
      if (filters.district_id) {
        query = query.eq("district_id", filters.district_id);
      }
      if (filters.village_id) {
        query = query.eq("village_id", filters.village_id);
      }
      if (filters.is_featured !== undefined) {
        query = query.eq("is_featured", filters.is_featured);
      }
      if (filters.start_date) {
        query = query.gte("start_at", filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte("start_at", filters.end_date);
      }
      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });
}

// Fetch single event by slug
export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          venue:event_venues(*),
          district:districts(id, name, slug),
          village:villages(id, name, slug),
          organizer:tourism_providers(id, name)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!slug,
  });
}

// Fetch upcoming events for a village
export function useVillageEvents(villageId: string, limit = 5) {
  return useQuery({
    queryKey: ["village-events", villageId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id, title, slug, short_description, cover_image_url,
          start_at, end_at, event_type, is_free, ticket_price
        `)
        .eq("village_id", villageId)
        .eq("status", "published")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!villageId,
  });
}

// Fetch upcoming events for a district
export function useDistrictEvents(districtId: string, limit = 5) {
  return useQuery({
    queryKey: ["district-events", districtId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id, title, slug, short_description, cover_image_url,
          start_at, end_at, event_type, is_free, ticket_price,
          village:villages(id, name, slug)
        `)
        .eq("district_id", districtId)
        .eq("status", "published")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!districtId,
  });
}

// Fetch event occurrences
export function useEventOccurrences(eventId: string) {
  return useQuery({
    queryKey: ["event-occurrences", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_occurrences")
        .select("*")
        .eq("event_id", eventId)
        .order("occurrence_start", { ascending: true });

      if (error) throw error;
      return data as EventOccurrence[];
    },
    enabled: !!eventId,
  });
}

// Fetch event promotions
export function useEventPromotions(eventId: string) {
  return useQuery({
    queryKey: ["event-promotions", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_promotions")
        .select("*")
        .eq("event_id", eventId)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as EventPromotion[];
    },
    enabled: !!eventId,
  });
}

// Fetch event inquiries (admin)
export function useEventInquiries(eventId?: string) {
  return useQuery({
    queryKey: ["event-inquiries", eventId],
    queryFn: async () => {
      let query = supabase
        .from("event_inquiries")
        .select(`
          *,
          event:events(id, title, slug)
        `)
        .order("created_at", { ascending: false });

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Fetch venues
export function useEventVenues() {
  return useQuery({
    queryKey: ["event-venues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_venues")
        .select(`
          *,
          district:districts(id, name),
          village:villages(id, name)
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as (EventVenue & { district?: { id: string; name: string }; village?: { id: string; name: string } })[];
    },
  });
}

// Fetch event tags
export function useEventTags() {
  return useQuery({
    queryKey: ["event-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_tags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Create event mutation
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Partial<Event>) => {
      const { data, error } = await supabase
        .from("events")
        .insert([event as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });
}

// Update event mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Event>) => {
      const { data, error } = await supabase
        .from("events")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.slug] });
      toast.success("Event updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });
}

// Delete event mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });
}

// Publish event
export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("events")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event published successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish event: ${error.message}`);
    },
  });
}

// Submit event inquiry
export function useSubmitEventInquiry() {
  return useMutation({
    mutationFn: async (inquiry: Omit<EventInquiry, "id" | "status" | "admin_notes" | "created_at">) => {
      const { data, error } = await supabase
        .from("event_inquiries")
        .insert([inquiry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Inquiry submitted successfully! We'll contact you soon.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit inquiry: ${error.message}`);
    },
  });
}

// Update inquiry status (admin)
export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from("event_inquiries")
        .update({ status, admin_notes })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-inquiries"] });
      toast.success("Inquiry updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update inquiry: ${error.message}`);
    },
  });
}

// Create venue
export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venue: Partial<EventVenue>) => {
      const { data, error } = await supabase
        .from("event_venues")
        .insert([venue as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-venues"] });
      toast.success("Venue created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create venue: ${error.message}`);
    },
  });
}

// Add event promotion
export function useAddEventPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: Omit<EventPromotion, "id">) => {
      const { data, error } = await supabase
        .from("event_promotions")
        .insert([promotion])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-promotions", variables.event_id] });
      toast.success("Promotion added");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add promotion: ${error.message}`);
    },
  });
}

// Remove event promotion
export function useRemoveEventPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, event_id }: { id: string; event_id: string }) => {
      const { error } = await supabase
        .from("event_promotions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return event_id;
    },
    onSuccess: (event_id) => {
      queryClient.invalidateQueries({ queryKey: ["event-promotions", event_id] });
      toast.success("Promotion removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove promotion: ${error.message}`);
    },
  });
}
