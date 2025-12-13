import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ArrowLeft,
  Search,
  GripVertical,
  MapPin,
  Clock,
  Ticket,
} from "lucide-react";
import {
  useDestinationPlaces,
  useDestinationPlaceMutations,
  DestinationPlace,
} from "@/hooks/useDestinationGuides";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CATEGORIES = [
  { value: "Temple", label: "Temple / Spiritual" },
  { value: "Nature", label: "Nature / Park" },
  { value: "Market", label: "Market / Shopping" },
  { value: "Experience", label: "Experience / Activity" },
  { value: "Wildlife", label: "Wildlife" },
  { value: "Historical", label: "Historical" },
  { value: "Adventure", label: "Adventure" },
];

export default function AdminDestinationPlacesPage() {
  const { destinationId } = useParams<{ destinationId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingPlace, setEditingPlace] = useState<DestinationPlace | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch destination details
  const { data: destination } = useQuery({
    queryKey: ["destination", destinationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destination_guides")
        .select("*")
        .eq("id", destinationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!destinationId,
  });

  const { data: places, isLoading } = useDestinationPlaces(destinationId);
  const { createPlace, updatePlace, deletePlace } = useDestinationPlaceMutations();

  const filteredPlaces = places?.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.short_summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreate = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const thingsToDo = (formData.get("things_to_do") as string)
      .split("\n")
      .filter((item) => item.trim());

    const data = {
      destination_id: destinationId,
      name,
      slug: generateSlug(name),
      category: formData.get("category") as DestinationPlace["category"],
      short_summary: formData.get("short_summary") as string,
      how_to_reach: {
        by_road: formData.get("reach_by_road") as string,
        by_foot: formData.get("reach_by_foot") as string,
        distance_from_destination: formData.get("reach_distance") as string,
      },
      things_to_do: thingsToDo,
      local_customs_rituals: formData.get("local_customs_rituals") as string,
      historical_significance: formData.get("historical_significance") as string,
      spiritual_significance: formData.get("spiritual_significance") as string,
      best_visiting_time: formData.get("best_visiting_time") as string,
      approx_duration: formData.get("approx_duration") as string,
      entry_fee: formData.get("entry_fee") as string,
      timings: formData.get("timings") as string,
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
      google_maps_url: formData.get("google_maps_url") as string,
      main_image: formData.get("main_image") as string,
      seo_title: formData.get("seo_title") as string,
      seo_description: formData.get("seo_description") as string,
      status: formData.get("status") as "draft" | "published",
    };

    await createPlace.mutateAsync(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingPlace) return;

    const thingsToDo = (formData.get("things_to_do") as string)
      .split("\n")
      .filter((item) => item.trim());

    const data = {
      name: formData.get("name") as string,
      category: formData.get("category") as DestinationPlace["category"],
      short_summary: formData.get("short_summary") as string,
      how_to_reach: {
        by_road: formData.get("reach_by_road") as string,
        by_foot: formData.get("reach_by_foot") as string,
        distance_from_destination: formData.get("reach_distance") as string,
      },
      things_to_do: thingsToDo,
      local_customs_rituals: formData.get("local_customs_rituals") as string,
      historical_significance: formData.get("historical_significance") as string,
      spiritual_significance: formData.get("spiritual_significance") as string,
      best_visiting_time: formData.get("best_visiting_time") as string,
      approx_duration: formData.get("approx_duration") as string,
      entry_fee: formData.get("entry_fee") as string,
      timings: formData.get("timings") as string,
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
      google_maps_url: formData.get("google_maps_url") as string,
      main_image: formData.get("main_image") as string,
      seo_title: formData.get("seo_title") as string,
      seo_description: formData.get("seo_description") as string,
      status: formData.get("status") as "draft" | "published",
    };

    await updatePlace.mutateAsync({ id: editingPlace.id, data });
    setEditingPlace(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this place?")) return;
    await deletePlace.mutateAsync(id);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Temple: "bg-amber-100 text-amber-800",
      Nature: "bg-green-100 text-green-800",
      Market: "bg-blue-100 text-blue-800",
      Experience: "bg-purple-100 text-purple-800",
      Wildlife: "bg-emerald-100 text-emerald-800",
      Historical: "bg-orange-100 text-orange-800",
      Adventure: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/destination-guides">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {destination?.name || "Loading..."} - Places
              </h1>
              <p className="text-muted-foreground">
                Manage places and attractions for this destination
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Place
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Table */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredPlaces?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No places found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlaces?.map((place) => (
                    <TableRow key={place.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {place.main_image && (
                            <img
                              src={place.main_image}
                              alt={place.name}
                              className="h-10 w-14 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{place.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {place.short_summary}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(place.category)}>
                          {place.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{place.approx_duration || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={place.status === "published" ? "default" : "secondary"}>
                          {place.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/destinations/${destination?.slug}/${place.slug}`}
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPlace(place)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(place.id)}
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
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredPlaces?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No places found
              </CardContent>
            </Card>
          ) : (
            filteredPlaces?.map((place) => (
              <Card key={place.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {place.main_image && (
                      <img
                        src={place.main_image}
                        alt={place.name}
                        className="h-20 w-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium truncate">{place.name}</h3>
                        <Badge variant={place.status === "published" ? "default" : "secondary"}>
                          {place.status}
                        </Badge>
                      </div>
                      <Badge className={`mt-1 ${getCategoryColor(place.category)}`}>
                        {place.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {place.short_summary}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingPlace(place)}>
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(place.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
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
        <PlaceFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreate}
          title="Add Place"
          isLoading={createPlace.isPending}
        />

        {/* Edit Dialog */}
        <PlaceFormDialog
          open={!!editingPlace}
          onOpenChange={(open) => !open && setEditingPlace(null)}
          onSubmit={handleUpdate}
          title="Edit Place"
          place={editingPlace}
          isLoading={updatePlace.isPending}
        />
      </div>
    </AdminLayout>
  );
}

// Form Dialog Component
function PlaceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  place,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
  title: string;
  place?: DestinationPlace | null;
  isLoading: boolean;
}) {
  const [mainImage, setMainImage] = useState(place?.main_image || "");
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("main_image", mainImage);
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
                  <Label htmlFor="name">Place Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={place?.name}
                    required
                    placeholder="e.g., Nanda Devi Temple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" defaultValue={place?.category || "Temple"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_summary">Short Summary</Label>
                <Textarea
                  id="short_summary"
                  name="short_summary"
                  defaultValue={place?.short_summary || ""}
                  rows={3}
                  placeholder="2-3 lines about this place..."
                />
              </div>

              <ImageUpload
                label="Main Image"
                value={mainImage || place?.main_image || ""}
                onChange={setMainImage}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approx_duration">Duration</Label>
                  <Input
                    id="approx_duration"
                    name="approx_duration"
                    defaultValue={place?.approx_duration || ""}
                    placeholder="e.g., 1-2 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry_fee">Entry Fee</Label>
                  <Input
                    id="entry_fee"
                    name="entry_fee"
                    defaultValue={place?.entry_fee || ""}
                    placeholder="e.g., Free / ₹50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timings">Timings</Label>
                  <Input
                    id="timings"
                    name="timings"
                    defaultValue={place?.timings || ""}
                    placeholder="e.g., 6 AM - 8 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="best_visiting_time">Best Time to Visit</Label>
                <Input
                  id="best_visiting_time"
                  name="best_visiting_time"
                  defaultValue={place?.best_visiting_time || ""}
                  placeholder="e.g., Early morning for sunrise"
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>How to Reach</Label>
                <div className="space-y-2">
                  <Input
                    name="reach_by_road"
                    placeholder="By Road"
                    defaultValue={place?.how_to_reach?.by_road || ""}
                  />
                  <Input
                    name="reach_by_foot"
                    placeholder="By Foot (if applicable)"
                    defaultValue={place?.how_to_reach?.by_foot || ""}
                  />
                  <Input
                    name="reach_distance"
                    placeholder="Distance from main destination"
                    defaultValue={place?.how_to_reach?.distance_from_destination || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="things_to_do">Things to Do (one per line)</Label>
                <Textarea
                  id="things_to_do"
                  name="things_to_do"
                  defaultValue={place?.things_to_do?.join("\n") || ""}
                  rows={4}
                  placeholder="Enter each activity on a new line..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="local_customs_rituals">Local Customs & Rituals</Label>
                <Textarea
                  id="local_customs_rituals"
                  name="local_customs_rituals"
                  defaultValue={place?.local_customs_rituals || ""}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="historical_significance">Historical Significance</Label>
                <Textarea
                  id="historical_significance"
                  name="historical_significance"
                  defaultValue={place?.historical_significance || ""}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spiritual_significance">Spiritual Significance</Label>
                <Textarea
                  id="spiritual_significance"
                  name="spiritual_significance"
                  defaultValue={place?.spiritual_significance || ""}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    defaultValue={place?.latitude || ""}
                    placeholder="e.g., 29.5892"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    defaultValue={place?.longitude || ""}
                    placeholder="e.g., 79.6467"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_maps_url">Google Maps URL</Label>
                <Input
                  id="google_maps_url"
                  name="google_maps_url"
                  defaultValue={place?.google_maps_url || ""}
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
                  defaultValue={place?.seo_title || ""}
                  placeholder="Page title for search engines"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  name="seo_description"
                  defaultValue={place?.seo_description || ""}
                  rows={3}
                  placeholder="Meta description for search engines"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 150-160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={place?.status || "draft"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Place"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
