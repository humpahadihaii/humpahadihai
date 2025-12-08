import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Utensils, Sparkles, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface DistrictFood {
  id: string;
  district_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const AdminDistrictFoodsPage = () => {
  const queryClient = useQueryClient();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<DistrictFood | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
    sort_order: 0,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: foods = [], isLoading } = useQuery({
    queryKey: ["district-foods", selectedDistrict],
    queryFn: async () => {
      if (!selectedDistrict) return [];
      const { data, error } = await supabase
        .from("district_foods")
        .select("*")
        .eq("district_id", selectedDistrict)
        .order("sort_order");
      if (error) throw error;
      return data as DistrictFood[];
    },
    enabled: !!selectedDistrict,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<DistrictFood>) => {
      if (editingFood) {
        const { error } = await supabase
          .from("district_foods")
          .update(data)
          .eq("id", editingFood.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("district_foods")
          .insert([{ ...data, district_id: selectedDistrict } as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["district-foods"] });
      toast.success(editingFood ? "Food item updated" : "Food item added");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to save food item");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("district_foods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["district-foods"] });
      toast.success("Food item deleted");
    },
    onError: () => toast.error("Failed to delete food item"),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingFood(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (food: DistrictFood) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || "",
      image_url: food.image_url || "",
      is_active: food.is_active,
      sort_order: food.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    saveMutation.mutate({
      name: formData.name,
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    });
  };

  const handleAISuggest = async () => {
    if (!selectedDistrict) {
      toast.error("Please select a district first");
      return;
    }
    const districtName = districts.find(d => d.id === selectedDistrict)?.name;
    if (!districtName) return;

    setIsAILoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-content", {
        body: {
          type: "districts",
          action: "suggest_foods",
          inputs: { district_name: districtName },
        },
      });

      if (error) throw error;

      const content = data?.content || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        for (const food of suggestions) {
          await supabase.from("district_foods").insert({
            district_id: selectedDistrict,
            name: food.name,
            description: food.description,
            is_active: false,
            sort_order: 0,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["district-foods"] });
        toast.success(`Added ${suggestions.length} food items as drafts`);
      } else {
        toast.error("Could not parse AI response");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI suggestion failed");
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Local Food</h1>
            <p className="text-muted-foreground">Manage traditional foods and dishes by district</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select District</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Choose a district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDistrict && (
              <>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="mr-2 h-4 w-4" /> Add Food
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingFood ? "Edit Food" : "Add Food"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Baadi, Jholi, Singori"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Image</Label>
                        <ImageUpload
                          label="Food Image"
                          value={formData.image_url}
                          onChange={(url) => setFormData({ ...formData, image_url: url })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                      <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="w-full">
                        {saveMutation.isPending ? "Saving..." : "Save Food"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={handleAISuggest} disabled={isAILoading}>
                  {isAILoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  AI: Suggest Foods
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {selectedDistrict && (
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <p>Loading...</p>
              ) : foods.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No food items yet. Add some or use AI suggestions.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foods.map((food) => (
                      <TableRow key={food.id}>
                        <TableCell>
                          {food.image_url ? (
                            <img src={food.image_url} alt={food.name} className="w-16 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{food.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{food.description}</TableCell>
                        <TableCell>
                          {food.is_active ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Draft</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(food)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(food.id)}>
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
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDistrictFoodsPage;
