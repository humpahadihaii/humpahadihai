import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { Database } from "@/integrations/supabase/types";

type FeaturedHighlight = Database["public"]["Tables"]["featured_highlights"]["Row"];
type FeaturedHighlightInsert = Database["public"]["Tables"]["featured_highlights"]["Insert"];

const AdminFeaturedHighlightsPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FeaturedHighlightInsert>({
    title: "",
    description: "",
    image_url: "",
    button_text: "Discover More",
    button_link: "/",
    order_position: 1,
    gradient_color: "from-primary via-primary/60",
    status: "published",
  });

  const { data: highlights, isLoading } = useQuery({
    queryKey: ["featured-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_highlights")
        .select("*")
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as FeaturedHighlight[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FeaturedHighlightInsert) => {
      const { error } = await supabase
        .from("featured_highlights")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-highlights"] });
      toast.success("Highlight created successfully");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create highlight");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FeaturedHighlight> }) => {
      const { error } = await supabase
        .from("featured_highlights")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-highlights"] });
      toast.success("Highlight updated successfully");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update highlight");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("featured_highlights")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-highlights"] });
      toast.success("Highlight deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete highlight");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (highlight: FeaturedHighlight) => {
    setEditingId(highlight.id);
    setFormData(highlight);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      button_text: "Discover More",
      button_link: "/",
      order_position: 1,
      gradient_color: "from-primary via-primary/60",
      status: "published",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Featured Highlights</h1>
          <p className="text-muted-foreground mt-2">
            Manage the featured highlight cards on the homepage
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Highlight" : "Add New Highlight"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_link">Button Link</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="order_position">Order Position</Label>
                  <Input
                    id="order_position"
                    type="number"
                    value={formData.order_position}
                    onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gradient_color">Gradient Color (Tailwind classes)</Label>
                <Input
                  id="gradient_color"
                  placeholder="e.g., from-primary via-primary/60"
                  value={formData.gradient_color}
                  onChange={(e) => setFormData({ ...formData, gradient_color: e.target.value })}
                  required
                />
              </div>

              <ImageUpload
                label="Background Image"
                value={formData.image_url || ""}
                onChange={(value) => setFormData({ ...formData, image_url: value })}
                id="image_url"
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update" : "Create"} Highlight
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading highlights...</p>
          ) : (
            highlights?.map((highlight) => (
              <Card key={highlight.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        {highlight.image_url && (
                          <img
                            src={highlight.image_url}
                            alt={highlight.title}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{highlight.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{highlight.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Button: {highlight.button_text}</span>
                            <span>Link: {highlight.button_link}</span>
                            <span>Order: {highlight.order_position}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(highlight)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(highlight.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFeaturedHighlightsPage;