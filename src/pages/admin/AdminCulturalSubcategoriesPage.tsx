import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, FolderOpen, Search, Eye, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  useContentSubcategories,
  useContentSubcategoryMutations,
  ContentSubcategory,
} from '@/hooks/useCulturalContent';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

export default function AdminCulturalSubcategoriesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<ContentSubcategory | null>(null);

  // Fetch parent category
  const { data: category } = useQuery({
    queryKey: ['content-category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*, districts(name)')
        .eq('id', categoryId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });

  // Fetch subcategories
  const { data: subcategories = [], isLoading } = useContentSubcategories(categoryId);

  const { createSubcategory, updateSubcategory, deleteSubcategory } =
    useContentSubcategoryMutations();

  const filteredSubcategories = subcategories.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      category_id: categoryId!,
      name: formData.get('name') as string,
      slug: (formData.get('name') as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      hero_image: formData.get('hero_image') as string,
      status: formData.get('status') as string,
      seo_title: formData.get('seo_title') as string,
      seo_description: formData.get('seo_description') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    try {
      if (editingSubcategory) {
        await updateSubcategory.mutateAsync({ id: editingSubcategory.id, ...data });
        toast.success('Subcategory updated successfully');
      } else {
        await createSubcategory.mutateAsync(data);
        toast.success('Subcategory created successfully');
      }
      setIsDialogOpen(false);
      setEditingSubcategory(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save subcategory');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await deleteSubcategory.mutateAsync(id);
      toast.success('Subcategory deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subcategory');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/cultural-categories">Categories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category?.name || 'Loading...'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" asChild className="p-0">
                <Link to="/admin/cultural-categories">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold">
              {category?.name} - Subcategories
            </h1>
            <p className="text-muted-foreground">
              District: {(category as any)?.districts?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/admin/cultural-categories/${categoryId}/content`}>
                View All Content
              </Link>
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subcategories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredSubcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No subcategories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubcategories.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{sub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {sub.description ? (
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {sub.description}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.status === 'published' ? 'default' : 'secondary'}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/admin/cultural-categories/${categoryId}/subcategories/${sub.id}/content`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSubcategory(sub);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sub.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Edit Subcategory' : 'Create Subcategory'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subcategory Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingSubcategory?.name || ''}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingSubcategory?.status || 'draft'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingSubcategory?.description || ''}
                  rows={3}
                />
              </div>

              <ImageUpload
                label="Hero Image"
                id="hero_image"
                value={editingSubcategory?.hero_image || ""}
                onChange={(url) => {
                  setEditingSubcategory(prev => prev ? { ...prev, hero_image: url } : null);
                }}
              />
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={editingSubcategory?.sort_order || 0}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">SEO Settings</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      name="seo_title"
                      defaultValue={editingSubcategory?.seo_title || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      name="seo_description"
                      defaultValue={editingSubcategory?.seo_description || ''}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSubcategory.isPending || updateSubcategory.isPending}
                >
                  {editingSubcategory ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
