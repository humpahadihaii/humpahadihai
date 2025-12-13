import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Eye, MapPin, Search, ExternalLink } from "lucide-react";
import { useDestinationGuides, useDestinationGuideMutations, DestinationGuide } from "@/hooks/useDestinationGuides";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function AdminDestinationGuidesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDestination, setEditingDestination] = useState<DestinationGuide | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: destinations, isLoading } = useDestinationGuides();
  const { createDestination, updateDestination, deleteDestination } = useDestinationGuideMutations();

  const filteredDestinations = destinations?.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreate = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const data = {
      name,
      slug: generateSlug(name),
      short_introduction: formData.get("short_introduction") as string,
      hero_image: formData.get("hero_image") as string,
      region: formData.get("region") as string,
      best_time_to_visit: formData.get("best_time_to_visit") as string,
      ideal_duration: formData.get("ideal_duration") as string,
      local_people_culture: formData.get("local_people_culture") as string,
      local_customs_etiquette: formData.get("local_customs_etiquette") as string,
      temperature_info: {
        summer: formData.get("temp_summer") as string,
        winter: formData.get("temp_winter") as string,
        monsoon: formData.get("temp_monsoon") as string,
      },
      seo_title: formData.get("seo_title") as string,
      seo_description: formData.get("seo_description") as string,
      status: formData.get("status") as "draft" | "published",
    };

    await createDestination.mutateAsync(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingDestination) return;

    const data = {
      name: formData.get("name") as string,
      short_introduction: formData.get("short_introduction") as string,
      hero_image: formData.get("hero_image") as string,
      region: formData.get("region") as string,
      best_time_to_visit: formData.get("best_time_to_visit") as string,
      ideal_duration: formData.get("ideal_duration") as string,
      local_people_culture: formData.get("local_people_culture") as string,
      local_customs_etiquette: formData.get("local_customs_etiquette") as string,
      temperature_info: {
        summer: formData.get("temp_summer") as string,
        winter: formData.get("temp_winter") as string,
        monsoon: formData.get("temp_monsoon") as string,
      },
      seo_title: formData.get("seo_title") as string,
      seo_description: formData.get("seo_description") as string,
      status: formData.get("status") as "draft" | "published",
    };

    await updateDestination.mutateAsync({ id: editingDestination.id, data });
    setEditingDestination(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all places under this destination.")) return;
    await deleteDestination.mutateAsync(id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Destination Guides</h1>
            <p className="text-muted-foreground">Manage destination guides and their places</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Destination
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Desktop Table */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Places</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredDestinations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No destinations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDestinations?.map((destination) => (
                    <TableRow key={destination.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {destination.hero_image && (
                            <img
                              src={destination.hero_image}
                              alt={destination.name}
                              className="h-10 w-14 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{destination.name}</div>
                            <div className="text-sm text-muted-foreground">/{destination.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{destination.region || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={destination.status === "published" ? "default" : "secondary"}>
                          {destination.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/admin/destination-guides/${destination.id}/places`}
                          className="text-primary hover:underline"
                        >
                          Manage Places →
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link to={`/destinations/${destination.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingDestination(destination)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(destination.id)}
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredDestinations?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No destinations found
              </CardContent>
            </Card>
          ) : (
            filteredDestinations?.map((destination) => (
              <Card key={destination.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {destination.hero_image && (
                      <img
                        src={destination.hero_image}
                        alt={destination.name}
                        className="h-16 w-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{destination.name}</h3>
                          <p className="text-sm text-muted-foreground">{destination.region}</p>
                        </div>
                        <Badge variant={destination.status === "published" ? "default" : "secondary"}>
                          {destination.status}
                        </Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/destination-guides/${destination.id}/places`}>
                            <MapPin className="h-3 w-3 mr-1" />
                            Places
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingDestination(destination)}>
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Dialog */}
        <DestinationFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreate}
          title="Create Destination"
          isLoading={createDestination.isPending}
        />

        {/* Edit Dialog */}
        <DestinationFormDialog
          open={!!editingDestination}
          onOpenChange={(open) => !open && setEditingDestination(null)}
          onSubmit={handleUpdate}
          title="Edit Destination"
          destination={editingDestination}
          isLoading={updateDestination.isPending}
        />
      </div>
    </AdminLayout>
  );
}

// Form Dialog Component
function DestinationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  destination,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
  title: string;
  destination?: DestinationGuide | null;
  isLoading: boolean;
}) {
  const [heroImage, setHeroImage] = useState(destination?.hero_image || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("hero_image", heroImage);
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Destination Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={destination?.name}
                required
                placeholder="e.g., Almora"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select name="region" defaultValue={destination?.region || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kumaon">Kumaon</SelectItem>
                  <SelectItem value="Garhwal">Garhwal</SelectItem>
                  <SelectItem value="Jaunsar">Jaunsar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_introduction">Short Introduction</Label>
            <Textarea
              id="short_introduction"
              name="short_introduction"
              defaultValue={destination?.short_introduction || ""}
              rows={3}
              placeholder="Brief description of the destination..."
            />
          </div>

          <ImageUpload
            label="Hero Image"
            value={heroImage || destination?.hero_image || ""}
            onChange={setHeroImage}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="best_time_to_visit">Best Time to Visit</Label>
              <Input
                id="best_time_to_visit"
                name="best_time_to_visit"
                defaultValue={destination?.best_time_to_visit || ""}
                placeholder="e.g., March to June"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ideal_duration">Ideal Duration</Label>
              <Input
                id="ideal_duration"
                name="ideal_duration"
                defaultValue={destination?.ideal_duration || ""}
                placeholder="e.g., 2-3 days"
              />
            </div>
          </div>

          {/* Temperature Info */}
          <div className="space-y-2">
            <Label>Temperature Info</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                name="temp_summer"
                placeholder="Summer"
                defaultValue={destination?.temperature_info?.summer || ""}
              />
              <Input
                name="temp_monsoon"
                placeholder="Monsoon"
                defaultValue={destination?.temperature_info?.monsoon || ""}
              />
              <Input
                name="temp_winter"
                placeholder="Winter"
                defaultValue={destination?.temperature_info?.winter || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local_people_culture">Local People & Culture</Label>
            <Textarea
              id="local_people_culture"
              name="local_people_culture"
              defaultValue={destination?.local_people_culture || ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local_customs_etiquette">Local Customs & Etiquette</Label>
            <Textarea
              id="local_customs_etiquette"
              name="local_customs_etiquette"
              defaultValue={destination?.local_customs_etiquette || ""}
              rows={3}
            />
          </div>

          {/* SEO Fields */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium">SEO Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                name="seo_title"
                defaultValue={destination?.seo_title || ""}
                placeholder="Page title for search engines"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo_description">SEO Description</Label>
              <Textarea
                id="seo_description"
                name="seo_description"
                defaultValue={destination?.seo_description || ""}
                rows={2}
                placeholder="Meta description for search engines"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={destination?.status || "draft"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
