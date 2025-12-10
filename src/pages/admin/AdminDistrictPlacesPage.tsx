import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, Sparkles, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { districtPlacesExcelConfig } from "@/lib/excelConfigs";

interface DistrictPlace {
  id: string;
  district_id: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  map_lat: number | null;
  map_lng: number | null;
  google_maps_url: string | null;
  is_highlighted: boolean;
  is_active: boolean;
  sort_order: number;
}

const AdminDistrictPlacesPage = () => {
  const queryClient = useQueryClient();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<DistrictPlace | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const excel = useExcelOperations(districtPlacesExcelConfig);
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    full_description: "",
    image_url: "",
    map_lat: "",
    map_lng: "",
    google_maps_url: "",
    is_highlighted: false,
    is_active: true,
    sort_order: 0,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: places = [], isLoading } = useQuery({
    queryKey: ["district-places", selectedDistrict],
    queryFn: async () => {
      if (!selectedDistrict) return [];
      const { data, error } = await supabase
        .from("district_places")
        .select("*")
        .eq("district_id", selectedDistrict)
        .order("sort_order");
      if (error) throw error;
      return data as DistrictPlace[];
    },
    enabled: !!selectedDistrict,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<DistrictPlace>) => {
      if (editingPlace) {
        const { error } = await supabase
          .from("district_places")
          .update(data)
          .eq("id", editingPlace.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("district_places")
          .insert([{ ...data, district_id: selectedDistrict } as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["district-places"] });
      toast.success(editingPlace ? "Place updated" : "Place added");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to save place");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("district_places").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["district-places"] });
      toast.success("Place deleted");
    },
    onError: () => toast.error("Failed to delete place"),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      short_description: "",
      full_description: "",
      image_url: "",
      map_lat: "",
      map_lng: "",
      google_maps_url: "",
      is_highlighted: false,
      is_active: true,
      sort_order: 0,
    });
    setEditingPlace(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (place: DistrictPlace) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      short_description: place.short_description || "",
      full_description: place.full_description || "",
      image_url: place.image_url || "",
      map_lat: place.map_lat?.toString() || "",
      map_lng: place.map_lng?.toString() || "",
      google_maps_url: place.google_maps_url || "",
      is_highlighted: place.is_highlighted,
      is_active: place.is_active,
      sort_order: place.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    saveMutation.mutate({
      name: formData.name,
      short_description: formData.short_description || null,
      full_description: formData.full_description || null,
      image_url: formData.image_url || null,
      map_lat: formData.map_lat ? parseFloat(formData.map_lat) : null,
      map_lng: formData.map_lng ? parseFloat(formData.map_lng) : null,
      google_maps_url: formData.google_maps_url || null,
      is_highlighted: formData.is_highlighted,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    });
  };

  const handleAISuggest = async () => {
    if (!selectedDistrict) {
      toast.error("Please select a district first");
      return;
    }
    const districtName = districts.find(d => d.id === selectedDistrict)?.name;
    if (!districtName) return;

    setIsAILoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-content", {
        body: {
          type: "districts",
          action: "suggest_places",
          inputs: { district_name: districtName },
        },
      });

      if (error) throw error;

      const content = data?.content || "";
      // Try to parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        for (const place of suggestions) {
          await supabase.from("district_places").insert({
            district_id: selectedDistrict,
            name: place.name,
            short_description: place.short_description || place.description,
            is_active: false, // Draft mode
            is_highlighted: place.is_highlighted || false,
            sort_order: 0,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["district-places"] });
        toast.success(`Added ${suggestions.length} places as drafts`);
      } else {
        toast.error("Could not parse AI response");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI suggestion failed");
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Places to Visit</h1>
            <p className="text-muted-foreground">Manage tourist attractions and landmarks</p>
          </div>
          <ExcelImportExportButtons
            onExport={() => excel.exportToExcel(places)}
            onImportClick={() => setImportOpen(true)}
            exporting={excel.exporting}
            importing={excel.importing}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select District</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Choose a district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDistrict && (
              <>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="mr-2 h-4 w-4" /> Add Place
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPlace ? "Edit Place" : "Add Place"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Short Description</Label>
                        <Textarea
                          value={formData.short_description}
                          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Full Description</Label>
                        <Textarea
                          value={formData.full_description}
                          onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label>Image</Label>
                        <ImageUpload
                          label="Place Image"
                          value={formData.image_url}
                          onChange={(url) => setFormData({ ...formData, image_url: url })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Latitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={formData.map_lat}
                            onChange={(e) => setFormData({ ...formData, map_lat: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Longitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={formData.map_lng}
                            onChange={(e) => setFormData({ ...formData, map_lng: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Google Maps URL</Label>
                        <Input
                          value={formData.google_maps_url}
                          onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.is_highlighted}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_highlighted: checked })}
                          />
                          <Label>Highlighted</Label>
                        </div>
                      </div>
                      <div>
                        <Label>Sort Order</Label>
                        <Input
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="w-full">
                        {saveMutation.isPending ? "Saving..." : "Save Place"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={handleAISuggest} disabled={isAILoading}>
                  {isAILoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  AI: Suggest Places
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {selectedDistrict && (
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <p>Loading...</p>
              ) : places.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No places added yet. Add some or use AI suggestions.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {places.map((place) => (
                      <TableRow key={place.id}>
                        <TableCell>
                          {place.image_url ? (
                            <img src={place.image_url} alt={place.name} className="w-16 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{place.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{place.short_description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {place.is_active ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                            ) : (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Draft</span>
                            )}
                            {place.is_highlighted && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Highlighted</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(place)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(place.id)}>
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
        )}
      </div>
      <ExcelImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        sectionName="District Places"
        onDownloadTemplate={excel.downloadTemplate}
        onParseFile={excel.parseExcelFile}
        onImport={excel.importFromExcel}
        onDownloadErrors={excel.downloadErrorReport}
        importing={excel.importing}
        importProgress={excel.importProgress}
        importResult={excel.importResult}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["district-places"] })}
      />
    </AdminLayout>
  );
};

export default AdminDistrictPlacesPage;
