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
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Database } from "@/integrations/supabase/types";

type District = Database["public"]["Tables"]["districts"]["Row"];
type DistrictContent = Database["public"]["Tables"]["district_content"]["Row"];

const itemSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image_url: z.string().optional(),
  google_map_link: z.string().optional(),
});

const contentSchema = z.object({
  district_id: z.string().min(1, "Please select a district"),
  category: z.enum(["Festival", "Food", "Place", "Culture"]),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type ContentFormData = z.infer<typeof contentSchema>;

export default function AdminDistrictContentPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [contents, setContents] = useState<DistrictContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<DistrictContent | null>(null);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      district_id: "",
      category: "Place",
      items: [{ title: "", description: "", image_url: "", google_map_link: "" }],
    },
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      fetchContents();
    }
  }, [selectedDistrictId]);

  const fetchDistricts = async () => {
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch districts");
    } else {
      setDistricts(data || []);
    }
  };

  const fetchContents = async () => {
    if (!selectedDistrictId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("district_content")
      .select("*")
      .eq("district_id", selectedDistrictId)
      .order("category", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      toast.error("Failed to fetch content");
    } else {
      setContents(data || []);
    }
    setLoading(false);
  };

  const onSubmit = async (data: ContentFormData) => {
    if (editingContent) {
      // Single item update
      const insertData = {
        district_id: data.district_id,
        category: data.category,
        title: data.items[0].title,
        description: data.items[0].description,
        image_url: data.items[0].image_url || null,
        google_map_link: data.items[0].google_map_link || null,
      };

      const { error } = await supabase
        .from("district_content")
        .update(insertData)
        .eq("id", editingContent.id);

      if (error) {
        toast.error("Failed to update content");
      } else {
        toast.success("Content updated successfully");
        fetchContents();
        setDialogOpen(false);
        setEditingContent(null);
        form.reset();
      }
    } else {
      // Bulk insert
      const insertData = data.items.map(item => ({
        district_id: data.district_id,
        category: data.category,
        title: item.title,
        description: item.description,
        image_url: item.image_url || null,
        google_map_link: item.google_map_link || null,
      }));

      const { error } = await supabase
        .from("district_content")
        .insert(insertData);

      if (error) {
        toast.error("Failed to create content");
      } else {
        const districtName = districts.find(d => d.id === data.district_id)?.name || "district";
        toast.success(`Successfully added ${data.items.length} item${data.items.length > 1 ? 's' : ''} to ${districtName}!`);
        fetchContents();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (content: DistrictContent) => {
    setEditingContent(content);
    form.reset({
      district_id: content.district_id,
      category: content.category as "Festival" | "Food" | "Place" | "Culture",
      items: [{
        title: content.title,
        description: content.description,
        image_url: content.image_url || "",
        google_map_link: content.google_map_link || "",
      }],
    });
    setDialogOpen(true);
  };

  const addNewItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, { title: "", description: "", image_url: "", google_map_link: "" }]);
    // Scroll to bottom after adding item
    setTimeout(() => {
      const scrollContainer = document.querySelector('[data-scroll-container]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 100);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    const { error } = await supabase
      .from("district_content")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete content");
    } else {
      toast.success("Content deleted successfully");
      fetchContents();
    }
  };

  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">District Content Manager</h1>
            <p className="text-muted-foreground">Manage festivals, food, places, and culture for each district</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select District</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDistrictId} onValueChange={setSelectedDistrictId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a district..." />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedDistrictId && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Content for {selectedDistrict?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {contents.length} items
                  </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { 
                      setEditingContent(null); 
                      form.reset({
                        district_id: selectedDistrictId,
                        category: "Place",
                        items: [{ title: "", description: "", image_url: "", google_map_link: "" }],
                      }); 
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>{editingContent ? "Edit Content" : "Add New Content (Bulk Entry)"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                        {/* Top Section: District & Category */}
                        <div className="space-y-4 pb-4 border-b">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category (applies to all items) *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Festival">Festival</SelectItem>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Place">Place</SelectItem>
                                    <SelectItem value="Culture">Culture</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Middle Section: Scrollable Item Cards */}
                        <div data-scroll-container className="flex-1 overflow-y-auto py-4 space-y-6 max-h-[50vh]">
                          {form.watch("items").map((_, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-4 relative">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Item {index + 1}</h4>
                                {form.watch("items").length > 1 && !editingContent && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <FormField
                                control={form.control}
                                name={`items.${index}.title`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title *</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="e.g., Jageshwar Temple" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`items.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={3} placeholder="Detailed description..." />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`items.${index}.image_url`}
                                render={({ field }) => (
                                  <FormItem>
                                    <ImageUpload
                                      label="Image"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      id={`content-image-${index}`}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`items.${index}.google_map_link`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Google Maps Link</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://maps.google.com/..." />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}

                          {!editingContent && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addNewItem}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Another Item
                            </Button>
                          )}
                        </div>

                        {/* Bottom Section: Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingContent ? "Update" : `Save All Items (${form.watch("items").length})`}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : contents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No content yet. Click "Add Item" to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Image</TableHead>
                      <TableHead className="text-center">Map</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell>
                          <Badge variant="outline">{content.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{content.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{content.description}</TableCell>
                        <TableCell className="text-center">
                          {content.image_url ? "✓" : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {content.google_map_link ? (
                            <MapPin className="h-4 w-4 inline text-primary" />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(content)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(content.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
    </AdminLayout>
  );
}
