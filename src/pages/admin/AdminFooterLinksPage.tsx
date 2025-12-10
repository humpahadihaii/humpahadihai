import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, GripVertical, ExternalLink, Link } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useExcelOperations } from "@/hooks/useExcelOperations";
import { ExcelImportExportButtons } from "@/components/admin/ExcelImportExportButtons";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { footerLinksExcelConfig } from "@/lib/excelConfigs";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

const footerLinkSchema = z.object({
  label: z.string().min(1, "Label required"),
  page_slug: z.string().optional(),
  url: z.string().optional(),
  is_external: z.boolean(),
  display_order: z.number().min(0),
});

type FooterLinkFormData = z.infer<typeof footerLinkSchema>;

interface FooterLink {
  id: string;
  label: string;
  page_slug?: string | null;
  url?: string | null;
  is_external: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminFooterLinksPage() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const excel = useExcelOperations(footerLinksExcelConfig);
  const { logCreate, logUpdate, logDelete } = useAdminActivityLogger();

  const form = useForm<FooterLinkFormData>({
    resolver: zodResolver(footerLinkSchema),
    defaultValues: {
      label: "",
      page_slug: "",
      url: "",
      is_external: false,
      display_order: 0,
    },
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_footer_links")
      .select("*")
      .order("display_order");

    if (error) {
      toast.error("Failed to fetch footer links");
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  const onSubmit = async (data: FooterLinkFormData) => {
    const linkData: any = {
      label: data.label,
      page_slug: data.is_external ? null : (data.page_slug || null),
      url: data.is_external ? (data.url || null) : null,
      is_external: data.is_external,
      display_order: data.display_order,
    };

    if (editingLink) {
      const { error } = await supabase
        .from("cms_footer_links")
        .update(linkData)
        .eq("id", editingLink.id);

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
      } else {
        toast.success("Link updated successfully");
        fetchLinks();
        setDialogOpen(false);
        setEditingLink(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("cms_footer_links").insert([linkData]);

      if (error) {
        toast.error(`Failed to create: ${error.message}`);
      } else {
        toast.success("Link created successfully");
        fetchLinks();
        setDialogOpen(false);
        form.reset();
      }
    }
  };

  const handleEdit = (link: FooterLink) => {
    setEditingLink(link);
    form.reset({
      label: link.label,
      page_slug: link.page_slug || "",
      url: link.url || "",
      is_external: link.is_external,
      display_order: link.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    const { error } = await supabase.from("cms_footer_links").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete link");
    } else {
      toast.success("Link deleted");
      fetchLinks();
    }
  };

  const isExternal = form.watch("is_external");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Footer Links</h1>
            <p className="text-muted-foreground">Manage footer navigation links</p>
          </div>
          <div className="flex gap-2">
            <ExcelImportExportButtons
              onExport={() => excel.exportToExcel(links)}
              onImportClick={() => setImportOpen(true)}
              exporting={excel.exporting}
              importing={excel.importing}
            />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { 
                  setEditingLink(null); 
                  form.reset({
                    label: "",
                    page_slug: "",
                    url: "",
                    is_external: false,
                    display_order: links.length,
                  }); 
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingLink ? "Edit Footer Link" : "Add Footer Link"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Privacy Policy" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_external"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">External Link</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isExternal ? (
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>External URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="page_slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Slug</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., privacy-policy" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

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

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingLink ? "Update" : "Create"}
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
            <CardTitle>Footer Links</CardTitle>
            <CardDescription>Links are displayed in order by display_order value</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No footer links yet. Add your first link above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Order</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span>{link.display_order}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{link.label}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {link.is_external ? link.url : `/${link.page_slug}`}
                        </code>
                      </TableCell>
                      <TableCell>
                        {link.is_external ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            External
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Link className="h-3 w-3" />
                            Internal
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(link)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}>
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
      </div>
    </AdminLayout>
  );
}
