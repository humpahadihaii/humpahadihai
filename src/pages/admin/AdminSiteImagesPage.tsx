import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Search, Info } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";
import { Badge } from "@/components/ui/badge";

// Predefined image slots - these map directly to frontend usage
const IMAGE_SLOTS = [
  { key: "hero_banner", label: "Homepage Hero Banner", description: "Main hero image on homepage" },
  { key: "site_logo", label: "Site Logo", description: "Navigation and branding logo" },
  { key: "about_section_image", label: "About Section Image", description: "Image on About page" },
  { key: "culture_hero", label: "Culture Page Hero", description: "Hero background for Culture page" },
  { key: "food_hero", label: "Food Page Hero", description: "Hero background for Food page" },
  { key: "travel_hero", label: "Travel Page Hero", description: "Hero background for Travel page" },
  { key: "thoughts_hero", label: "Thoughts Page Hero", description: "Hero background for Thoughts page" },
  { key: "districts_hero", label: "Districts Page Hero", description: "Hero background for Districts page" },
  { key: "gallery_hero", label: "Gallery Page Hero", description: "Hero background for Gallery page" },
  { key: "marketplace_hero", label: "Marketplace Page Hero", description: "Hero background for Marketplace page" },
  { key: "instagram_cta_background", label: "Instagram CTA Background", description: "Background for social CTA section" },
  { key: "footer_background", label: "Footer Background", description: "Background pattern for footer" },
] as const;

const siteImageSchema = z.object({
  key: z.string().min(1, "Image slot required"),
  title: z.string().min(2, "Title required"),
  description: z.string().optional(),
  image_url: z.string().min(1, "Image URL required"),
});

type SiteImageFormData = z.infer<typeof siteImageSchema>;

interface SiteImage {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  image_url: string;
  category?: string | null;
  created_at: string;
}

export default function AdminSiteImagesPage() {
  const [items, setItems] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SiteImage | null>(null);
  const { logCreate, logUpdate, logDelete } = useAdminActivityLogger();

  const form = useForm<SiteImageFormData>({
    resolver: zodResolver(siteImageSchema),
    defaultValues: {
      key: "",
      title: "",
      description: "",
      image_url: "",
    },
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch site images");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const onSubmit = async (data: SiteImageFormData) => {
    // Include category as 'slot' for database compatibility
    const imageData = {
      key: data.key,
      title: data.title,
      description: data.description || null,
      image_url: data.image_url,
      category: "slot", // Required by DB schema, using fixed value
    };

    if (editingItem) {
      const { error } = await supabase
        .from("site_images")
        .update(imageData)
        .eq("id", editingItem.id);

      if (error) {
        toast.error("Failed to update image");
      } else {
        toast.success("Image updated successfully");
        logUpdate("site_image", editingItem.id, data.title);
        fetchItems();
        setDialogOpen(false);
        setEditingItem(null);
        form.reset();
      }
    } else {
      const { data: inserted, error } = await supabase.from("site_images").insert([imageData]).select();

      if (error) {
        if (error.code === '23505') {
          toast.error("This image slot already has an image. Edit the existing one instead.");
        } else {
          toast.error("Failed to create image");
        }
      } else {
        toast.success("Image created successfully");
        if (inserted?.[0]) logCreate("site_image", inserted[0].id, data.title);
        fetchItems();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (item: SiteImage) => {
    setEditingItem(item);
    form.reset({
      key: item.key,
      title: item.title,
      description: item.description || "",
      image_url: item.image_url,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("site_images").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete image");
    } else {
      toast.success("Image deleted");
      logDelete("site_image", id, title);
      fetchItems();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.key.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get available slots (not yet used)
  const usedKeys = new Set(items.map(i => i.key));
  const availableSlots = IMAGE_SLOTS.filter(slot => !usedKeys.has(slot.key));
  
  const getSlotInfo = (key: string) => IMAGE_SLOTS.find(s => s.key === key);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Site Images</h1>
            <p className="text-muted-foreground">
              Upload images for specific page locations. Each slot can have one image.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setEditingItem(null); form.reset(); }}
                disabled={availableSlots.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Site Image" : "Add New Site Image"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Slot *</FormLabel>
                        {editingItem ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono">
                              {field.value}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {getSlotInfo(field.value)?.label}
                            </span>
                          </div>
                        ) : (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select where this image will appear" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableSlots.map((slot) => (
                                <SelectItem key={slot.key} value={slot.key}>
                                  <div className="flex flex-col">
                                    <span>{slot.label}</span>
                                    <span className="text-xs text-muted-foreground">{slot.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormDescription>
                          This determines where the image will appear on the website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Descriptive name for this image" />
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
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} placeholder="Notes about this image" />
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
                          label="Image *"
                          value={field.value || ""}
                          onChange={field.onChange}
                          id="site-image"
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
                      {editingItem ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info box about available slots */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Available Image Slots</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {availableSlots.length > 0 
                    ? `${availableSlots.length} slot(s) available: ${availableSlots.map(s => s.label).join(", ")}`
                    : "All image slots are filled. Edit existing images to change them."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search site images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No images uploaded yet. Click "Add Image" to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const slotInfo = getSlotInfo(item.key);
                  return (
                    <Card key={item.id}>
                      <div className="h-48 overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant="outline" className="font-mono text-xs mt-1">
                            {item.key}
                          </Badge>
                          {slotInfo && (
                            <p className="text-xs text-muted-foreground mt-1">{slotInfo.description}</p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.title)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
