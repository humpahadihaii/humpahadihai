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
import { Plus, Pencil, Trash2, Building, CheckCircle, Sparkles, FlaskConical } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { tourismProvidersExcelConfig } from "@/lib/excelConfigs";
import { AISeedProvidersModal } from "@/components/admin/AISeedProvidersModal";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

interface TourismProvider {
  id: string;
  name: string;
  type: string;
  district_id: string | null;
  village_id: string | null;
  contact_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website_url: string | null;
  description: string | null;
  image_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_sample: boolean;
  source: string;
  rating: number | null;
}

const PROVIDER_TYPES = [
  { value: "homestay", label: "Homestay" },
  { value: "hotel", label: "Hotel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "guide", label: "Guide" },
  { value: "taxi", label: "Taxi/Transport" },
  { value: "tour_operator", label: "Tour Operator" },
  { value: "trek_operator", label: "Trek Operator" },
  { value: "experience", label: "Experience Provider" },
  { value: "other", label: "Other" },
];

const AdminTourismProvidersPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<TourismProvider | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sampleFilter, setSampleFilter] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const [aiSeedOpen, setAiSeedOpen] = useState(false);
  const excel = useExcelOperations(tourismProvidersExcelConfig);
  const [formData, setFormData] = useState({
    name: "",
    type: "homestay",
    district_id: "",
    village_id: "",
    contact_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    website_url: "",
    description: "",
    image_url: "",
    is_verified: false,
    is_active: true,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("districts").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: villages = [] } = useQuery({
    queryKey: ["villages-by-district", formData.district_id],
    queryFn: async () => {
      if (!formData.district_id) return [];
      const { data, error } = await supabase
        .from("villages")
        .select("id, name")
        .eq("district_id", formData.district_id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!formData.district_id,
  });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["tourism-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourism_providers")
        .select("*, districts(name), villages(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredProviders = providers.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    const matchesSource = sourceFilter === "all" || p.source === sourceFilter;
    const matchesSample = sampleFilter === "all" || 
      (sampleFilter === "sample" && p.is_sample) || 
      (sampleFilter === "real" && !p.is_sample);
    return matchesSearch && matchesType && matchesSource && matchesSample;
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<TourismProvider>) => {
      if (editingProvider) {
        const { error } = await supabase.from("tourism_providers").update(data).eq("id", editingProvider.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tourism_providers").insert([data as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tourism-providers"] });
      toast.success(editingProvider ? "Provider updated" : "Provider added");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to save provider");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tourism_providers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tourism-providers"] });
      toast.success("Provider deleted");
    },
    onError: () => toast.error("Failed to delete provider"),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "homestay",
      district_id: "",
      village_id: "",
      contact_name: "",
      phone: "",
      whatsapp: "",
      email: "",
      website_url: "",
      description: "",
      image_url: "",
      is_verified: false,
      is_active: true,
    });
    setEditingProvider(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (provider: TourismProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      district_id: provider.district_id || "",
      village_id: provider.village_id || "",
      contact_name: provider.contact_name || "",
      phone: provider.phone || "",
      whatsapp: provider.whatsapp || "",
      email: provider.email || "",
      website_url: provider.website_url || "",
      description: provider.description || "",
      image_url: provider.image_url || "",
      is_verified: provider.is_verified,
      is_active: provider.is_active,
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
      type: formData.type,
      district_id: formData.district_id || null,
      village_id: formData.village_id || null,
      contact_name: formData.contact_name || null,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      email: formData.email || null,
      website_url: formData.website_url || null,
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_verified: formData.is_verified,
      is_active: formData.is_active,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tourism Providers</h1>
            <p className="text-muted-foreground">Manage homestays, hotels, guides, and local service providers</p>
          </div>
          <div className="flex items-center gap-2">
            <ExcelImportExportButtons
              onExport={() => excel.exportToExcel(filteredProviders)}
              onImportClick={() => setImportOpen(true)}
              exporting={excel.exporting}
              importing={excel.importing}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" /> Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProvider ? "Edit Provider" : "Add Provider"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Pahadi Homestay"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROVIDER_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>District</Label>
                    <Select value={formData.district_id} onValueChange={(v) => setFormData({ ...formData, district_id: v, village_id: "" })}>
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Village (Optional)</Label>
                    <Select value={formData.village_id} onValueChange={(v) => setFormData({ ...formData, village_id: v })} disabled={!formData.district_id}>
                      <SelectTrigger><SelectValue placeholder="Select village" /></SelectTrigger>
                      <SelectContent>
                        {villages.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    <Input value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label>Cover Image</Label>
                  <ImageUpload label="Provider Image" value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_verified} onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })} />
                    <Label>Verified</Label>
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? "Saving..." : "Save Provider"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Filter Providers</CardTitle>
            <Button variant="outline" onClick={() => setAiSeedOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" /> AI: Generate Samples
            </Button>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PROVIDER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="admin">Admin Added</SelectItem>
                <SelectItem value="intake_form">Intake Form</SelectItem>
                <SelectItem value="ai_generated">AI Generated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sampleFilter} onValueChange={setSampleFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="real">Real Only</SelectItem>
                <SelectItem value="sample">Samples Only</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <AISeedProvidersModal 
          open={aiSeedOpen} 
          onOpenChange={setAiSeedOpen} 
          mode="providers" 
        />

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredProviders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No providers found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider: any) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {provider.image_url ? (
                            <img src={provider.image_url} alt={provider.name} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Building className="h-4 w-4" />
                            </div>
                          )}
                          <span className="font-medium">{provider.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{PROVIDER_TYPES.find(t => t.value === provider.type)?.label || provider.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {provider.districts?.name || "-"}
                        {provider.villages?.name && <span className="text-muted-foreground text-sm"> / {provider.villages.name}</span>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {provider.phone && <p>{provider.phone}</p>}
                          {provider.email && <p className="text-muted-foreground">{provider.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {provider.is_active ? (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {provider.is_verified && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              <CheckCircle className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(provider)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(provider.id)}>
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
        sectionName="Tourism Providers"
        onDownloadTemplate={excel.downloadTemplate}
        onParseFile={excel.parseExcelFile}
        onImport={excel.importFromExcel}
        onDownloadErrors={excel.downloadErrorReport}
        importing={excel.importing}
        importProgress={excel.importProgress}
        importResult={excel.importResult}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["tourism-providers"] })}
      />
    </AdminLayout>
  );
};

export default AdminTourismProvidersPage;
