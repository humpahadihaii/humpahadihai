import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  districts: { count: number; lastUpdated: { at: string; by: string } | null };
  villages: { count: number; lastUpdated: { at: string; by: string } | null };
  hotels: { count: number; lastUpdated: { at: string; by: string } | null };
  tourismProviders: { count: number; lastUpdated: { at: string; by: string } | null };
  tourismListings: { count: number; lastUpdated: { at: string; by: string } | null };
  travelPackages: { count: number; lastUpdated: { at: string; by: string } | null };
  products: { count: number; lastUpdated: { at: string; by: string } | null };
  promotionPackages: { count: number; lastUpdated: { at: string; by: string } | null };
  galleryItems: { count: number; lastUpdated: { at: string; by: string } | null };
  users: { count: number; pending: number; lastUpdated: { at: string; by: string } | null };
  bookings: { total: number; today: number; pending: number };
  inquiries: { total: number; today: number };
}

interface ActivityLog {
  id: string;
  created_at: string;
  user_email: string;
  entity_type: string;
  entity_id: string;
  action: string;
  summary: string;
  metadata: Record<string, any> | null;
}

async function fetchCounts(): Promise<Omit<DashboardStats, "districts" | "villages" | "hotels" | "tourismProviders" | "tourismListings" | "travelPackages" | "products" | "promotionPackages" | "galleryItems" | "users" | "bookings" | "inquiries"> & {
  districts: number;
  villages: number;
  hotels: number;
  tourismProviders: number;
  tourismListings: number;
  travelPackages: number;
  products: number;
  promotionPackages: number;
  galleryItems: number;
  usersTotal: number;
  usersPending: number;
  bookingsTotal: number;
  bookingsToday: number;
  bookingsPending: number;
  inquiriesTotal: number;
  inquiriesToday: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [
    districts,
    villages,
    hotels,
    tourismProviders,
    tourismListings,
    travelPackages,
    products,
    promotionPackages,
    galleryItems,
    usersTotal,
    usersPending,
    bookingsTotal,
    bookingsToday,
    bookingsPending,
    inquiriesTotal,
    inquiriesToday,
  ] = await Promise.all([
    supabase.from("districts").select("*", { count: "exact", head: true }),
    supabase.from("villages").select("*", { count: "exact", head: true }),
    supabase.from("district_hotels").select("*", { count: "exact", head: true }),
    supabase.from("tourism_providers").select("*", { count: "exact", head: true }),
    supabase.from("tourism_listings").select("*", { count: "exact", head: true }),
    supabase.from("travel_packages").select("*", { count: "exact", head: true }),
    supabase.from("local_products").select("*", { count: "exact", head: true }),
    supabase.from("promotion_packages").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("gallery_items").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", todayIso),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tourism_inquiries").select("*", { count: "exact", head: true }),
    supabase.from("tourism_inquiries").select("*", { count: "exact", head: true }).gte("created_at", todayIso),
  ]);

  return {
    districts: districts.count || 0,
    villages: villages.count || 0,
    hotels: hotels.count || 0,
    tourismProviders: tourismProviders.count || 0,
    tourismListings: tourismListings.count || 0,
    travelPackages: travelPackages.count || 0,
    products: products.count || 0,
    promotionPackages: promotionPackages.count || 0,
    galleryItems: galleryItems.count || 0,
    usersTotal: usersTotal.count || 0,
    usersPending: usersPending.count || 0,
    bookingsTotal: bookingsTotal.count || 0,
    bookingsToday: bookingsToday.count || 0,
    bookingsPending: bookingsPending.count || 0,
    inquiriesTotal: inquiriesTotal.count || 0,
    inquiriesToday: inquiriesToday.count || 0,
  };
}

async function fetchLastUpdated(): Promise<Record<string, { at: string; by: string } | null>> {
  const entityTypes = [
    "district",
    "village",
    "hotel",
    "tourism_provider",
    "tourism_listing",
    "travel_package",
    "product",
    "promotion_package",
    "gallery",
    "user",
  ];

  const results: Record<string, { at: string; by: string } | null> = {};

  // Fetch latest activity for each entity type
  const { data: logs } = await supabase
    .from("admin_activity_logs")
    .select("entity_type, created_at, user_email")
    .in("entity_type", entityTypes)
    .order("created_at", { ascending: false })
    .limit(100);

  if (logs) {
    for (const type of entityTypes) {
      const log = logs.find((l) => l.entity_type === type);
      results[type] = log ? { at: log.created_at, by: log.user_email } : null;
    }
  }

  return results;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const [counts, lastUpdated] = await Promise.all([
        fetchCounts(),
        fetchLastUpdated(),
      ]);

      return {
        districts: { count: counts.districts, lastUpdated: lastUpdated["district"] },
        villages: { count: counts.villages, lastUpdated: lastUpdated["village"] },
        hotels: { count: counts.hotels, lastUpdated: lastUpdated["hotel"] },
        tourismProviders: { count: counts.tourismProviders, lastUpdated: lastUpdated["tourism_provider"] },
        tourismListings: { count: counts.tourismListings, lastUpdated: lastUpdated["tourism_listing"] },
        travelPackages: { count: counts.travelPackages, lastUpdated: lastUpdated["travel_package"] },
        products: { count: counts.products, lastUpdated: lastUpdated["product"] },
        promotionPackages: { count: counts.promotionPackages, lastUpdated: lastUpdated["promotion_package"] },
        galleryItems: { count: counts.galleryItems, lastUpdated: lastUpdated["gallery"] },
        users: { 
          count: counts.usersTotal, 
          pending: counts.usersPending,
          lastUpdated: lastUpdated["user"] 
        },
        bookings: { 
          total: counts.bookingsTotal, 
          today: counts.bookingsToday,
          pending: counts.bookingsPending,
        },
        inquiries: { 
          total: counts.inquiriesTotal, 
          today: counts.inquiriesToday,
        },
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}

export function useRecentActivity(limit: number = 30, filter?: string) {
  return useQuery({
    queryKey: ["recent-activity", limit, filter],
    queryFn: async (): Promise<ActivityLog[]> => {
      let query = supabase
        .from("admin_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Apply category filter
      if (filter && filter !== "all") {
        const entityTypes = getEntityTypesForFilter(filter);
        if (entityTypes.length > 0) {
          query = query.in("entity_type", entityTypes);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching recent activity:", error);
        throw error;
      }

      return (data || []) as ActivityLog[];
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
  });
}

function getEntityTypesForFilter(filter: string): string[] {
  switch (filter) {
    case "content":
      return ["district", "village", "story", "event", "page", "content_section", "gallery"];
    case "users":
      return ["user", "role_assignment"];
    case "marketplace":
      return ["tourism_provider", "tourism_listing", "tourism_inquiry"];
    case "travel":
      return ["travel_package", "travel_request", "booking"];
    case "shop":
      return ["product", "product_category", "product_order"];
    default:
      return [];
  }
}
