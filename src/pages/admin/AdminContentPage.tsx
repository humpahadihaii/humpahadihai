import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Pencil, Trash2, Plus, Search, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { Database } from "@/integrations/supabase/types";

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];
type District = Database["public"]["Tables"]["districts"]["Row"];

interface AdminContentPageProps {
  contentType: "culture" | "food" | "travel" | "thought";
  title: string;
  description: string;
}

const contentSchema = z.object({
  title: z.string().min(3, "Title required"),
  slug: z.string().min(3, "Slug required"),
  excerpt: z.string().optional(),
  body: z.string().min(10, "Content body required"),
  main_image_url: z.string().optional(),
  status: z.enum(["draft", "published"]),
  district_id: z.string().optional(),
  meta_json: z.string().optional(),
});

type ContentFormData = z.infer<typeof contentSchema>;

export default function AdminContentPage({ contentType, title, description }: AdminContentPageProps) {
  const [items, setItems] = useState<(ContentItem & { districts?: { name: string } | null })[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      main_image_url: "",
      status: "draft",
      district_id: "",
      meta_json: "{}",
    },
  });

  useEffect(() => {
    fetchItems();
    fetchDistricts();
  }, [contentType]);

  const fetchDistricts = async () => {
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("Error fetching districts:", error);
    } else {
      setDistricts(data || []);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_items")
      .select("*, districts(name)")
      .eq("type", contentType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: ContentFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Authentication required");
      return;
    }

    let parsedMetaJson = {};
    if (data.meta_json) {
      try {
        parsedMetaJson = JSON.parse(data.meta_json);
      } catch (e) {
        toast.error("Invalid JSON in meta fields");
        return;
      }
    }

    const contentData: any = {
      type: contentType,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      body: data.body,
      main_image_url: data.main_image_url || null,
      status: data.status,
      author_id: user.id,
      district_id: data.district_id && data.district_id !== "none" ? data.district_id : null,
      meta_json: parsedMetaJson,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("content_items")
        .update(contentData)
        .eq("id", editingItem.id);

      if (error) {
        console.error("Update error:", error);
        toast.error(`Failed to update: ${error.message || error.code || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("Content updated successfully");
        fetchItems();
        setDialogOpen(false);
        setEditingItem(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("content_items").insert(contentData);

      if (error) {
        console.error("Insert error:", error);
        toast.error(`Failed to create: ${error.message || error.code || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("Content created successfully");
        fetchItems();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      body: item.body || "",
      main_image_url: item.main_image_url || "",
      status: item.status as "draft" | "published",
      district_id: (item as any).district_id || "",
      meta_json: JSON.stringify(item.meta_json || {}, null, 2),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    const { error } = await supabase.from("content_items").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete content");
    } else {
      toast.success("Content deleted successfully");
      fetchItems();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesDistrict = districtFilter === "all" || 
      (districtFilter === "none" && !(item as any).district_id) ||
      (item as any).district_id === districtFilter;
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  form.reset();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Content" : "Create New Content"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* District Selector - Prominent at Top */}
                  <FormField
                    control={form.control}
                    name="district_id"
                    render={({ field }) => (
                      <FormItem className="bg-secondary/30 p-4 rounded-lg border">
                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                          <MapPin className="h-4 w-4" />
                          Associated District
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a district (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">General Uttarakhand (No specific district)</SelectItem>
                            {districts.map((district) => (
                              <SelectItem key={district.id} value={district.id}>
                                {district.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Link this content to a specific district for the hub-and-spoke navigation
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (!editingItem) {
                                  form.setValue("slug", generateSlug(e.target.value));
                                }
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Short summary..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Body *</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Write your content here..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="main_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <ImageUpload
                          label="Featured Image"
                          value={field.value || ""}
                          onChange={field.onChange}
                          id="content-image"
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

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="none">No District</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No content found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[250px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          {item.districts?.name ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <MapPin className="h-3 w-3" />
                              {item.districts.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">General</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === "published" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}