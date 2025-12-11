import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Map, Settings, Loader2 } from "lucide-react";
import { useMapSettings } from "@/hooks/useMapSettings";

const AdminMapSettingsPage = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useMapSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({ [key]: value } as any);
  };

  const handleSaveDefaults = () => {
    if (!localSettings) return;
    updateSettings({
      default_zoom: localSettings.default_zoom,
      default_lat: localSettings.default_lat,
      default_lng: localSettings.default_lng,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Map Settings</h1>
          <p className="text-muted-foreground">Configure OpenStreetMap integration for your website (no API key required)</p>
        </div>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Feature Toggles
            </CardTitle>
            <CardDescription>
              Control where maps appear on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Maps Globally</Label>
                <p className="text-sm text-muted-foreground">Master switch for all maps</p>
              </div>
              <Switch
                checked={settings?.maps_enabled ?? true}
                onCheckedChange={(checked) => handleToggle("maps_enabled", checked)}
                disabled={isUpdating}
              />
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: "show_on_homepage", label: "Homepage Map", desc: "Show map on homepage" },
                { key: "show_on_districts", label: "District Pages", desc: "Show maps on district detail pages" },
                { key: "show_on_villages", label: "Village Pages", desc: "Show maps on village detail pages" },
                { key: "show_on_marketplace", label: "Marketplace", desc: "Show maps on marketplace listings" },
                { key: "show_on_travel_packages", label: "Travel Packages", desc: "Show maps on travel package pages" },
                { key: "show_on_hotels", label: "Hotels", desc: "Show maps on hotel listings" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={(settings as any)?.[item.key] ?? true}
                    onCheckedChange={(checked) => handleToggle(item.key, checked)}
                    disabled={isUpdating || !settings?.maps_enabled}
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label>Marker Clustering</Label>
                <p className="text-xs text-muted-foreground">Group nearby markers (coming soon)</p>
              </div>
              <Switch
                checked={settings?.enable_clustering ?? true}
                onCheckedChange={(checked) => handleToggle("enable_clustering", checked)}
                disabled={isUpdating}
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Default Map Settings
            </CardTitle>
            <CardDescription>
              Configure default map center and zoom level for Uttarakhand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Default Latitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={localSettings?.default_lat ?? 30.0668}
                  onChange={(e) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, default_lat: parseFloat(e.target.value) } : prev
                    )
                  }
                />
              </div>
              <div>
                <Label>Default Longitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={localSettings?.default_lng ?? 79.0193}
                  onChange={(e) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, default_lng: parseFloat(e.target.value) } : prev
                    )
                  }
                />
              </div>
              <div>
                <Label>Default Zoom (1-18)</Label>
                <Input
                  type="number"
                  min={1}
                  max={18}
                  value={localSettings?.default_zoom ?? 9}
                  onChange={(e) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, default_zoom: parseInt(e.target.value) } : prev
                    )
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveDefaults} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Default Settings
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200">Using OpenStreetMap</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Maps are powered by OpenStreetMap - completely free with no API keys required. 
                All map data is provided by the OpenStreetMap community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMapSettingsPage;
