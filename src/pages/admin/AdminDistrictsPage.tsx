import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";

const districtSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  overview: z.string().min(10, "Overview must be at least 10 characters"),
  geography: z.string().optional(),
  population: z.string().optional(),
  cultural_identity: z.string().optional(),
  famous_specialties: z.string().optional(),
  local_languages: z.string().optional(),
  connectivity: z.string().optional(),
  best_time_to_visit: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  image_url: z.string().optional(),
  banner_image: z.string().optional(),
  status: z.enum(["draft", "review", "published"]),
});

type DistrictFormData = z.infer<typeof districtSchema>;

interface District {
  id: string;
  name: string;
  slug: string;
  overview: string;
  geography?: string | null;
  population?: string | null;
  cultural_identity?: string | null;
  famous_specialties?: string | null;
  local_languages?: string | null;
  connectivity?: string | null;
  best_time_to_visit?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  banner_image?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  highlights?: string | null;
}

export default function AdminDistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);

  const form = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      name: "",
      slug: "",
      overview: "",
      geography: "",
      population: "",
      cultural_identity: "",
      famous_specialties: "",
      local_languages: "",
      connectivity: "",
      best_time_to_visit: "",
      latitude: "",
      longitude: "",
      image_url: "",
      banner_image: "",
      status: "draft",
    },
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch districts");
    } else {
      setDistricts(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: DistrictFormData) => {
    const districtData: any = {
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    };

    if (editingDistrict) {
      const { error } = await supabase
        .from("districts")
        .update(districtData)
        .eq("id", editingDistrict.id);

      if (error) {
        console.error("District update error:", error);
        toast.error(`Failed to update: ${error.message || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("District updated successfully");
        fetchDistricts();
        setDialogOpen(false);
        setEditingDistrict(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("districts").insert(districtData);

      if (error) {
        console.error("District insert error:", error);
        toast.error(`Failed to create: ${error.message || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("District created successfully");
        fetchDistricts();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    form.reset({
      ...district,
      latitude: district.latitude?.toString() || "",
      longitude: district.longitude?.toString() || "",
      status: (district.status as "draft" | "review" | "published") || "draft",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this district?")) return;

    const { error } = await supabase.from("districts").delete().eq("id", id);

    if (error) {
      console.error("District delete error:", error);
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`, {
        description: error.details || error.hint,
      });
    } else {
      toast.success("District deleted successfully");
      fetchDistricts();
    }
  };

  const filteredDistricts = districts.filter((district) =>
    district.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Districts Management</h1>
            <p className="text-muted-foreground">Manage all 13 districts of Uttarakhand</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingDistrict(null); form.reset(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add District
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDistrict ? "Edit District" : "Add New District"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.setValue("slug", generateSlug(e.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug *</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="any" placeholder="30.0668" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="any" placeholder="79.0193" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="geography"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geography</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="population"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Population</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 7,14,816" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="local_languages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local Languages</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Hindi, Garhwali" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="cultural_identity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cultural Identity</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="famous_specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Famous Specialties</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="connectivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connectivity</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} placeholder="Nearest airport, railway station, highways..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="best_time_to_visit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Time to Visit</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., March to June, September to November" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <ImageUpload
                          label="Thumbnail Image"
                          value={field.value || ""}
                          onChange={field.onChange}
                          id="district-thumbnail"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="banner_image"
                    render={({ field }) => (
                      <FormItem>
                        <ImageUpload
                          label="Banner Image"
                          value={field.value || ""}
                          onChange={field.onChange}
                          id="district-banner"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDistrict ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Population</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistricts.map((district) => (
                    <TableRow key={district.id}>
                      <TableCell className="font-medium">{district.name}</TableCell>
                      <TableCell>{district.population || "N/A"}</TableCell>
                      <TableCell>{district.local_languages || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={district.status === "published" ? "default" : "secondary"}>
                          {district.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(district)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(district.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
}
