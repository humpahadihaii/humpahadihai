import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, FolderOpen, Search, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  useContentCategories,
  useContentCategoryMutations,
  ContentCategory,
} from '@/hooks/useCulturalContent';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

const CATEGORY_ICONS = [
  { value: 'utensils', label: 'Food' },
  { value: 'temple', label: 'Temple' },
  { value: 'palette', label: 'Culture' },
  { value: 'calendar', label: 'Festival' },
  { value: 'shirt', label: 'Clothing' },
  { value: 'languages', label: 'Language' },
  { value: 'hand-heart', label: 'Handicrafts' },
  { value: 'home', label: 'Village' },
  { value: 'mountain', label: 'Nature' },
  { value: 'shopping-bag', label: 'Market' },
  { value: 'book', label: 'History' },
  { value: 'folder', label: 'General' },
];

export default function AdminCulturalCategoriesPage() {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ContentCategory | null>(null);

  // Fetch districts
  const { data: districts = [] } = useQuery({
    queryKey: ['districts-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading } = useContentCategories(
    selectedDistrictId || undefined
  );

  const { createCategory, updateCategory, deleteCategory } = useContentCategoryMutations();

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      district_id: formData.get('district_id') as string,
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
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...data });
        toast.success('Category updated successfully');
      } else {
        await createCategory.mutateAsync(data);
        toast.success('Category created successfully');
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Category deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: ContentCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cultural Categories</h1>
            <p className="text-muted-foreground">
              Manage content categories like Food, Temples, Culture, etc.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedDistrictId} onValueChange={setSelectedDistrictId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
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
                  <TableHead className="hidden md:table-cell">District</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => {
                    const district = districts.find((d) => d.id === category.district_id);
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {district?.name || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">-</TableCell>
                        <TableCell>
                          <Badge
                            variant={category.status === 'published' ? 'default' : 'secondary'}
                          >
                            {category.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/cultural-categories/${category.id}/subcategories`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district_id">District *</Label>
                  <Select
                    name="district_id"
                    defaultValue={editingCategory?.district_id || ''}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCategory?.name || ''}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select name="icon" defaultValue={editingCategory?.icon || 'folder'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_ICONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingCategory?.status || 'draft'}>
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
                  defaultValue={editingCategory?.description || ''}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Hero Image</Label>
                <ImageUpload
                  onUpload={(url) => {
                    const input = document.querySelector(
                      'input[name="hero_image"]'
                    ) as HTMLInputElement;
                    if (input) input.value = url;
                  }}
                  currentImage={editingCategory?.hero_image || undefined}
                />
                <input
                  type="hidden"
                  name="hero_image"
                  defaultValue={editingCategory?.hero_image || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={editingCategory?.sort_order || 0}
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
                      defaultValue={editingCategory?.seo_title || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      name="seo_description"
                      defaultValue={editingCategory?.seo_description || ''}
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
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
