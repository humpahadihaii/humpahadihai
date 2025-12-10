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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Home } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { tourismListingsExcelConfig } from "@/lib/excelConfigs";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

interface TourismListing {
  id: string;
  provider_id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  category: string;
  district_id: string | null;
  base_price: number | null;
  price_unit: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

const LISTING_CATEGORIES = [
  { value: "stay", label: "Stay/Accommodation" },
  { value: "trek", label: "Trek/Hike" },
  { value: "day_trip", label: "Day Trip" },
  { value: "local_experience", label: "Local Experience" },
  { value: "taxi_service", label: "Taxi/Transport Service" },
  { value: "tour_package", label: "Tour Package" },
];

const AdminTourismListingsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<TourismListing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const excel = useExcelOperations(tourismListingsExcelConfig);
  const { logCreate, logUpdate, logDelete } = useAdminActivityLogger();
  const [formData, setFormData] = useState({
    provider_id: "",
    title: "",
    short_description: "",
    full_description: "",
    category: "stay",
    district_id: "",
    base_price: "",
    price_unit: "per night",
    image_url: "",
    is_featured: false,
    is_active: true,
    sort_order: 0,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["tourism-providers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourism_providers")
        .select("id, name, district_id")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("districts").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["tourism-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourism_listings")
        .select("*, tourism_providers(name), districts(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredListings = listings.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<TourismListing>) => {
      if (editingListing) {
        const { error } = await supabase.from("tourism_listings").update(data).eq("id", editingListing.id);
        if (error) throw error;
        return { id: editingListing.id, title: data.title, isEdit: true };
      } else {
        const { data: inserted, error } = await supabase.from("tourism_listings").insert([data as any]).select().single();
        if (error) throw error;
        return { id: inserted?.id, title: data.title, isEdit: false };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["tourism-listings"] });
      toast.success(result.isEdit ? "Listing updated" : "Listing added");
      if (result.isEdit) {
        logUpdate("listing", result.id, result.title);
      } else if (result.id) {
        logCreate("listing", result.id, result.title);
      }
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to save listing");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from("tourism_listings").delete().eq("id", id);
      if (error) throw error;
      return { id, title };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["tourism-listings"] });
      toast.success("Listing deleted");
      logDelete("listing", result.id, result.title);
    },
    onError: () => toast.error("Failed to delete listing"),
  });

  const resetForm = () => {
    setFormData({
      provider_id: "",
      title: "",
      short_description: "",
      full_description: "",
      category: "stay",
      district_id: "",
      base_price: "",
      price_unit: "per night",
      image_url: "",
      is_featured: false,
      is_active: true,
      sort_order: 0,
    });
    setEditingListing(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (listing: TourismListing) => {
    setEditingListing(listing);
    setFormData({
      provider_id: listing.provider_id,
      title: listing.title,
      short_description: listing.short_description || "",
      full_description: listing.full_description || "",
      category: listing.category,
      district_id: listing.district_id || "",
      base_price: listing.base_price?.toString() || "",
      price_unit: listing.price_unit || "per night",
      image_url: listing.image_url || "",
      is_featured: listing.is_featured,
      is_active: listing.is_active,
      sort_order: listing.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    setFormData({
      ...formData,
      provider_id: providerId,
      district_id: provider?.district_id || formData.district_id,
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.provider_id) {
      toast.error("Title and Provider are required");
      return;
    }
    saveMutation.mutate({
      provider_id: formData.provider_id,
      title: formData.title,
      short_description: formData.short_description || null,
      full_description: formData.full_description || null,
      category: formData.category,
      district_id: formData.district_id || null,
      base_price: formData.base_price ? parseFloat(formData.base_price) : null,
      price_unit: formData.price_unit || null,
      image_url: formData.image_url || null,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tourism Listings</h1>
            <p className="text-muted-foreground">Manage stays, experiences, and services offered by providers</p>
          </div>
          <div className="flex items-center gap-2">
            <ExcelImportExportButtons
              onExport={() => excel.exportToExcel(filteredListings)}
              onImportClick={() => setImportOpen(true)}
              exporting={excel.exporting}
              importing={excel.importing}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" /> Add Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingListing ? "Edit Listing" : "Add Listing"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Provider *</Label>
                  <Select value={formData.provider_id} onValueChange={handleProviderChange}>
                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 2N/3D Village Homestay Experience"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LISTING_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>District</Label>
                    <Select value={formData.district_id} onValueChange={(v) => setFormData({ ...formData, district_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Base Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Price Unit</Label>
                    <Input
                      value={formData.price_unit}
                      onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                      placeholder="e.g. per night, per person"
                    />
                  </div>
                </div>
                <div>
                  <Label>Image</Label>
                  <ImageUpload label="Listing Image" value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                    <Label>Featured</Label>
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? "Saving..." : "Save Listing"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Listings</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {LISTING_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredListings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No listings found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing: any) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {listing.image_url ? (
                            <img src={listing.image_url} alt={listing.title} className="w-12 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-10 bg-muted rounded flex items-center justify-center">
                              <Home className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{listing.title}</span>
                            {listing.districts?.name && (
                              <p className="text-xs text-muted-foreground">{listing.districts.name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{listing.tourism_providers?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{LISTING_CATEGORIES.find(c => c.value === listing.category)?.label || listing.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {listing.base_price ? (
                          <span>₹{listing.base_price.toLocaleString()} <span className="text-muted-foreground text-xs">{listing.price_unit}</span></span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {listing.is_active ? (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {listing.is_featured && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                              <Star className="h-3 w-3 mr-1" /> Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(listing)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(listing.id)}>
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
      </div>
      <ExcelImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        sectionName="Tourism Listings"
        onDownloadTemplate={excel.downloadTemplate}
        onParseFile={excel.parseExcelFile}
        onImport={excel.importFromExcel}
        onDownloadErrors={excel.downloadErrorReport}
        importing={excel.importing}
        importProgress={excel.importProgress}
        importResult={excel.importResult}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["tourism-listings"] })}
      />
    </AdminLayout>
  );
};

export default AdminTourismListingsPage;
