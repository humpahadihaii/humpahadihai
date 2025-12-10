import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { galleryExcelConfig } from "@/lib/excelConfigs";

const gallerySchema = z.object({
  title: z.string().min(2, "Title required"),
  description: z.string().optional(),
  image_url: z.string().min(1, "Image URL required"),
  category: z.string().min(1, "Category required"),
});

type GalleryFormData = z.infer<typeof gallerySchema>;

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  category: string;
  created_at: string;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const excel = useExcelOperations(galleryExcelConfig);

  const form = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      category: "",
    },
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch gallery items");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const onSubmit = async (data: GalleryFormData) => {
    const galleryData: any = {
      title: data.title,
      description: data.description || null,
      image_url: data.image_url,
      category: data.category,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("gallery_items")
        .update(galleryData)
        .eq("id", editingItem.id);

      if (error) {
        console.error("Gallery update error:", error);
        toast.error(`Failed to update: ${error.message || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("Item updated successfully");
        fetchItems();
        setDialogOpen(false);
        setEditingItem(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("gallery_items").insert([galleryData]);

      if (error) {
        console.error("Gallery insert error:", error);
        toast.error(`Failed to create: ${error.message || 'Unknown error'}`, {
          description: error.details || error.hint,
        });
      } else {
        toast.success("Item created successfully");
        fetchItems();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url,
      category: item.category,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete item");
    } else {
      toast.success("Item deleted");
      fetchItems();
    }
  };

  const categories = Array.from(new Set(items.map(item => item.category)));
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gallery Management</h1>
            <p className="text-muted-foreground">Manage gallery images and media</p>
          </div>
          <div className="flex gap-2">
            <ExcelImportExportButtons
              onExport={() => excel.exportToExcel(filteredItems)}
              onImportClick={() => setImportOpen(true)}
              exporting={excel.exporting}
              importing={excel.importing}
            />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingItem(null); form.reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Image" : "Add New Image"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          label="Gallery Image *"
                          value={field.value || ""}
                          onChange={field.onChange}
                          id="gallery-image"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Culture, Nature, Festival" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingItem ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gallery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id}>
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
