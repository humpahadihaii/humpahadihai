import { useState, useCallback } from "react";
import { 
  Eye, 
  Pencil, 
  Save, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Image as ImageIcon,
  Tag,
  MapPin,
  Languages,
  FolderOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaAsset } from "@/hooks/useMediaImport";
import { cn } from "@/lib/utils";

const SECTION_OPTIONS = [
  { value: "unlinked", label: "Unlinked", icon: FolderOpen },
  { value: "village", label: "Village" },
  { value: "district", label: "District" },
  { value: "provider", label: "Marketplace Provider" },
  { value: "listing", label: "Listing" },
  { value: "event", label: "Event" },
  { value: "product", label: "Product" },
  { value: "gallery", label: "Gallery" },
  { value: "slider", label: "Homepage Slider" },
  { value: "festival", label: "Festival Collection" },
  { value: "article", label: "Article Gallery" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

interface MetadataEditorProps {
  assets: MediaAsset[];
  selectedAssets: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onUpdateAsset: (id: string, data: Partial<MediaAsset>) => Promise<void>;
  onBulkUpdate: (updates: Array<{ id: string } & Partial<MediaAsset>>) => Promise<void>;
  getPublicUrl: (path: string, bucket?: string) => string;
  filter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MetadataEditor({
  assets,
  selectedAssets,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onUpdateAsset,
  onBulkUpdate,
  getPublicUrl,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: MetadataEditorProps) {
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [bulkSection, setBulkSection] = useState("");
  const [bulkLanguage, setBulkLanguage] = useState("");
  const [bulkTags, setBulkTags] = useState("");
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    // Status filter
    if (filter === "unmapped" && asset.entity_type && asset.entity_type !== "unlinked") return false;
    if (filter === "warnings" && asset.validation_status !== "warning") return false;
    if (filter === "errors" && asset.validation_status !== "error") return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        asset.original_filename.toLowerCase().includes(query) ||
        asset.title?.toLowerCase().includes(query) ||
        asset.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleBulkApply = useCallback(async () => {
    if (selectedAssets.size === 0) return;

    const updates = Array.from(selectedAssets).map(id => ({
      id,
      ...(bulkSection && { entity_type: bulkSection }),
      ...(bulkLanguage && { language: bulkLanguage }),
      ...(bulkTags && { tags: bulkTags.split(",").map(t => t.trim()).filter(Boolean) }),
    }));

    await onBulkUpdate(updates);
    setBulkSection("");
    setBulkLanguage("");
    setBulkTags("");
  }, [selectedAssets, bulkSection, bulkLanguage, bulkTags, onBulkUpdate]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingAsset) return;
    await onUpdateAsset(editingAsset.id, editingAsset);
    setEditingAsset(null);
  }, [editingAsset, onUpdateAsset]);

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedAssets.size > 0 && (
        <div className="sticky top-0 z-10 bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {selectedAssets.size} selected
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClearSelection}>
                Clear
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Select value={bulkSection} onValueChange={setBulkSection}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select value={bulkLanguage} onValueChange={setBulkLanguage}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tags (comma-separated)"
                value={bulkTags}
                onChange={(e) => setBulkTags(e.target.value)}
                className="w-[200px] h-8"
              />
            </div>

            <Button size="sm" onClick={handleBulkApply} disabled={!bulkSection && !bulkLanguage && !bulkTags}>
              Apply to Selected
            </Button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({assets.length})</SelectItem>
            <SelectItem value="unmapped">Unmapped</SelectItem>
            <SelectItem value="warnings">Warnings</SelectItem>
            <SelectItem value="errors">Errors</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[250px]"
        />

        <Button variant="outline" size="sm" onClick={onSelectAll}>
          Select All ({filteredAssets.length})
        </Button>
      </div>

      {/* Assets Grid */}
      <ScrollArea className="h-[500px] border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              selected={selectedAssets.has(asset.id)}
              onToggle={() => onToggleSelect(asset.id)}
              onEdit={() => setEditingAsset(asset)}
              onPreview={() => setPreviewAsset(asset)}
              getPublicUrl={getPublicUrl}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Metadata</DialogTitle>
          </DialogHeader>
          
          {editingAsset && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={getPublicUrl(editingAsset.storage_path, "media-imports")}
                  alt={editingAsset.title || editingAsset.filename}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingAsset.title || ""}
                      onChange={(e) => setEditingAsset({ ...editingAsset, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Alt Text</Label>
                    <Input
                      value={editingAsset.alt_text || ""}
                      onChange={(e) => setEditingAsset({ ...editingAsset, alt_text: e.target.value })}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Section</Label>
                  <Select
                    value={editingAsset.entity_type || "unlinked"}
                    onValueChange={(v) => setEditingAsset({ ...editingAsset, entity_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select
                    value={(editingAsset as unknown as Record<string, unknown>).language as string || "en"}
                    onValueChange={(v) => setEditingAsset({ ...editingAsset, language: v } as unknown as MediaAsset)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Caption</Label>
                <Textarea
                  value={editingAsset.caption || ""}
                  onChange={(e) => setEditingAsset({ ...editingAsset, caption: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Credit</Label>
                  <Input
                    value={editingAsset.credit || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, credit: e.target.value })}
                    placeholder="Photo credit"
                  />
                </div>
                <div>
                  <Label>Tags</Label>
                  <Input
                    value={editingAsset.tags?.join(", ") || ""}
                    onChange={(e) => setEditingAsset({ 
                      ...editingAsset, 
                      tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) 
                    })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Latitude
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={editingAsset.geolat || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, geolat: parseFloat(e.target.value) || null })}
                    placeholder="30.12345"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Longitude
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={editingAsset.geolng || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, geolng: parseFloat(e.target.value) || null })}
                    placeholder="79.12345"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAsset(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewAsset?.title || previewAsset?.original_filename}</DialogTitle>
          </DialogHeader>
          {previewAsset && (
            <div className="space-y-4">
              <img
                src={getPublicUrl(previewAsset.storage_path, "media-imports")}
                alt={previewAsset.title || previewAsset.filename}
                className="w-full max-h-[60vh] object-contain rounded-lg bg-muted"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Filename</p>
                  <p className="font-medium">{previewAsset.original_filename}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{((previewAsset.size_bytes || 0) / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Section</p>
                  <p className="font-medium">{previewAsset.entity_type || "Unlinked"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {previewAsset.tags?.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    )) || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Asset Card Component
function AssetCard({
  asset,
  selected,
  onToggle,
  onEdit,
  onPreview,
  getPublicUrl,
}: {
  asset: MediaAsset;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onPreview: () => void;
  getPublicUrl: (path: string, bucket?: string) => string;
}) {
  const statusIcon = {
    valid: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div
      className={cn(
        "group relative bg-card border rounded-lg overflow-hidden transition-all",
        selected && "ring-2 ring-primary"
      )}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox checked={selected} onCheckedChange={onToggle} />
      </div>

      {/* Status */}
      {asset.validation_status && asset.validation_status !== "pending" && (
        <div className="absolute top-2 right-2 z-10">
          {statusIcon[asset.validation_status as keyof typeof statusIcon]}
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-video bg-muted">
        <img
          src={getPublicUrl(asset.storage_path, "media-imports")}
          alt={asset.title || asset.filename}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={onPreview}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="font-medium text-sm truncate" title={asset.title || asset.original_filename}>
          {asset.title || asset.original_filename}
        </p>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {asset.entity_type || "unlinked"}
          </Badge>
          {asset.tags?.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {asset.tags && asset.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{asset.tags.length - 2}</span>
          )}
        </div>

        {asset.validation_errors && asset.validation_errors.length > 0 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">
            {asset.validation_errors[0]}
          </p>
        )}
      </div>
    </div>
  );
}
