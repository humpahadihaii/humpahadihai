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
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  destination: z.string().optional(),
  region: z.string().optional(),
  duration_days: z.coerce.number().optional(),
  difficulty_level: z.string().optional(),
  best_season: z.string().optional(),
  starting_point: z.string().optional(),
  ending_point: z.string().optional(),
  price_per_person: z.coerce.number().min(0),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
  itinerary: z.string().optional(),
  thumbnail_image_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  destination: string | null;
  region: string | null;
  duration_days: number | null;
  price_per_person: number;
  thumbnail_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

const AdminTravelPackagesPage = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      title: "",
      slug: "",
      short_description: "",
      full_description: "",
      destination: "",
      region: "",
      duration_days: undefined,
      difficulty_level: "",
      best_season: "",
      starting_point: "",
      ending_point: "",
      price_per_person: 0,
      inclusions: "",
      exclusions: "",
      itinerary: "",
      thumbnail_image_url: "",
      is_featured: false,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("travel_packages")
      .select("*")
      .order("created_at", { ascending: false });

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
        .from("travel_packages")
        .update(data)
        .eq("id", editingPackage.id);

      if (error) {
        toast.error("Failed to update package");
        return;
      }
      toast.success("Package updated successfully");
    } else {
      const { error } = await supabase
        .from("travel_packages")
        .insert([data]);

      if (error) {
        toast.error("Failed to create package");
        return;
      }
      toast.success("Package created successfully");
    }

    form.reset();
    setEditingPackage(null);
    setDialogOpen(false);
    fetchPackages();
  };

  const handleEdit = async (pkg: TravelPackage) => {
    const { data } = await supabase
      .from("travel_packages")
      .select("*")
      .eq("id", pkg.id)
      .single();

    if (data) {
      setEditingPackage(data);
      form.reset({
        title: data.title,
        slug: data.slug,
        short_description: data.short_description || "",
        full_description: data.full_description || "",
        destination: data.destination || "",
        region: data.region || "",
        duration_days: data.duration_days || undefined,
        difficulty_level: data.difficulty_level || "",
        best_season: data.best_season || "",
        starting_point: data.starting_point || "",
        ending_point: data.ending_point || "",
        price_per_person: data.price_per_person,
        inclusions: data.inclusions || "",
        exclusions: data.exclusions || "",
        itinerary: data.itinerary || "",
        thumbnail_image_url: data.thumbnail_image_url || "",
        is_featured: data.is_featured,
        is_active: data.is_active,
      });
      setDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    const { error } = await supabase
      .from("travel_packages")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete package");
      return;
    }
    toast.success("Package deleted successfully");
    fetchPackages();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Travel Packages</h1>
            <p className="text-muted-foreground">Manage travel offerings</p>
          </div>
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      onChange={(e) => {
                        form.setValue("title", e.target.value);
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
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input id="destination" {...form.register("destination")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={form.watch("region") || ""}
                      onValueChange={(value) => form.setValue("region", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Garhwal">Garhwal</SelectItem>
                        <SelectItem value="Kumaon">Kumaon</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_days">Duration (Days)</Label>
                    <Input id="duration_days" type="number" {...form.register("duration_days")} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">Difficulty</Label>
                    <Select
                      value={form.watch("difficulty_level") || ""}
                      onValueChange={(value) => form.setValue("difficulty_level", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Difficult">Difficult</SelectItem>
                        <SelectItem value="Challenging">Challenging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="best_season">Best Season</Label>
                    <Input id="best_season" {...form.register("best_season")} placeholder="e.g., March-June" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_per_person">Price (INR)</Label>
                    <Input id="price_per_person" type="number" {...form.register("price_per_person")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starting_point">Starting Point</Label>
                    <Input id="starting_point" {...form.register("starting_point")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ending_point">Ending Point</Label>
                    <Input id="ending_point" {...form.register("ending_point")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea id="short_description" {...form.register("short_description")} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea id="full_description" {...form.register("full_description")} rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inclusions">Inclusions</Label>
                    <Textarea id="inclusions" {...form.register("inclusions")} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exclusions">Exclusions</Label>
                    <Textarea id="exclusions" {...form.register("exclusions")} rows={3} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itinerary">Itinerary (Day-wise)</Label>
                  <Textarea id="itinerary" {...form.register("itinerary")} rows={6} placeholder="Day 1: ...\nDay 2: ..." />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <ImageUpload
                    currentImage={form.watch("thumbnail_image_url")}
                    onImageUpload={(url) => form.setValue("thumbnail_image_url", url)}
                    folder="travel"
                  />
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_featured"
                      checked={form.watch("is_featured")}
                      onCheckedChange={(checked) => form.setValue("is_featured", checked)}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={form.watch("is_active")}
                      onCheckedChange={(checked) => form.setValue("is_active", checked)}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                    <TableHead>Package</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {pkg.thumbnail_image_url && (
                            <img src={pkg.thumbnail_image_url} alt={pkg.title} className="h-12 w-16 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium">{pkg.title}</p>
                            <p className="text-sm text-muted-foreground">{pkg.destination || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{pkg.region || "-"}</TableCell>
                      <TableCell>{pkg.duration_days ? `${pkg.duration_days} days` : "-"}</TableCell>
                      <TableCell>₹{pkg.price_per_person.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {pkg.is_featured && <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Featured</span>}
                          <span className={`px-2 py-1 rounded text-xs ${pkg.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/travel-packages/${pkg.slug}`} target="_blank"><Eye className="h-4 w-4" /></a>
                          </Button>
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

export default AdminTravelPackagesPage;
