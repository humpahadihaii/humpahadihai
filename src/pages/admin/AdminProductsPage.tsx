import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  category_id: z.string().optional(),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  price: z.coerce.number().min(0),
  unit_label: z.string().optional(),
  stock_status: z.string().default("in_stock"),
  thumbnail_image_url: z.string().optional(),
  tags: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  price: number;
  stock_status: string;
  thumbnail_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  local_product_categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      category_id: "",
      short_description: "",
      full_description: "",
      price: 0,
      unit_label: "",
      stock_status: "in_stock",
      thumbnail_image_url: "",
      tags: "",
      is_featured: false,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("local_products")
      .select("*, local_product_categories(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch products");
      return;
    }
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("local_product_categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order");
    setCategories(data || []);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: ProductFormData) => {
    const productData = {
      ...data,
      category_id: data.category_id || null,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()) : null,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("local_products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("Failed to update product");
        return;
      }
      toast.success("Product updated successfully");
    } else {
      const { error } = await supabase
        .from("local_products")
        .insert([productData]);

      if (error) {
        toast.error("Failed to create product");
        return;
      }
      toast.success("Product created successfully");
    }

    form.reset();
    setEditingProduct(null);
    setDialogOpen(false);
    fetchProducts();
  };

  const handleEdit = async (product: Product) => {
    const { data } = await supabase
      .from("local_products")
      .select("*")
      .eq("id", product.id)
      .single();

    if (data) {
      setEditingProduct(data);
      form.reset({
        name: data.name,
        slug: data.slug,
        category_id: data.category_id || "",
        short_description: data.short_description || "",
        full_description: data.full_description || "",
        price: data.price,
        unit_label: data.unit_label || "",
        stock_status: data.stock_status,
        thumbnail_image_url: data.thumbnail_image_url || "",
        tags: data.tags?.join(", ") || "",
        is_featured: data.is_featured,
        is_active: data.is_active,
      });
      setDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("local_products")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
      return;
    }
    toast.success("Product deleted successfully");
    fetchProducts();
  };

  const getStockBadge = (status: string) => {
    const colors: Record<string, string> = {
      in_stock: "bg-green-100 text-green-800",
      out_of_stock: "bg-red-100 text-red-800",
      made_to_order: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Local Products</h1>
            <p className="text-muted-foreground">Manage Pahadi products</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      onChange={(e) => {
                        form.setValue("name", e.target.value);
                        if (!editingProduct) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" {...form.register("slug")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={form.watch("category_id") || ""}
                      onValueChange={(value) => form.setValue("category_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_status">Stock Status</Label>
                    <Select
                      value={form.watch("stock_status")}
                      onValueChange={(value) => form.setValue("stock_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="made_to_order">Made to Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (INR)</Label>
                    <Input id="price" type="number" {...form.register("price")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_label">Unit Label</Label>
                    <Input id="unit_label" {...form.register("unit_label")} placeholder="e.g., per kg, per piece" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea id="short_description" {...form.register("short_description")} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea id="full_description" {...form.register("full_description")} rows={4} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" {...form.register("tags")} placeholder="organic, handmade, traditional" />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <ImageUpload
                    currentImage={form.watch("thumbnail_image_url")}
                    onImageUpload={(url) => form.setValue("thumbnail_image_url", url)}
                    folder="products"
                  />
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_featured"
                      checked={form.watch("is_featured")}
                      onCheckedChange={(checked) => form.setValue("is_featured", checked)}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={form.watch("is_active")}
                      onCheckedChange={(checked) => form.setValue("is_active", checked)}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>{products.length} products found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.thumbnail_image_url && (
                            <img src={product.thumbnail_image_url} alt={product.name} className="h-12 w-12 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{product.short_description || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.local_product_categories?.name || "-"}</TableCell>
                      <TableCell>₹{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${getStockBadge(product.stock_status)}`}>
                          {product.stock_status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {product.is_featured && <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Featured</span>}
                          <span className={`px-2 py-1 rounded text-xs ${product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/products/${product.slug}`} target="_blank"><Eye className="h-4 w-4" /></a>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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
};

export default AdminProductsPage;
