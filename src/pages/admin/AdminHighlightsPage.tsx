import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const highlightSchema = z.object({
  name: z.string().min(2, "Name required"),
  type: z.string().min(1, "Type required"),
  district_id: z.string().min(1, "District required"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type HighlightFormData = z.infer<typeof highlightSchema>;

interface Highlight {
  id: string;
  name: string;
  type: string;
  district_id: string;
  description?: string | null;
  image_url?: string | null;
  status: string;
  created_at: string;
  districts?: { name: string };
}

interface District {
  id: string;
  name: string;
}

export default function AdminHighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

  const form = useForm<HighlightFormData>({
    resolver: zodResolver(highlightSchema),
    defaultValues: {
      name: "",
      type: "",
      district_id: "",
      description: "",
      image_url: "",
      status: "published",
    },
  });

  useEffect(() => {
    fetchDistricts();
    fetchHighlights();
  }, []);

  const fetchDistricts = async () => {
    const { data } = await supabase
      .from("districts")
      .select("id, name")
      .order("name");
    if (data) setDistricts(data);
  };

  const fetchHighlights = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("district_highlights")
      .select("*, districts(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch highlights");
    } else {
      setHighlights(data || []);
    }
    setLoading(false);
  };

  const onSubmit = async (data: HighlightFormData) => {
    const highlightData: any = {
      name: data.name,
      type: data.type,
      district_id: data.district_id,
      description: data.description || null,
      image_url: data.image_url || null,
      status: data.status,
    };

    if (editingHighlight) {
      const { error } = await supabase
        .from("district_highlights")
        .update(highlightData)
        .eq("id", editingHighlight.id);

      if (error) {
        toast.error("Failed to update highlight");
      } else {
        toast.success("Highlight updated successfully");
        fetchHighlights();
        setDialogOpen(false);
        setEditingHighlight(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("district_highlights").insert([highlightData]);

      if (error) {
        toast.error("Failed to create highlight");
      } else {
        toast.success("Highlight created successfully");
        fetchHighlights();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    form.reset({
      name: highlight.name,
      type: highlight.type,
      district_id: highlight.district_id,
      description: highlight.description || "",
      image_url: highlight.image_url || "",
      status: (highlight.status as "draft" | "published") || "published",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("district_highlights").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete highlight");
    } else {
      toast.success("Highlight deleted");
      fetchHighlights();
    }
  };

  const types = Array.from(new Set(highlights.map(h => h.type)));
  const filteredHighlights = highlights.filter((highlight) => {
    const matchesSearch = highlight.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === "all" || highlight.district_id === districtFilter;
    const matchesType = typeFilter === "all" || highlight.type === typeFilter;
    return matchesSearch && matchesDistrict && matchesType;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">District Highlights</h1>
            <p className="text-muted-foreground">Manage attractions, food, festivals for districts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingHighlight(null); form.reset(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Highlight
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingHighlight ? "Edit Highlight" : "Add New Highlight"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="district_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select district" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {districts.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., festival, food, craft" />
                          </FormControl>
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
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
                          label="Highlight Image"
                          value={field.value || ""}
                          onChange={field.onChange}
                          id="highlight-image"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingHighlight ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search highlights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <TableHead>District</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHighlights.map((highlight) => (
                    <TableRow key={highlight.id}>
                      <TableCell className="font-medium">{highlight.name}</TableCell>
                      <TableCell>{highlight.districts?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{highlight.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={highlight.status === "published" ? "default" : "secondary"}>
                          {highlight.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(highlight)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(highlight.id)}>
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
