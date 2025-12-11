import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Globe, MapPin, Users, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface GeoAggregate {
  id: string;
  aggregate_date: string;
  country: string | null;
  state: string | null;
  city: string | null;
  unique_visitors: number;
  sessions: number;
  page_views: number;
  conversions: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function GeoAnalytics() {
  const [dateRange, setDateRange] = useState('7');

  const { data: geoData, isLoading } = useQuery({
    queryKey: ['geo-analytics', dateRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const { data, error } = await supabase
        .from('analytics_geo_aggregates')
        .select('*')
        .gte('aggregate_date', startDate.toISOString().split('T')[0])
        .order('unique_visitors', { ascending: false });

      if (error) throw error;
      return data as GeoAggregate[];
    }
  });

  // Aggregate by country
  const countryData = geoData?.reduce((acc, item) => {
    const country = item.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = { country, unique_visitors: 0, sessions: 0, page_views: 0 };
    }
    acc[country].unique_visitors += item.unique_visitors;
    acc[country].sessions += item.sessions;
    acc[country].page_views += item.page_views;
    return acc;
  }, {} as Record<string, any>);

  const countryChartData = Object.values(countryData || {})
    .sort((a: any, b: any) => b.unique_visitors - a.unique_visitors)
    .slice(0, 10);

  const totalVisitors = countryChartData.reduce((sum: number, item: any) => sum + item.unique_visitors, 0);
  const totalSessions = countryChartData.reduce((sum: number, item: any) => sum + item.sessions, 0);
  const totalPageViews = countryChartData.reduce((sum: number, item: any) => sum + item.page_views, 0);

  if (isLoading) {
    return <div className="p-4">Loading geo analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Geographic Analytics</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(countryData || {}).length}</div>
            <p className="text-xs text-muted-foreground">Unique countries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unique visitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total page views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visitors by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="unique_visitors" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryChartData.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="unique_visitors"
                >
                  {countryChartData.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Country Table */}
      <Card>
        <CardHeader>
          <CardTitle>Country Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Country</th>
                  <th className="text-right p-2">Unique Visitors</th>
                  <th className="text-right p-2">Sessions</th>
                  <th className="text-right p-2">Page Views</th>
                  <th className="text-right p-2">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {countryChartData.map((item: any, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.country}</td>
                    <td className="text-right p-2">{item.unique_visitors.toLocaleString()}</td>
                    <td className="text-right p-2">{item.sessions.toLocaleString()}</td>
                    <td className="text-right p-2">{item.page_views.toLocaleString()}</td>
                    <td className="text-right p-2">
                      {totalVisitors > 0 ? ((item.unique_visitors / totalVisitors) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
