import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Map, Settings, Check, X, Loader2, RefreshCw, Globe } from "lucide-react";
import { useMapSettings } from "@/hooks/useMapSettings";
import { format } from "date-fns";

const AdminMapSettingsPage = () => {
  const { settings, isLoading, apiKey, updateSettings, isUpdating, testApiKey, isTestingApiKey } = useMapSettings();
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
      map_style: localSettings.map_style,
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
          <p className="text-muted-foreground">Configure Google Maps integration for your website</p>
        </div>
        {/* API Key Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Status of your Google Maps API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div>
                <h4 className="font-medium">Client API Key (VITE_GOOGLE_MAPS_API_KEY)</h4>
                <p className="text-sm text-muted-foreground">
                  {apiKey ? "Configured in environment" : "Not configured - add to Vercel env vars"}
                </p>
              </div>
              <Badge variant={apiKey ? "default" : "destructive"}>
                {apiKey ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                {apiKey ? "Set" : "Missing"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div>
                <h4 className="font-medium">Server API Key (GOOGLE_MAPS_SERVER_KEY)</h4>
                <p className="text-sm text-muted-foreground">
                  Used for geocoding. Status: {settings?.api_key_status || "unknown"}
                </p>
                {settings?.last_api_test && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last tested: {format(new Date(settings.last_api_test), "PPp")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={settings?.api_key_status === "valid" ? "default" : "secondary"}>
                  {settings?.api_key_status === "valid" ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <X className="h-3 w-3 mr-1" />
                  )}
                  {settings?.api_key_status || "Unknown"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testApiKey()}
                  disabled={isTestingApiKey}
                >
                  {isTestingApiKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Test
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Reminder</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                <li>• Restrict client key by HTTP referrers (your domain only)</li>
                <li>• Restrict server key by IP address</li>
                <li>• Enable only required APIs: Maps JavaScript, Places, Geocoding</li>
              </ul>
            </div>
          </CardContent>
        </Card>

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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Marker Clustering</Label>
                  <p className="text-xs text-muted-foreground">Group nearby markers</p>
                </div>
                <Switch
                  checked={settings?.enable_clustering ?? true}
                  onCheckedChange={(checked) => handleToggle("enable_clustering", checked)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Street View</Label>
                  <p className="text-xs text-muted-foreground">Enable street view control</p>
                </div>
                <Switch
                  checked={settings?.enable_street_view ?? false}
                  onCheckedChange={(checked) => handleToggle("enable_street_view", checked)}
                  disabled={isUpdating}
                />
              </div>
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
              Configure default map center and zoom level
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
                <Label>Default Zoom (1-20)</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={localSettings?.default_zoom ?? 9}
                  onChange={(e) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, default_zoom: parseInt(e.target.value) } : prev
                    )
                  }
                />
              </div>
            </div>

            <div>
              <Label>Map Style</Label>
              <Select
                value={localSettings?.map_style ?? "roadmap"}
                onValueChange={(value) =>
                  setLocalSettings((prev) => (prev ? { ...prev, map_style: value } : prev))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roadmap">Roadmap</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveDefaults} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Default Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMapSettingsPage;
