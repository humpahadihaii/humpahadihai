import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMapSettings } from "@/hooks/useMapSettings";
import { useMapAdmin } from "@/hooks/useDiscoveryMap";
import { toast } from "sonner";
import {
  Map,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
  Settings,
  Layers,
  MapPin,
  AlertCircle,
} from "lucide-react";

export default function AdminMapPage() {
  const { settings, isLoading: settingsLoading, updateSettings, isUpdating } = useMapSettings();
  const {
    highlights,
    highlightsLoading,
    refreshCache,
    createHighlight,
    updateHighlight,
    deleteHighlight,
  } = useMapAdmin();

  const [editingHighlight, setEditingHighlight] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRefreshCache = async () => {
    try {
      await refreshCache.mutateAsync();
      toast.success("POI cache refreshed successfully");
    } catch (error: any) {
      toast.error("Failed to refresh cache: " + error.message);
    }
  };

  const handleSaveHighlight = async (data: any) => {
    try {
      if (editingHighlight?.id) {
        await updateHighlight.mutateAsync({ id: editingHighlight.id, ...data });
        toast.success("Highlight updated");
      } else {
        await createHighlight.mutateAsync(data);
        toast.success("Highlight created");
      }
      setIsDialogOpen(false);
      setEditingHighlight(null);
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    if (!confirm("Delete this highlight?")) return;
    try {
      await deleteHighlight.mutateAsync(id);
      toast.success("Highlight deleted");
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Map Management</h1>
            <p className="text-muted-foreground">
              Configure interactive discovery map settings and highlights
            </p>
          </div>
          <Button onClick={handleRefreshCache} disabled={refreshCache.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshCache.isPending ? "animate-spin" : ""}`} />
            Refresh POI Cache
          </Button>
        </div>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="highlights" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Highlights
            </TabsTrigger>
            <TabsTrigger value="visibility" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visibility
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Map Display Settings</CardTitle>
                <CardDescription>Configure where maps appear on the website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Maps Globally</Label>
                    <p className="text-sm text-muted-foreground">Master switch for all map features</p>
                  </div>
                  <Switch
                    checked={settings?.maps_enabled}
                    onCheckedChange={(checked) => updateSettings({ maps_enabled: checked })}
                    disabled={isUpdating}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: "show_on_homepage", label: "Homepage" },
                    { key: "show_on_districts", label: "District Pages" },
                    { key: "show_on_villages", label: "Village Pages" },
                    { key: "show_on_marketplace", label: "Marketplace" },
                    { key: "show_on_travel_packages", label: "Travel Packages" },
                    { key: "show_on_hotels", label: "Hotels" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
                      <Label>{item.label}</Label>
                      <Switch
                        checked={settings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) => updateSettings({ [item.key]: checked })}
                        disabled={isUpdating || !settings?.maps_enabled}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Map View</CardTitle>
                <CardDescription>Set the default center and zoom level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Default Latitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={settings?.default_lat || 30.0668}
                      onChange={(e) => updateSettings({ default_lat: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Default Longitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={settings?.default_lng || 79.0193}
                      onChange={(e) => updateSettings({ default_lng: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Default Zoom</Label>
                    <Input
                      type="number"
                      min="1"
                      max="18"
                      value={settings?.default_zoom || 9}
                      onChange={(e) => updateSettings({ default_zoom: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Enable Marker Clustering</Label>
                    <p className="text-sm text-muted-foreground">Group nearby markers at low zoom</p>
                  </div>
                  <Switch
                    checked={settings?.enable_clustering}
                    onCheckedChange={(checked) => updateSettings({ enable_clustering: checked })}
                    disabled={isUpdating}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Map Highlights</CardTitle>
                  <CardDescription>Custom areas, trails, and regions to highlight on the map</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingHighlight(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Highlight
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingHighlight ? "Edit Highlight" : "Create Highlight"}
                      </DialogTitle>
                    </DialogHeader>
                    <HighlightForm
                      highlight={editingHighlight}
                      onSave={handleSaveHighlight}
                      onCancel={() => {
                        setIsDialogOpen(false);
                        setEditingHighlight(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {highlightsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : highlights?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No highlights created yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highlights?.map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{h.title}</p>
                              <p className="text-sm text-muted-foreground">{h.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{h.highlight_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={h.status === "published" ? "default" : "secondary"}>
                              {h.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {h.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingHighlight(h);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteHighlight(h.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visibility Tab */}
          <TabsContent value="visibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  Bulk Visibility Controls
                </CardTitle>
                <CardDescription>
                  Control which items appear on the discovery map. Edit individual items from their
                  respective admin pages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { type: "Villages", route: "/admin/villages", desc: "Control village pin visibility" },
                    { type: "Providers", route: "/admin/tourism/providers", desc: "Tourism provider markers" },
                    { type: "Listings", route: "/admin/tourism/listings", desc: "Marketplace listing pins" },
                    { type: "Travel Packages", route: "/admin/travel-packages", desc: "Package starting points" },
                    { type: "Products", route: "/admin/products", desc: "Local product locations" },
                    { type: "Events", route: "/admin/events", desc: "Event location markers" },
                  ].map((item) => (
                    <Card key={item.type} className="p-4">
                      <h3 className="font-medium mb-1">{item.type}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.route}>Manage →</a>
                      </Button>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Highlight Form Component
interface HighlightFormProps {
  highlight: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const HighlightForm: React.FC<HighlightFormProps> = ({ highlight, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: highlight?.title || "",
    slug: highlight?.slug || "",
    excerpt: highlight?.excerpt || "",
    description: highlight?.description || "",
    image_url: highlight?.image_url || "",
    highlight_type: highlight?.highlight_type || "area",
    geometry_type: highlight?.geometry_type || "polygon",
    coordinates: JSON.stringify(highlight?.coordinates || [], null, 2),
    center_lat: highlight?.center_lat || "",
    center_lng: highlight?.center_lng || "",
    stroke_color: highlight?.stroke_color || "#3b82f6",
    fill_color: highlight?.fill_color || "#3b82f680",
    is_active: highlight?.is_active ?? true,
    is_featured: highlight?.is_featured ?? false,
    status: highlight?.status || "draft",
    priority: highlight?.priority || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let coordinates;
    try {
      coordinates = JSON.parse(formData.coordinates);
    } catch {
      toast.error("Invalid coordinates JSON");
      return;
    }

    onSave({
      ...formData,
      coordinates,
      center_lat: formData.center_lat ? parseFloat(formData.center_lat as any) : null,
      center_lng: formData.center_lng ? parseFloat(formData.center_lng as any) : null,
      priority: parseInt(formData.priority as any),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Slug *</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label>Excerpt</Label>
        <Input
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Highlight Type</Label>
          <Select
            value={formData.highlight_type}
            onValueChange={(value) => setFormData({ ...formData, highlight_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="trail">Trail</SelectItem>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Geometry Type</Label>
          <Select
            value={formData.geometry_type}
            onValueChange={(value) => setFormData({ ...formData, geometry_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="polyline">Polyline</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Coordinates (JSON array of [lng, lat] pairs)</Label>
        <Textarea
          value={formData.coordinates}
          onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
          rows={4}
          className="font-mono text-sm"
          placeholder='[[79.0, 30.0], [79.5, 30.5], [79.0, 30.5]]'
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <Label>Center Lat</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.center_lat}
            onChange={(e) => setFormData({ ...formData, center_lat: e.target.value })}
          />
        </div>
        <div>
          <Label>Center Lng</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.center_lng}
            onChange={(e) => setFormData({ ...formData, center_lng: e.target.value })}
          />
        </div>
        <div>
          <Label>Stroke Color</Label>
          <Input
            type="color"
            value={formData.stroke_color}
            onChange={(e) => setFormData({ ...formData, stroke_color: e.target.value })}
          />
        </div>
        <div>
          <Label>Fill Color</Label>
          <Input
            type="color"
            value={formData.fill_color.slice(0, 7)}
            onChange={(e) => setFormData({ ...formData, fill_color: e.target.value + "80" })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            />
            Featured
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Highlight</Button>
      </div>
    </form>
  );
};
