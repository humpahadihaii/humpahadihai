import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrontendAnalytics } from "@/components/admin/analytics/FrontendAnalytics";
import { BackendAnalytics } from "@/components/admin/analytics/BackendAnalytics";
import { AdvancedAnalyticsDashboard } from "@/components/admin/analytics/AdvancedAnalyticsDashboard";
import { FunnelBuilder } from "@/components/admin/analytics/FunnelBuilder";
import { HeatmapViewer } from "@/components/admin/analytics/HeatmapViewer";
import { RetentionCohorts } from "@/components/admin/analytics/RetentionCohorts";
import { PathAnalysis } from "@/components/admin/analytics/PathAnalysis";
import { GeoAnalytics } from "@/components/admin/analytics/GeoAnalytics";
import { AlertsManager } from "@/components/admin/analytics/AlertsManager";
import { ScheduledReports } from "@/components/admin/analytics/ScheduledReports";
import { DataManagement } from "@/components/admin/analytics/DataManagement";
import { useAuth } from "@/hooks/useAuth";
import { isSuperAdmin, RBACRole } from "@/lib/rbac";
import { BarChart3, Shield, Lock, TrendingUp, Workflow, MousePointer2, Users, Route, Globe, Bell, FileText, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  const { roles } = useAuth();
  const normalizedRoles = (roles || []).map(r => r.toLowerCase()) as RBACRole[];
  
  // Check if user can view backend analytics (SUPER_ADMIN or DEVELOPER only)
  const canViewBackend = isSuperAdmin(normalizedRoles) || normalizedRoles.includes('developer');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Site performance, visitor insights & user behavior</p>
        </div>

        <Tabs defaultValue="advanced" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Paths
            </TabsTrigger>
            <TabsTrigger value="funnels" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Funnels
            </TabsTrigger>
            <TabsTrigger value="heatmaps" className="flex items-center gap-2">
              <MousePointer2 className="h-4 w-4" />
              Heatmaps
            </TabsTrigger>
            <TabsTrigger value="retention" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Retention
            </TabsTrigger>
            <TabsTrigger value="geo" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Geography
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="frontend" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger 
              value="backend" 
              className="flex items-center gap-2"
              disabled={!canViewBackend}
            >
              <Shield className="h-4 w-4" />
              Backend
              {!canViewBackend && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className="flex items-center gap-2"
              disabled={!canViewBackend}
            >
              <Database className="h-4 w-4" />
              Data
              {!canViewBackend && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advanced">
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="paths">
            <PathAnalysis />
          </TabsContent>

          <TabsContent value="funnels">
            <FunnelBuilder />
          </TabsContent>

          <TabsContent value="heatmaps">
            <HeatmapViewer />
          </TabsContent>

          <TabsContent value="retention">
            <RetentionCohorts />
          </TabsContent>

          <TabsContent value="geo">
            <GeoAnalytics />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsManager />
          </TabsContent>

          <TabsContent value="reports">
            <ScheduledReports />
          </TabsContent>

          <TabsContent value="frontend">
            <FrontendAnalytics />
          </TabsContent>

          <TabsContent value="backend">
            {canViewBackend ? (
              <BackendAnalytics />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Backend analytics contain sensitive admin activity data and are only accessible to Super Admins and Developers.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="data">
            {canViewBackend ? (
              <DataManagement />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Data management controls are only accessible to Super Admins and Developers.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
