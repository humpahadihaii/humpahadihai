import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrontendAnalytics } from "@/components/admin/analytics/FrontendAnalytics";
import { BackendAnalytics } from "@/components/admin/analytics/BackendAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { isSuperAdmin, RBACRole } from "@/lib/rbac";
import { BarChart3, Shield, Lock } from "lucide-react";
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
          <p className="text-muted-foreground">Site performance & admin activity insights</p>
        </div>

        <Tabs defaultValue="frontend" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="frontend" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Frontend
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
          </TabsList>

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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
