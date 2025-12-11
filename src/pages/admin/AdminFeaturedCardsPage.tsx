import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  Instagram,
  ExternalLink,
  Calendar,
  Image as ImageIcon
} from "lucide-react";
import { 
  useAdminFeaturedCards, 
  useFeaturedCardMutations,
  getLocalizedText,
  type FeaturedCard,
  type FeaturedCardInsert
} from "@/hooks/useFeaturedCards";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";
import { trackInternalEvent } from "@/lib/internalTracker";
import { format } from "date-fns";

const ICON_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter/X" },
  { value: "globe", label: "Website" },
  { value: "mail", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "map-pin", label: "Location" },
];

const DEFAULT_CARD: Partial<FeaturedCardInsert> = {
  slug: "",
  title: { en: "", hi: "" },
  subtitle: { en: "", hi: "" },
  cta_label: { en: "", hi: "" },
  cta_url: { en: "", hi: "" },
  image_url: null,
  image_alt: { en: "", hi: "" },
  icon_name: "instagram",
  gradient_color: "bg-white/85",
  order_index: 100,
  is_published: false,
  visible_on_homepage: true,
  start_at: null,
  end_at: null,
  is_sample: false,
  ab_test_tag: null,
};

const AdminFeaturedCardsPage = () => {
  const { data: cards, isLoading } = useAdminFeaturedCards();
  const { createCard, updateCard, deleteCard } = useFeaturedCardMutations();
  const { logCreate, logUpdate, logDelete } = useAdminActivityLogger();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FeaturedCard | null>(null);
  const [formData, setFormData] = useState<Partial<FeaturedCardInsert>>(DEFAULT_CARD);
  const [activeLocale, setActiveLocale] = useState<"en" | "hi">("en");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (card: FeaturedCard) => {
    setEditingCard(card);
    setFormData({
      slug: card.slug,
      title: card.title || { en: "", hi: "" },
      subtitle: card.subtitle || { en: "", hi: "" },
      cta_label: card.cta_label || { en: "", hi: "" },
      cta_url: card.cta_url || { en: "", hi: "" },
      image_url: card.image_url,
      image_alt: card.image_alt || { en: "", hi: "" },
      icon_name: card.icon_name,
      gradient_color: card.gradient_color,
      order_index: card.order_index,
      is_published: card.is_published,
      visible_on_homepage: card.visible_on_homepage,
      start_at: card.start_at,
      end_at: card.end_at,
      is_sample: card.is_sample,
      ab_test_tag: card.ab_test_tag,
    });
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingCard(null);
    setFormData(DEFAULT_CARD);
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!formData.slug) {
      return;
    }

    try {
      if (editingCard) {
        await updateCard.mutateAsync({ id: editingCard.id, updates: formData });
        logUpdate("featured_card", editingCard.id, formData.slug || editingCard.slug);
        trackInternalEvent({ 
          eventName: "featured_card_updated", 
          metadata: { slug: formData.slug, card_id: editingCard.id } 
        });
      } else {
        await createCard.mutateAsync(formData as FeaturedCardInsert);
        logCreate("featured_card", formData.slug || "new", formData.slug || "New Card");
        trackInternalEvent({ 
          eventName: "featured_card_created", 
          metadata: { slug: formData.slug } 
        });
      }
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    const card = cards?.find(c => c.id === id);
    await deleteCard.mutateAsync(id);
    if (card) {
      logDelete("featured_card", id, card.slug);
      trackInternalEvent({ 
        eventName: "featured_card_deleted", 
        metadata: { slug: card.slug, card_id: id } 
      });
    }
    setDeleteConfirmId(null);
  };

  const updateLocalizedField = (
    field: "title" | "subtitle" | "cta_label" | "cta_url" | "image_alt",
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as Record<string, string>),
        [activeLocale]: value,
      },
    }));
  };

  const getFieldValue = (field: "title" | "subtitle" | "cta_label" | "cta_url" | "image_alt"): string => {
    const fieldData = formData[field] as Record<string, string> | undefined;
    return fieldData?.[activeLocale] || "";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Featured Cards</h1>
            <p className="text-muted-foreground">
              Manage homepage featured cards like "Follow Our Journey"
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>

        {/* Cards List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards?.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {card.image_url ? (
                          <img 
                            src={card.image_url} 
                            alt={getLocalizedText(card.title)} 
                            className="h-12 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
                            <Instagram className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{getLocalizedText(card.title)}</p>
                          <p className="text-sm text-muted-foreground">{card.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={card.is_published ? "default" : "secondary"}>
                          {card.is_published ? "Published" : "Draft"}
                        </Badge>
                        {card.visible_on_homepage && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Homepage
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {card.start_at || card.end_at ? (
                        <div className="text-sm">
                          {card.start_at && (
                            <p>From: {format(new Date(card.start_at), "MMM d, yyyy")}</p>
                          )}
                          {card.end_at && (
                            <p>Until: {format(new Date(card.end_at), "MMM d, yyyy")}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Always</span>
                      )}
                    </TableCell>
                    <TableCell>{card.order_index}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(card)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteConfirmId(card.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!cards || cards.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No featured cards yet. Create your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? "Edit Featured Card" : "Create Featured Card"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label>Slug (unique identifier)</Label>
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="follow-our-journey"
                    disabled={!!editingCard}
                  />
                </div>

                {/* Language Tabs */}
                <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as "en" | "hi")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="en" className="flex-1">English</TabsTrigger>
                    <TabsTrigger value="hi" className="flex-1">हिंदी</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeLocale} className="space-y-4 mt-4">
                    <div>
                      <Label>Title ({activeLocale.toUpperCase()})</Label>
                      <Input
                        value={getFieldValue("title")}
                        onChange={(e) => updateLocalizedField("title", e.target.value)}
                        placeholder="Follow Our Journey"
                      />
                    </div>

                    <div>
                      <Label>Subtitle ({activeLocale.toUpperCase()})</Label>
                      <Textarea
                        value={getFieldValue("subtitle")}
                        onChange={(e) => updateLocalizedField("subtitle", e.target.value)}
                        placeholder="Join our community for daily stories..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>CTA Label ({activeLocale.toUpperCase()})</Label>
                      <Input
                        value={getFieldValue("cta_label")}
                        onChange={(e) => updateLocalizedField("cta_label", e.target.value)}
                        placeholder="@hum_pahadi_haii"
                      />
                    </div>

                    <div>
                      <Label>CTA URL ({activeLocale.toUpperCase()})</Label>
                      <Input
                        value={getFieldValue("cta_url")}
                        onChange={(e) => updateLocalizedField("cta_url", e.target.value)}
                        placeholder="https://instagram.com/hum_pahadi_haii"
                      />
                    </div>

                    <div>
                      <Label>Image Alt Text ({activeLocale.toUpperCase()})</Label>
                      <Input
                        value={getFieldValue("image_alt")}
                        onChange={(e) => updateLocalizedField("image_alt", e.target.value)}
                        placeholder="Follow us on Instagram"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Image Upload */}
                <div>
                  <ImageUpload
                    label="Background Image"
                    id="featured-card-image"
                    value={formData.image_url || ""}
                    onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <Label>Icon</Label>
                  <select
                    value={formData.icon_name || "instagram"}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Order Index */}
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.order_index || 100}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 100 }))}
                  />
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_at ? formData.start_at.slice(0, 16) : ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        start_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                      }))}
                    />
                  </div>
                  <div>
                    <Label>End Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_at ? formData.end_at.slice(0, 16) : ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        end_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                      }))}
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Published</Label>
                      <p className="text-sm text-muted-foreground">Make this card visible</p>
                    </div>
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_published: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Visible on Homepage</Label>
                      <p className="text-sm text-muted-foreground">Show on homepage</p>
                    </div>
                    <Switch
                      checked={formData.visible_on_homepage}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, visible_on_homepage: v }))}
                    />
                  </div>
                </div>

                {/* A/B Test Tag */}
                <div>
                  <Label>A/B Test Tag (optional)</Label>
                  <Input
                    value={formData.ab_test_tag || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, ab_test_tag: e.target.value || null }))}
                    placeholder="variant-a"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <Label>Live Preview</Label>
                <Card className="overflow-hidden">
                  <div 
                    className="p-8 relative"
                    style={{ 
                      backgroundImage: formData.image_url ? `url(${formData.image_url})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className={`absolute inset-0 ${formData.gradient_color || 'bg-white/85'}`}></div>
                    <div className="relative z-10 text-center">
                      <Instagram className="h-12 w-12 text-secondary mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-primary mb-2">
                        {getFieldValue("title") || "Card Title"}
                      </h3>
                      <p className="text-foreground/80 mb-4 text-sm">
                        {getFieldValue("subtitle") || "Card subtitle goes here..."}
                      </p>
                      <Button 
                        size="sm" 
                        className="bg-secondary hover:bg-secondary/90 text-white"
                      >
                        {getFieldValue("cta_label") || "CTA Button"}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>

                <div className="text-sm text-muted-foreground">
                  <p><strong>Preview Language:</strong> {activeLocale === "en" ? "English" : "Hindi"}</p>
                  <p><strong>Status:</strong> {formData.is_published ? "Published" : "Draft"}</p>
                  {formData.start_at && (
                    <p><strong>Starts:</strong> {format(new Date(formData.start_at), "PPP")}</p>
                  )}
                  {formData.end_at && (
                    <p><strong>Ends:</strong> {format(new Date(formData.end_at), "PPP")}</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={createCard.isPending || updateCard.isPending}
              >
                {createCard.isPending || updateCard.isPending ? "Saving..." : "Save Card"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Featured Card</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this featured card? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                disabled={deleteCard.isPending}
              >
                {deleteCard.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminFeaturedCardsPage;
