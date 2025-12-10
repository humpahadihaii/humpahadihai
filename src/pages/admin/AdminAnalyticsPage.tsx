import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnalyticsSettingsCard } from "@/components/admin/AnalyticsSettingsCard";
import { GAEventsDiagnostics } from "@/components/admin/GAEventsDiagnostics";
import { BarChart3, Eye, Heart, MapPin, TrendingUp, ShoppingCart, Calendar, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsSummary {
  totalDistricts: number;
  totalVillages: number;
  totalHotels: number;
  totalThoughts: number;
  approvedThoughts: number;
  totalLikes: number;
  totalBookings: number;
  bookingsThisMonth: number;
  totalProducts: number;
  totalTravelPackages: number;
}

interface DailyBooking {
  date: string;
  count: number;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalDistricts: 0,
    totalVillages: 0,
    totalHotels: 0,
    totalThoughts: 0,
    approvedThoughts: 0,
    totalLikes: 0,
    totalBookings: 0,
    bookingsThisMonth: 0,
    totalProducts: 0,
    totalTravelPackages: 0,
  });
  const [dailyBookings, setDailyBookings] = useState<DailyBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [
      { count: districtsCount },
      { count: villagesCount },
      { count: hotelsCount },
      { count: thoughtsCount },
      { count: approvedCount },
      { data: likesData },
      { count: bookingsCount },
      { count: bookingsMonthCount },
      { count: productsCount },
      { count: packagesCount },
      { data: recentBookings },
    ] = await Promise.all([
      supabase.from("districts").select("*", { count: "exact", head: true }),
      supabase.from("villages").select("*", { count: "exact", head: true }),
      supabase.from("district_hotels").select("*", { count: "exact", head: true }),
      supabase.from("thoughts").select("*", { count: "exact", head: true }),
      supabase.from("thoughts").select("*", { count: "exact", head: true }).or("status.eq.approved,status.eq.featured"),
      supabase.from("thoughts").select("likes_count"),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
      supabase.from("local_products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("travel_packages").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("bookings").select("created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }),
    ]);

    const totalLikes = likesData?.reduce((sum, t) => sum + (t.likes_count || 0), 0) || 0;

    // Process daily bookings for chart
    const bookingsByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      bookingsByDay[date] = 0;
    }
    recentBookings?.forEach(booking => {
      const date = format(new Date(booking.created_at), 'yyyy-MM-dd');
      if (bookingsByDay[date] !== undefined) {
        bookingsByDay[date]++;
      }
    });
    const dailyData = Object.entries(bookingsByDay).map(([date, count]) => ({ date, count }));

    setAnalytics({
      totalDistricts: districtsCount || 0,
      totalVillages: villagesCount || 0,
      totalHotels: hotelsCount || 0,
      totalThoughts: thoughtsCount || 0,
      approvedThoughts: approvedCount || 0,
      totalLikes,
      totalBookings: bookingsCount || 0,
      bookingsThisMonth: bookingsMonthCount || 0,
      totalProducts: productsCount || 0,
      totalTravelPackages: packagesCount || 0,
    });
    setDailyBookings(dailyData);

    setLoading(false);
  };

  const exportAnalyticsCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Districts', analytics.totalDistricts],
      ['Total Villages', analytics.totalVillages],
      ['Hotels & Stays', analytics.totalHotels],
      ['Total Thoughts', analytics.totalThoughts],
      ['Approved Thoughts', analytics.approvedThoughts],
      ['Total Likes', analytics.totalLikes],
      ['Total Bookings', analytics.totalBookings],
      ['Bookings This Month', analytics.bookingsThisMonth],
      ['Active Products', analytics.totalProducts],
      ['Active Travel Packages', analytics.totalTravelPackages],
    ];
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-summary-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { title: "Total Districts", value: analytics.totalDistricts, icon: MapPin, description: "Districts in Uttarakhand", color: "text-blue-600" },
    { title: "Total Villages", value: analytics.totalVillages, icon: MapPin, description: "Villages documented", color: "text-green-600" },
    { title: "Hotels & Stays", value: analytics.totalHotels, icon: Eye, description: "Accommodation listings", color: "text-purple-600" },
    { title: "Total Bookings", value: analytics.totalBookings, icon: ShoppingCart, description: `${analytics.bookingsThisMonth} this month`, color: "text-indigo-600" },
    { title: "Community Thoughts", value: analytics.totalThoughts, icon: BarChart3, description: `${analytics.approvedThoughts} approved`, color: "text-orange-600" },
    { title: "Total Likes", value: analytics.totalLikes, icon: Heart, description: "On approved thoughts", color: "text-red-600" },
    { title: "Active Products", value: analytics.totalProducts, icon: ShoppingCart, description: "In shop", color: "text-emerald-600" },
    { title: "Travel Packages", value: analytics.totalTravelPackages, icon: Calendar, description: "Active packages", color: "text-cyan-600" },
    { title: "Engagement Rate", value: analytics.totalThoughts > 0 ? `${((analytics.totalLikes / analytics.totalThoughts) * 100).toFixed(1)}%` : "0%", icon: TrendingUp, description: "Average likes per thought", color: "text-teal-600" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Overview of your cultural database and site performance</p>
          </div>
          <Button variant="outline" onClick={exportAnalyticsCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">GA Settings</TabsTrigger>
            <TabsTrigger value="diagnostics">Event Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">Loading analytics...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.map((stat) => (
                    <Card key={stat.title}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Overview</CardTitle>
                    <CardDescription>Summary of published vs draft content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Districts</span>
                        <span className="text-sm text-muted-foreground">{analytics.totalDistricts} total</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Villages</span>
                        <span className="text-sm text-muted-foreground">{analytics.totalVillages} total</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Hotels & Stays</span>
                        <span className="text-sm text-muted-foreground">{analytics.totalHotels} total</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Community Thoughts</span>
                        <span className="text-sm text-muted-foreground">{analytics.approvedThoughts} / {analytics.totalThoughts} approved</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bookings (Last 30 Days)</CardTitle>
                <CardDescription>Daily booking trends</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyBookings.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-3xl font-bold">{analytics.totalBookings}</div>
                        <div className="text-sm text-muted-foreground">Total Bookings</div>
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className="text-3xl font-bold text-primary">{analytics.bookingsThisMonth}</div>
                        <div className="text-sm text-muted-foreground">This Month</div>
                      </div>
                    </div>
                    <div className="h-48 flex items-end gap-1">
                      {dailyBookings.map((day, i) => {
                        const maxCount = Math.max(...dailyBookings.map(d => d.count), 1);
                        const height = (day.count / maxCount) * 100;
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center group">
                            <div 
                              className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                              style={{ height: `${Math.max(height, 2)}%` }}
                              title={`${format(new Date(day.date), 'MMM d')}: ${day.count} bookings`}
                            />
                            {i % 5 === 0 && (
                              <span className="text-[10px] text-muted-foreground mt-1">
                                {format(new Date(day.date), 'M/d')}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No booking data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <AnalyticsSettingsCard />
          </TabsContent>

          <TabsContent value="diagnostics">
            <GAEventsDiagnostics />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
