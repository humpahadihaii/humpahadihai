import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AIContentButtons } from "@/components/admin/AIContentButtons";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { promotionPackagesExcelConfig } from "@/lib/excelConfigs";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  deliverables: z.string().optional(),
  price: z.coerce.number().min(0),
  duration_days: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PromotionPackage {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  deliverables: string | null;
  price: number;
  duration_days: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const AdminPromotionPackagesPage = () => {
  const [packages, setPackages] = useState<PromotionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PromotionPackage | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const excel = useExcelOperations(promotionPackagesExcelConfig);
  const { logCreate, logUpdate, logDelete } = useAdminActivityLogger();

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      slug: "",
      type: "instagram",
      description: "",
      deliverables: "",
      price: 0,
      duration_days: undefined,
      is_active: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("promotion_packages")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to fetch packages");
      return;
    }
    setPackages(data || []);
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: PackageFormData) => {
    if (editingPackage) {
      const { error } = await supabase
        .from("promotion_packages")
        .update(data)
        .eq("id", editingPackage.id);

      if (error) {
        toast.error("Failed to update package");
        return;
      }
      toast.success("Package updated successfully");
      logUpdate("promotion_package", editingPackage.id, data.name);
    } else {
      const { data: newData, error } = await supabase
        .from("promotion_packages")
        .insert({
          name: data.name,
          slug: data.slug,
          type: data.type,
          description: data.description,
          deliverables: data.deliverables,
          price: data.price,
          duration_days: data.duration_days,
          is_active: data.is_active,
          sort_order: data.sort_order
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create package");
        return;
      }
      toast.success("Package created successfully");
      logCreate("promotion_package", newData?.id || "unknown", data.name);
    }

    form.reset();
    setEditingPackage(null);
    setDialogOpen(false);
    fetchPackages();
  };

  const handleEdit = (pkg: PromotionPackage) => {
    setEditingPackage(pkg);
    form.reset({
      name: pkg.name,
      slug: pkg.slug,
      type: pkg.type,
      description: pkg.description || "",
      deliverables: pkg.deliverables || "",
      price: pkg.price,
      duration_days: pkg.duration_days || undefined,
      is_active: pkg.is_active,
      sort_order: pkg.sort_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    const pkg = packages.find(p => p.id === id);
    const { error } = await supabase
      .from("promotion_packages")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete package");
      return;
    }
    toast.success("Package deleted successfully");
    logDelete("promotion_package", id, pkg?.name);
    fetchPackages();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Promotion Packages</h1>
            <p className="text-muted-foreground">Manage promotion offerings</p>
          </div>
          <div className="flex gap-2">
            <ExcelImportExportButtons
              onExport={() => excel.exportToExcel(packages)}
              onImportClick={() => setImportOpen(true)}
              exporting={excel.exporting}
              importing={excel.importing}
            />
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingPackage(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Package</Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
                  <AIContentButtons
                    type="promotion"
                    currentContent={{
                      name: form.watch("name") || "",
                      description: form.watch("description") || "",
                      deliverables: form.watch("deliverables") || "",
                    }}
                    onContentGenerated={(content) => {
                      if (content.description) form.setValue("description", content.description);
                      if (content.deliverables) form.setValue("deliverables", content.deliverables);
                    }}
                  />
                </div>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      onChange={(e) => {
                        form.setValue("name", e.target.value);
                        if (!editingPackage) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" {...form.register("slug")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(value) => form.setValue("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="combo">Combo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (INR)</Label>
                    <Input id="price" type="number" {...form.register("price")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_days">Duration (Days)</Label>
                    <Input id="duration_days" type="number" {...form.register("duration_days")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input id="sort_order" type="number" {...form.register("sort_order")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...form.register("description")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliverables">Deliverables</Label>
                  <Textarea id="deliverables" {...form.register("deliverables")} rows={4} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={form.watch("is_active")}
                    onCheckedChange={(checked) => form.setValue("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>{packages.length} packages found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell className="capitalize">{pkg.type}</TableCell>
                      <TableCell>₹{pkg.price.toLocaleString()}</TableCell>
                      <TableCell>{pkg.duration_days ? `${pkg.duration_days} days` : "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${pkg.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {pkg.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)}>
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
    </AdminLayout>
  );
};

export default AdminPromotionPackagesPage;
