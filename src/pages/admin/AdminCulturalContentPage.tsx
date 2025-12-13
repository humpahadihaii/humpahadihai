import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Pencil, Trash2, Search, Eye, ArrowLeft, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  useCulturalContents,
  useCulturalContentMutations,
  useContentSubcategories,
  CulturalContent,
} from '@/hooks/useCulturalContent';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

export default function AdminCulturalContentPage() {
  const { categoryId, subcategoryId } = useParams<{
    categoryId: string;
    subcategoryId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CulturalContent | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch parent category
  const { data: category } = useQuery({
    queryKey: ['content-category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*, districts(id, name, slug)')
        .eq('id', categoryId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });

  // Fetch subcategory if provided
  const { data: subcategory } = useQuery({
    queryKey: ['content-subcategory', subcategoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_subcategories')
        .select('*')
        .eq('id', subcategoryId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!subcategoryId,
  });

  // Fetch all subcategories for the dropdown
  const { data: subcategories = [] } = useContentSubcategories(categoryId);

  // Fetch content
  const { data: contents = [], isLoading } = useCulturalContents({
    categoryId,
    subcategoryId,
  });

  const { createContent, updateContent, deleteContent } = useCulturalContentMutations();

  const filteredContents = contents.filter((content) =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: Partial<CulturalContent> = {
      district_id: category?.district_id,
      category_id: categoryId!,
      subcategory_id: (formData.get('subcategory_id') as string) || null,
      title: formData.get('title') as string,
      slug: (formData.get('title') as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      short_intro: formData.get('short_intro') as string,
      hero_image: formData.get('hero_image') as string,
      cultural_significance: formData.get('cultural_significance') as string,
      origin_history: formData.get('origin_history') as string,
      preparation_method: formData.get('preparation_method') as string,
      taste_description: formData.get('taste_description') as string,
      consumption_occasions: formData.get('consumption_occasions') as string,
      shelf_life_tips: formData.get('shelf_life_tips') as string,
      price_range: formData.get('price_range') as string,
      dos_and_donts: formData.get('dos_and_donts') as string,
      fun_facts: formData.get('fun_facts') as string,
      timings: formData.get('timings') as string,
      entry_fee: formData.get('entry_fee') as string,
      local_customs: formData.get('local_customs') as string,
      historical_significance: formData.get('historical_significance') as string,
      spiritual_significance: formData.get('spiritual_significance') as string,
      google_maps_url: formData.get('google_maps_url') as string,
      is_featured: formData.get('is_featured') === 'true',
      status: formData.get('status') as string,
      seo_title: formData.get('seo_title') as string,
      seo_description: formData.get('seo_description') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    // Parse ingredients if provided
    const ingredientsRaw = formData.get('ingredients') as string;
    if (ingredientsRaw) {
      try {
        data.ingredients = ingredientsRaw.split('\n').filter((i) => i.trim());
      } catch {
        data.ingredients = null;
      }
    }

    // Parse things to do
    const thingsToDoRaw = formData.get('things_to_do') as string;
    if (thingsToDoRaw) {
      data.things_to_do = thingsToDoRaw.split('\n').filter((t) => t.trim());
    }

    // Parse FAQs
    const faqsRaw = formData.get('faqs') as string;
    if (faqsRaw) {
      try {
        const lines = faqsRaw.split('\n').filter((l) => l.trim());
        data.faqs = lines.map((line) => {
          const [question, answer] = line.split('|');
          return { question: question?.trim(), answer: answer?.trim() };
        });
      } catch {
        data.faqs = null;
      }
    }

    try {
      if (editingContent) {
        await updateContent.mutateAsync({ id: editingContent.id, ...data });
        toast.success('Content updated successfully');
      } else {
        await createContent.mutateAsync(data);
        toast.success('Content created successfully');
      }
      setIsDialogOpen(false);
      setEditingContent(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await deleteContent.mutateAsync(id);
      toast.success('Content deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete content');
    }
  };

  const districtSlug = (category as any)?.districts?.slug;

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
              <BreadcrumbLink asChild>
                <Link to={`/admin/cultural-categories/${categoryId}/subcategories`}>
                  {category?.name || 'Loading...'}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {subcategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{subcategory.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" asChild className="p-0">
                <Link
                  to={
                    subcategoryId
                      ? `/admin/cultural-categories/${categoryId}/subcategories`
                      : '/admin/cultural-categories'
                  }
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold">
              {subcategory ? `${subcategory.name} - Content` : `${category?.name} - All Content`}
            </h1>
            <p className="text-muted-foreground">
              District: {(category as any)?.districts?.name}
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
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
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Subcategory</TableHead>
                  <TableHead className="hidden md:table-cell">Featured</TableHead>
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
                ) : filteredContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No content found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContents.map((content) => {
                    const subcat = subcategories.find((s) => s.id === content.subcategory_id);
                    return (
                      <TableRow key={content.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {content.hero_image && (
                              <img
                                src={content.hero_image}
                                alt=""
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{content.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {subcat?.name || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {content.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={content.status === 'published' ? 'default' : 'secondary'}
                          >
                            {content.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {districtSlug && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link
                                  to={`/uttarakhand/${districtSlug}/${category?.slug}/${subcat?.slug || 'all'}/${content.slug}`}
                                  target="_blank"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingContent(content);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(content.id)}
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContent ? 'Edit Content' : 'Create Content'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingContent?.title || ''}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory_id">Subcategory</Label>
                      <Select
                        name="subcategory_id"
                        defaultValue={editingContent?.subcategory_id || subcategoryId || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingContent?.status || 'draft'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="is_featured">Featured</Label>
                      <Select
                        name="is_featured"
                        defaultValue={editingContent?.is_featured ? 'true' : 'false'}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short_intro">Short Introduction</Label>
                    <Textarea
                      id="short_intro"
                      name="short_intro"
                      defaultValue={editingContent?.short_intro || ''}
                      rows={2}
                    />
                  </div>

                  <ImageUpload
                    label="Hero Image"
                    id="hero_image"
                    value={editingContent?.hero_image || ""}
                    onChange={(url) => {
                      setEditingContent(prev => prev ? { ...prev, hero_image: url } : null);
                    }}
                  />
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cultural_significance">Cultural Significance</Label>
                    <Textarea
                      id="cultural_significance"
                      name="cultural_significance"
                      defaultValue={editingContent?.cultural_significance || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin_history">Origin & History</Label>
                    <Textarea
                      id="origin_history"
                      name="origin_history"
                      defaultValue={editingContent?.origin_history || ''}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                      <Textarea
                        id="ingredients"
                        name="ingredients"
                        defaultValue={
                          Array.isArray(editingContent?.ingredients)
                            ? editingContent.ingredients.join('\n')
                            : ''
                        }
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="things_to_do">Things to Do (one per line)</Label>
                      <Textarea
                        id="things_to_do"
                        name="things_to_do"
                        defaultValue={editingContent?.things_to_do?.join('\n') || ''}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparation_method">Preparation Method</Label>
                    <Textarea
                      id="preparation_method"
                      name="preparation_method"
                      defaultValue={editingContent?.preparation_method || ''}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taste_description">Taste & Texture</Label>
                      <Textarea
                        id="taste_description"
                        name="taste_description"
                        defaultValue={editingContent?.taste_description || ''}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consumption_occasions">Consumption Occasions</Label>
                      <Textarea
                        id="consumption_occasions"
                        name="consumption_occasions"
                        defaultValue={editingContent?.consumption_occasions || ''}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shelf_life_tips">Shelf Life & Travel Tips</Label>
                      <Textarea
                        id="shelf_life_tips"
                        name="shelf_life_tips"
                        defaultValue={editingContent?.shelf_life_tips || ''}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_range">Price Range</Label>
                      <Input
                        id="price_range"
                        name="price_range"
                        defaultValue={editingContent?.price_range || ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dos_and_donts">Do's & Don'ts</Label>
                    <Textarea
                      id="dos_and_donts"
                      name="dos_and_donts"
                      defaultValue={editingContent?.dos_and_donts || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fun_facts">Fun Facts / Folklore</Label>
                    <Textarea
                      id="fun_facts"
                      name="fun_facts"
                      defaultValue={editingContent?.fun_facts || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faqs">FAQs (format: Question|Answer per line)</Label>
                    <Textarea
                      id="faqs"
                      name="faqs"
                      defaultValue={
                        Array.isArray(editingContent?.faqs)
                          ? editingContent.faqs.map((f: any) => `${f.question}|${f.answer}`).join('\n')
                          : ''
                      }
                      rows={4}
                      placeholder="What is Bal Mithai?|Bal Mithai is a traditional sweet..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timings">Timings</Label>
                      <Input
                        id="timings"
                        name="timings"
                        defaultValue={editingContent?.timings || ''}
                        placeholder="6:00 AM - 8:00 PM"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entry_fee">Entry Fee</Label>
                      <Input
                        id="entry_fee"
                        name="entry_fee"
                        defaultValue={editingContent?.entry_fee || ''}
                        placeholder="Free / ₹50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local_customs">Local Customs & Rituals</Label>
                    <Textarea
                      id="local_customs"
                      name="local_customs"
                      defaultValue={editingContent?.local_customs || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="historical_significance">Historical Significance</Label>
                    <Textarea
                      id="historical_significance"
                      name="historical_significance"
                      defaultValue={editingContent?.historical_significance || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spiritual_significance">Spiritual Significance</Label>
                    <Textarea
                      id="spiritual_significance"
                      name="spiritual_significance"
                      defaultValue={editingContent?.spiritual_significance || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google_maps_url">Google Maps URL</Label>
                    <Input
                      id="google_maps_url"
                      name="google_maps_url"
                      defaultValue={editingContent?.google_maps_url || ''}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      name="seo_title"
                      defaultValue={editingContent?.seo_title || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      name="seo_description"
                      defaultValue={editingContent?.seo_description || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      name="sort_order"
                      type="number"
                      defaultValue={editingContent?.sort_order || 0}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createContent.isPending || updateContent.isPending}
                >
                  {editingContent ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
