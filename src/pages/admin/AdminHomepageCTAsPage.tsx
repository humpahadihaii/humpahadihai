import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, GripVertical, icons } from "lucide-react";
import {
  useAllHomepageCTAs,
  useCreateCTA,
  useUpdateCTA,
  useDeleteCTA,
  HomepageCTA,
  CTAPosition,
  CTAVariant,
  CTASize,
  CTA_POSITIONS,
  CTA_VARIANTS,
  CTA_SIZES,
} from "@/hooks/useHomepageCTAs";

const ICON_OPTIONS = [
  "Compass", "Images", "MapPin", "Mountain", "ShoppingBag", "Building2",
  "Mail", "PenTool", "Phone", "Star", "Heart", "Home", "Users", "Calendar",
  "Camera", "Book", "Music", "Globe", "Utensils", "TreePine", "Tent", "Map",
];

const DynamicIcon = ({ name }: { name: string }) => {
  const IconComponent = icons[name as keyof typeof icons];
  if (!IconComponent) return null;
  return <IconComponent className="h-4 w-4" />;
};

interface CTAFormData {
  label: string;
  url: string;
  variant: CTAVariant;
  icon: string;
  position: CTAPosition;
  display_order: number;
  is_active: boolean;
  background_color: string;
  text_color: string;
  size: CTASize;
  open_in_new_tab: boolean;
}

const defaultFormData: CTAFormData = {
  label: "",
  url: "",
  variant: "default",
  icon: "",
  position: "hero",
  display_order: 0,
  is_active: true,
  background_color: "",
  text_color: "",
  size: "default",
  open_in_new_tab: false,
};

export default function AdminHomepageCTAsPage() {
  const { data: ctas, isLoading } = useAllHomepageCTAs();
  const createCTA = useCreateCTA();
  const updateCTA = useUpdateCTA();
  const deleteCTA = useDeleteCTA();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCTA, setEditingCTA] = useState<HomepageCTA | null>(null);
  const [formData, setFormData] = useState<CTAFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredCTAs = ctas?.filter((cta) =>
    activeTab === "all" ? true : cta.position === activeTab
  );

  const handleOpenModal = (cta?: HomepageCTA) => {
    if (cta) {
      setEditingCTA(cta);
      setFormData({
        label: cta.label,
        url: cta.url,
        variant: cta.variant,
        icon: cta.icon || "",
        position: cta.position,
        display_order: cta.display_order,
        is_active: cta.is_active,
        background_color: cta.background_color || "",
        text_color: cta.text_color || "",
        size: cta.size,
        open_in_new_tab: cta.open_in_new_tab,
      });
    } else {
      setEditingCTA(null);
      setFormData({
        ...defaultFormData,
        position: activeTab !== "all" ? (activeTab as CTAPosition) : "hero",
        display_order: (filteredCTAs?.length || 0) + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.url) {
      toast.error("Label and URL are required");
      return;
    }

    try {
      const payload = {
        ...formData,
        icon: formData.icon || null,
        background_color: formData.background_color || null,
        text_color: formData.text_color || null,
      };

      if (editingCTA) {
        await updateCTA.mutateAsync({ id: editingCTA.id, ...payload });
        toast.success("CTA updated successfully");
      } else {
        await createCTA.mutateAsync(payload);
        toast.success("CTA created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save CTA");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this CTA?")) return;
    try {
      await deleteCTA.mutateAsync(id);
      toast.success("CTA deleted successfully");
    } catch (error) {
      toast.error("Failed to delete CTA");
    }
  };

  const handleToggleActive = async (cta: HomepageCTA) => {
    try {
      await updateCTA.mutateAsync({ id: cta.id, is_active: !cta.is_active });
      toast.success(`CTA ${cta.is_active ? "disabled" : "enabled"}`);
    } catch (error) {
      toast.error("Failed to update CTA");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Homepage CTAs</h1>
            <p className="text-muted-foreground">
              Manage call-to-action buttons displayed on the homepage
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add CTA
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {CTA_POSITIONS.map((pos) => (
              <TabsTrigger key={pos.value} value={pos.value}>
                {pos.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !filteredCTAs?.length ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No CTAs found. Click "Add CTA" to create one.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCTAs.map((cta) => (
                      <TableRow key={cta.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {cta.icon && <DynamicIcon name={cta.icon} />}
                            {cta.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {cta.url}
                            {cta.open_in_new_tab && (
                              <ExternalLink className="h-3 w-3" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CTA_POSITIONS.find((p) => p.value === cta.position)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cta.variant}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={cta.is_active}
                            onCheckedChange={() => handleToggleActive(cta)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(cta)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(cta.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCTA ? "Edit CTA" : "Add New CTA"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="Explore Culture"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="/culture"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(v) =>
                      setFormData({ ...formData, position: v as CTAPosition })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Variant</Label>
                  <Select
                    value={formData.variant}
                    onValueChange={(v) =>
                      setFormData({ ...formData, variant: v as CTAVariant })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_VARIANTS.map((variant) => (
                        <SelectItem key={variant.value} value={variant.value}>
                          {variant.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(v) =>
                      setFormData({ ...formData, icon: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No icon</SelectItem>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={icon} />
                            {icon}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(v) =>
                      setFormData({ ...formData, size: v as CTASize })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={formData.background_color || "#000000"}
                    onChange={(e) =>
                      setFormData({ ...formData, background_color: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <Input
                    type="color"
                    value={formData.text_color || "#ffffff"}
                    onChange={(e) =>
                      setFormData({ ...formData, text_color: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_active: v })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="open_in_new_tab"
                    checked={formData.open_in_new_tab}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, open_in_new_tab: v })
                    }
                  />
                  <Label htmlFor="open_in_new_tab">Open in new tab</Label>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Preview
                </Label>
                <div className="flex justify-center">
                  <Button
                    variant={formData.variant}
                    size={formData.size}
                    style={{
                      backgroundColor: formData.background_color || undefined,
                      color: formData.text_color || undefined,
                    }}
                  >
                    {formData.icon && (
                      <DynamicIcon name={formData.icon} />
                    )}
                    <span className={formData.icon ? "ml-2" : ""}>
                      {formData.label || "Button Label"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createCTA.isPending || updateCTA.isPending}
              >
                {createCTA.isPending || updateCTA.isPending
                  ? "Saving..."
                  : editingCTA
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
