import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BarChart3, Eye, Heart, MapPin, TrendingUp } from "lucide-react";

interface AnalyticsSummary {
  totalDistricts: number;
  totalVillages: number;
  totalHotels: number;
  totalThoughts: number;
  approvedThoughts: number;
  totalLikes: number;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalDistricts: 0,
    totalVillages: 0,
    totalHotels: 0,
    totalThoughts: 0,
    approvedThoughts: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    const [
      { count: districtsCount },
      { count: villagesCount },
      { count: hotelsCount },
      { count: thoughtsCount },
      { count: approvedCount },
      { data: likesData },
    ] = await Promise.all([
      supabase.from("districts").select("*", { count: "exact", head: true }),
      supabase.from("villages").select("*", { count: "exact", head: true }),
      supabase.from("district_hotels").select("*", { count: "exact", head: true }),
      supabase.from("thoughts").select("*", { count: "exact", head: true }),
      supabase
        .from("thoughts")
        .select("*", { count: "exact", head: true })
        .or("status.eq.approved,status.eq.featured"),
      supabase.from("thoughts").select("likes_count"),
    ]);

    const totalLikes =
      likesData?.reduce((sum, t) => sum + (t.likes_count || 0), 0) || 0;

    setAnalytics({
      totalDistricts: districtsCount || 0,
      totalVillages: villagesCount || 0,
      totalHotels: hotelsCount || 0,
      totalThoughts: thoughtsCount || 0,
      approvedThoughts: approvedCount || 0,
      totalLikes,
    });

    setLoading(false);
  };

  const stats = [
    {
      title: "Total Districts",
      value: analytics.totalDistricts,
      icon: MapPin,
      description: "Districts in Uttarakhand",
      color: "text-blue-600",
    },
    {
      title: "Total Villages",
      value: analytics.totalVillages,
      icon: MapPin,
      description: "Villages documented",
      color: "text-green-600",
    },
    {
      title: "Hotels & Stays",
      value: analytics.totalHotels,
      icon: Eye,
      description: "Accommodation listings",
      color: "text-purple-600",
    },
    {
      title: "Community Thoughts",
      value: analytics.totalThoughts,
      icon: BarChart3,
      description: `${analytics.approvedThoughts} approved`,
      color: "text-orange-600",
    },
    {
      title: "Total Likes",
      value: analytics.totalLikes,
      icon: Heart,
      description: "On approved thoughts",
      color: "text-red-600",
    },
    {
      title: "Engagement Rate",
      value: analytics.totalThoughts > 0
        ? `${((analytics.totalLikes / analytics.totalThoughts) * 100).toFixed(1)}%`
        : "0%",
      icon: TrendingUp,
      description: "Average likes per thought",
      color: "text-teal-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your cultural database performance
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading analytics...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
            <CardDescription>
              Summary of published vs draft content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Districts</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.totalDistricts} total
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Villages</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.totalVillages} total
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hotels & Stays</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.totalHotels} total
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Community Thoughts</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.approvedThoughts} / {analytics.totalThoughts} approved
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
