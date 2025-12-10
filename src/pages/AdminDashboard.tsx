import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboardStats";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  Map,
  Home,
  Hotel,
  Users,
  Image,
  Package,
  Plane,
  Store,
  ShoppingCart,
  Megaphone,
  Calendar,
  MessageSquare,
  Clock,
  ChevronRight,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "content", label: "Content" },
  { value: "users", label: "Users & Roles" },
  { value: "marketplace", label: "Marketplace" },
  { value: "travel", label: "Travel" },
  { value: "shop", label: "Shop" },
];

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  update: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  publish: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  unpublish: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approve: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  reject: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  assign_role: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  remove_role: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

const ENTITY_ROUTES: Record<string, string> = {
  district: "/admin/districts",
  village: "/admin/villages",
  hotel: "/admin/hotels",
  tourism_provider: "/admin/tourism-providers",
  tourism_listing: "/admin/tourism-listings",
  travel_package: "/admin/travel-packages",
  product: "/admin/products",
  product_category: "/admin/product-categories",
  promotion_package: "/admin/promotion-packages",
  gallery: "/admin/gallery",
  user: "/admin/users",
  story: "/admin/stories",
  event: "/admin/events",
  page: "/admin/pages",
  content_section: "/admin/content-sections",
  booking: "/admin/bookings",
};

interface StatCardProps {
  title: string;
  count: number;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
  lastUpdated?: { at: string; by: string } | null;
  isLoading?: boolean;
}

function StatCard({ title, count, subtitle, icon, href, lastUpdated, isLoading }: StatCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(href)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count.toLocaleString()}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1 truncate" title={`Last updated by ${lastUpdated.by}`}>
            <Clock className="inline h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(lastUpdated.at), { addSuffix: true })} by {lastUpdated.by.split("@")[0]}
          </p>
        )}
        <div className="flex items-center text-xs text-primary mt-2 group-hover:underline">
          Manage <ChevronRight className="h-3 w-3 ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isAdmin, canAccessAdminPanel } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const [activityFilter, setActivityFilter] = useState("all");
  const { data: recentActivity, isLoading: activityLoading, error: activityError } = useRecentActivity(30, activityFilter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.email?.split("@")[0]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        {statsError ? (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">Failed to load dashboard stats. Please refresh the page.</span>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{stats?.bookings.today || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.bookings.pending || 0} pending confirmation
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Today's Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{stats?.inquiries.today || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.inquiries.total || 0} total inquiries
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{stats?.users.pending || 0}</div>
                      <p className="text-xs text-muted-foreground">users awaiting approval</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{stats?.bookings.total || 0}</div>
                      <p className="text-xs text-muted-foreground">all time bookings</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Module Stats */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Content Modules</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Districts"
                  count={stats?.districts.count || 0}
                  icon={<Map className="h-4 w-4" />}
                  href="/admin/districts"
                  lastUpdated={stats?.districts.lastUpdated}
                  isLoading={statsLoading}
                />
                <StatCard
                  title="Villages"
                  count={stats?.villages.count || 0}
                  icon={<Home className="h-4 w-4" />}
                  href="/admin/villages"
                  lastUpdated={stats?.villages.lastUpdated}
                  isLoading={statsLoading}
                />
                <StatCard
                  title="Hotels & Stays"
                  count={stats?.hotels.count || 0}
                  icon={<Hotel className="h-4 w-4" />}
                  href="/admin/hotels"
                  lastUpdated={stats?.hotels.lastUpdated}
                  isLoading={statsLoading}
                />
                <StatCard
                  title="Gallery Items"
                  count={stats?.galleryItems.count || 0}
                  icon={<Image className="h-4 w-4" />}
                  href="/admin/gallery"
                  lastUpdated={stats?.galleryItems.lastUpdated}
                  isLoading={statsLoading}
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Tourism & Marketplace</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Providers"
                  count={stats?.tourismProviders.count || 0}
                  icon={<Users className="h-4 w-4" />}
                  href="/admin/tourism-providers"
                  lastUpdated={stats?.tourismProviders.lastUpdated}
                  isLoading={statsLoading}
                />
                <StatCard
                  title="Listings"
                  count={stats?.tourismListings.count || 0}
                  icon={<Store className="h-4 w-4" />}
                  href="/admin/tourism-listings"
                  lastUpdated={stats?.tourismListings.lastUpdated}
                  isLoading={statsLoading}
                />
                <StatCard
                  title="Travel Packages"
                  count={stats?.travelPackages.count || 0}
                  icon={<Plane className="h-4 w-4" />}
                  href="/admin/travel-packages"
                  lastUpdated={stats?.travelPackages.lastUpdated}
                  isLoading={statsLoading}
                />
                <StatCard
                  title="Active Promotions"
                  count={stats?.promotionPackages.count || 0}
                  icon={<Megaphone className="h-4 w-4" />}
                  href="/admin/promotion-packages"
                  lastUpdated={stats?.promotionPackages.lastUpdated}
                  isLoading={statsLoading}
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Shop & Users</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Products"
                  count={stats?.products.count || 0}
                  icon={<ShoppingCart className="h-4 w-4" />}
                  href="/admin/products"
                  lastUpdated={stats?.products.lastUpdated}
                  isLoading={statsLoading}
                />
                {(isSuperAdmin || isAdmin) && (
                  <StatCard
                    title="Users"
                    count={stats?.users.count || 0}
                    subtitle={`${stats?.users.pending || 0} pending approval`}
                    icon={<Users className="h-4 w-4" />}
                    href="/admin/users"
                    lastUpdated={stats?.users.lastUpdated}
                    isLoading={statsLoading}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="flex gap-2 flex-wrap">
              {FILTER_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={activityFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivityFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {activityError ? (
                <div className="flex items-center gap-3 p-4 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to load activity log. Please refresh the page.</span>
                </div>
              ) : activityLoading ? (
                <div className="divide-y">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="p-4 hover:bg-muted/50 transition-colors flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {activity.user_email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate">{activity.summary}</p>
                          <Badge 
                            variant="secondary" 
                            className={`flex-shrink-0 ${ACTION_COLORS[activity.action] || ""}`}
                          >
                            {activity.action.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{activity.user_email.split("@")[0]}</span>
                          <span>•</span>
                          <span title={new Date(activity.created_at).toLocaleString()}>
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                          {ENTITY_ROUTES[activity.entity_type] && (
                            <>
                              <span>•</span>
                              <Link 
                                to={ENTITY_ROUTES[activity.entity_type]}
                                className="text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View {activity.entity_type.replace("_", " ")}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm">Start managing content to see activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
