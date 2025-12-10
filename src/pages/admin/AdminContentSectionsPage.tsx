import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Search, Upload, GripVertical } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import Papa from "papaparse";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

const sectionSchema = z.object({
  slug: z.string().min(2, "Slug required"),
  title: z.string().min(2, "Title required"),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  section_image: z.string().optional(),
  display_order: z.number().min(0),
  is_published: z.boolean(),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface ContentSection {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  section_image?: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export default function AdminContentSectionsPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const { logCreate, logUpdate, logDelete } = useAdminActivityLogger();

  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      slug: "",
      title: "",
      subtitle: "",
      body: "",
      section_image: "",
      display_order: 0,
      is_published: true,
    },
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_content_sections")
      .select("*")
      .order("display_order");

    if (error) {
      toast.error("Failed to fetch content sections");
    } else {
      setSections(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: SectionFormData) => {
    const sectionData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (editingSection) {
      const { error } = await supabase
        .from("cms_content_sections")
        .update(sectionData)
        .eq("id", editingSection.id);

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
      } else {
        toast.success("Section updated successfully");
        logUpdate("content_section", editingSection.id, data.title);
        fetchSections();
        setDialogOpen(false);
        setEditingSection(null);
        form.reset();
      }
    } else {
      const { data: inserted, error } = await supabase.from("cms_content_sections").insert([sectionData]).select();

      if (error) {
        toast.error(`Failed to create: ${error.message}`);
      } else {
        toast.success("Section created successfully");
        if (inserted?.[0]) logCreate("content_section", inserted[0].id, data.title);
        fetchSections();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (section: ContentSection) => {
    setEditingSection(section);
    form.reset({
      slug: section.slug,
      title: section.title,
      subtitle: section.subtitle || "",
      body: section.body || "",
      section_image: section.section_image || "",
      display_order: section.display_order,
      is_published: section.is_published,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    const { error } = await supabase.from("cms_content_sections").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete section");
    } else {
      toast.success("Section deleted");
      logDelete("content_section", id, title);
      fetchSections();
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = results.data as Record<string, string>[];
        const validRows = rows.filter(row => row.slug && row.title);
        
        if (validRows.length === 0) {
          toast.error("No valid rows found in CSV");
          return;
        }

        const sectionsToInsert = validRows.map((row, index) => ({
          slug: row.slug || generateSlug(row.title),
          title: row.title,
          subtitle: row.subtitle || null,
          body: row.body || null,
          section_image: row.section_image || null,
          display_order: parseInt(row.display_order) || (sections.length + index),
          is_published: row.is_published !== "false",
        }));

        const { error } = await supabase.from("cms_content_sections").insert(sectionsToInsert);

        if (error) {
          toast.error(`Import failed: ${error.message}`);
        } else {
          toast.success(`Imported ${sectionsToInsert.length} content sections`);
          fetchSections();
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const filteredSections = sections.filter((section) =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Sections</h1>
            <p className="text-muted-foreground">Manage homepage and static content sections</p>
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
                <Button onClick={() => { 
                  setEditingSection(null); 
                  form.reset({
                    slug: "",
                    title: "",
                    subtitle: "",
                    body: "",
                    section_image: "",
                    display_order: sections.length,
                    is_published: true,
                  }); 
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingSection ? "Edit Content Section" : "Add Content Section"}</DialogTitle>
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
                                  if (!editingSection) {
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
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="display_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_published"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 pt-8">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Published</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="section_image"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Section Image"
                            value={field.value || ""}
                            onChange={field.onChange}
                            id="section-image"
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
                        {editingSection ? "Update" : "Create"}
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
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 max-w-sm"
              />
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
                      <TableHead className="w-[60px]">Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span>{section.display_order}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{section.title}</p>
                            {section.subtitle && (
                              <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {section.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={section.is_published ? "default" : "outline"}>
                            {section.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(section)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id, section.title)}>
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
