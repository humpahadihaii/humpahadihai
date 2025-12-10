import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Pencil, Trash2, GripVertical, Plus, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { Database } from "@/integrations/supabase/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

type FeaturedHighlight = Database["public"]["Tables"]["featured_highlights"]["Row"];
type FeaturedHighlightInsert = Database["public"]["Tables"]["featured_highlights"]["Insert"];

interface SortableHighlightProps {
  highlight: FeaturedHighlight;
  onEdit: (highlight: FeaturedHighlight) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  isDeleting: boolean;
}

function SortableHighlight({ highlight, onEdit, onDelete, onToggleStatus, isDeleting }: SortableHighlightProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: highlight.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-50" : ""}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing hover:bg-muted p-2 rounded-md transition-colors"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Image Preview */}
            {highlight.image_url && (
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={highlight.image_url}
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${highlight.gradient_color} opacity-60`}></div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{highlight.title}</h3>
                <Badge variant={highlight.status === "published" ? "default" : "secondary"}>
                  {highlight.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {highlight.description}
              </p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Button:</span> {highlight.button_text}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Link:</span> {highlight.button_link}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Position:</span> {highlight.order_position}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleStatus(highlight.id, highlight.status)}
                title={highlight.status === "published" ? "Set to draft" : "Publish"}
              >
                {highlight.status === "published" ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(highlight)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(highlight.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const AdminFeaturedHighlightsPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<FeaturedHighlight[]>([]);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  useEffect(() => {
    if (highlights) {
      setItems(highlights);
    }
  }, [highlights]);

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
      setDialogOpen(false);
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
      setDialogOpen(false);
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

  const reorderMutation = useMutation({
    mutationFn: async (reorderedItems: FeaturedHighlight[]) => {
      const updates = reorderedItems.map((item, index) => 
        supabase
          .from("featured_highlights")
          .update({ order_position: index + 1 })
          .eq("id", item.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-highlights"] });
      toast.success("Order updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update order");
      // Revert on error
      if (highlights) setItems(highlights);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Update positions in database
        reorderMutation.mutate(reordered);
        
        return reordered;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      // Set order position to be last + 1
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order_position)) : 0;
      createMutation.mutate({ ...formData, order_position: maxOrder + 1 });
    }
  };

  const handleEdit = (highlight: FeaturedHighlight) => {
    setEditingId(highlight.id);
    setFormData(highlight);
    setDialogOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    updateMutation.mutate({ 
      id, 
      data: { status: newStatus } 
    });
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

  const gradientOptions = [
    { value: "from-primary via-primary/60", label: "Primary Blue" },
    { value: "from-secondary via-secondary/60", label: "Secondary Orange" },
    { value: "from-accent via-accent/60", label: "Accent Green" },
    { value: "from-purple-500 via-purple-400", label: "Purple" },
    { value: "from-pink-500 via-pink-400", label: "Pink" },
    { value: "from-emerald-500 via-emerald-400", label: "Emerald" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Featured Highlights
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage featured highlight cards on the homepage with drag-and-drop ordering
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Highlight
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Highlight" : "Add New Highlight"}</DialogTitle>
                <DialogDescription>
                  Create stunning featured highlight cards for your homepage
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Vibrant Traditions"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="button_text">Button Text</Label>
                    <Input
                      id="button_text"
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      placeholder="Discover More"
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
                    placeholder="Explore the rich cultural heritage..."
                    rows={3}
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
                      placeholder="/culture"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="gradient_color">Gradient Color</Label>
                    <Select
                      value={formData.gradient_color}
                      onValueChange={(value) => setFormData({ ...formData, gradient_color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gradientOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "published" | "draft") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ImageUpload
                  label="Background Image"
                  value={formData.image_url || ""}
                  onChange={(value) => setFormData({ ...formData, image_url: value })}
                  id="image_url"
                />

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingId ? "Update" : "Create"} Highlight
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GripVertical className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Drag to Reorder</h3>
                <p className="text-sm text-muted-foreground">
                  Use the grip handle on the left to drag and drop highlights in your desired order. 
                  Changes are saved automatically. Only published highlights appear on the homepage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highlights List with Drag and Drop */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No highlights yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first featured highlight to showcase on the homepage
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Highlight
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {items.map((highlight) => (
                  <SortableHighlight
                    key={highlight.id}
                    highlight={highlight}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onToggleStatus={handleToggleStatus}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeaturedHighlightsPage;
