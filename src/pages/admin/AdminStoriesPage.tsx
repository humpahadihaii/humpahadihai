import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Search, Upload, Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { AIContentButtons } from "@/components/admin/AIContentButtons";
import { RichTextEditor } from "@/components/RichTextEditor";
import Papa from "papaparse";
import { format } from "date-fns";

const storySchema = z.object({
  title: z.string().min(2, "Title required"),
  slug: z.string().min(2, "Slug required"),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  cover_image_url: z.string().optional(),
  category: z.string().min(1, "Category required"),
  author_name: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type StoryFormData = z.infer<typeof storySchema>;

interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  cover_image_url?: string | null;
  category: string;
  author_name?: string | null;
  status: string;
  published_at?: string | null;
  created_at: string;
}

const CATEGORIES = ["Culture", "Food", "History", "Festival", "Travel", "Tradition"];

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      cover_image_url: "",
      category: "Culture",
      author_name: "",
      status: "draft",
    },
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch stories");
    } else {
      setStories(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: StoryFormData) => {
    const storyData: any = {
      ...data,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };

    if (editingStory) {
      const { error } = await supabase
        .from("cms_stories")
        .update(storyData)
        .eq("id", editingStory.id);

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
      } else {
        toast.success("Story updated successfully");
        fetchStories();
        setDialogOpen(false);
        setEditingStory(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("cms_stories").insert([storyData]);

      if (error) {
        toast.error(`Failed to create: ${error.message}`);
      } else {
        toast.success("Story created successfully");
        fetchStories();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    form.reset({
      title: story.title,
      slug: story.slug,
      excerpt: story.excerpt || "",
      body: story.body || "",
      cover_image_url: story.cover_image_url || "",
      category: story.category,
      author_name: story.author_name || "",
      status: story.status as "draft" | "published",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    const { error } = await supabase.from("cms_stories").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete story");
    } else {
      toast.success("Story deleted");
      fetchStories();
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = results.data as Record<string, string>[];
        const validRows = rows.filter(row => row.title && row.slug);
        
        if (validRows.length === 0) {
          toast.error("No valid rows found in CSV");
          return;
        }

        const storiesToInsert = validRows.map(row => ({
          title: row.title,
          slug: row.slug || generateSlug(row.title),
          excerpt: row.excerpt || null,
          body: row.body || null,
          cover_image_url: row.cover_image_url || null,
          category: row.category || "Culture",
          author_name: row.author_name || null,
          status: row.status === "published" ? "published" : "draft",
          published_at: row.status === "published" ? new Date().toISOString() : null,
        }));

        const { error } = await supabase.from("cms_stories").insert(storiesToInsert);

        if (error) {
          toast.error(`Import failed: ${error.message}`);
        } else {
          toast.success(`Imported ${storiesToInsert.length} stories`);
          fetchStories();
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const filteredStories = stories.filter((story) => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || story.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || story.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Stories Management</h1>
            <p className="text-muted-foreground">Manage blog posts and articles</p>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <Input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </span>
              </Button>
            </label>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingStory(null); form.reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{editingStory ? "Edit Story" : "Add New Story"}</DialogTitle>
                    <AIContentButtons
                      type="story"
                      currentContent={{
                        title: form.watch("title") || "",
                        body: form.watch("body") || "",
                        excerpt: form.watch("excerpt") || "",
                      }}
                      onContentGenerated={(content) => {
                        if (content.title) form.setValue("title", content.title);
                        if (content.excerpt) form.setValue("excerpt", content.excerpt);
                        if (content.body) form.setValue("body", content.body);
                        if (content.tags) {
                          // Could set category based on tags
                        }
                        if (!form.watch("slug") && content.title) {
                          form.setValue("slug", generateSlug(content.title));
                        }
                      }}
                    />
                  </div>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  if (!editingStory) {
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="author_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Author Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Status *</FormLabel>
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
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} placeholder="Short summary..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cover_image_url"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Cover Image"
                            value={field.value || ""}
                            onChange={field.onChange}
                            id="story-cover"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
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
                        {editingStory ? "Update" : "Create"}
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStories.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {story.cover_image_url && (
                              <img
                                src={story.cover_image_url}
                                alt={story.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{story.title}</p>
                              <p className="text-xs text-muted-foreground">/{story.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{story.category}</Badge>
                        </TableCell>
                        <TableCell>{story.author_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={story.status === "published" ? "default" : "outline"}>
                            {story.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(story.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {story.status === "published" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                              >
                                <a href={`/stories/${story.slug}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(story)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(story.id)}>
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
