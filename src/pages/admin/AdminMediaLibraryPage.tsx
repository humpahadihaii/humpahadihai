import { useState, useMemo, useRef, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useMediaLibrary, MediaItem, MediaFolder, UploadProgress } from "@/hooks/useMediaLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Upload,
  FolderOpen,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Trash2,
  FolderPlus,
  RefreshCw,
  Eye,
  Copy,
  Check,
  X,
  FileImage,
  Calendar,
  HardDrive,
  Link,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
  CloudUpload,
  ScanSearch,
  Replace,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type SortOption = "newest" | "oldest" | "name" | "size";
type ViewMode = "grid" | "list";

export default function AdminMediaLibraryPage() {
  const {
    mediaItems,
    folders,
    loading,
    uploading,
    uploadQueue,
    fetchMedia,
    fetchFolders,
    uploadMediaBulk,
    updateMedia,
    replaceMedia,
    deleteMedia,
    assignFolder,
    removeFromFolder,
    createFolder,
    scanAndSyncUsage,
    discoverFrontendImages,
    clearUploadQueue,
  } = useMediaLibrary();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [contentTypeFilter, setContentTypeFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<MediaItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editFolders, setEditFolders] = useState<string[]>([]);

  // Filter and sort media
  const filteredMedia = useMemo(() => {
    let items = [...mediaItems];

    // Filter by folder
    if (selectedFolder) {
      if (selectedFolder === "uncategorized") {
        items = items.filter(i => i.folders.length === 0);
      } else {
        items = items.filter(i => i.folders.some(f => f.id === selectedFolder));
      }
    }

    // Filter by content type
    if (contentTypeFilter) {
      items = items.filter(i => i.usage.some(u => u.content_type === contentTypeFilter));
    }

    // Filter by source
    if (sourceFilter) {
      items = items.filter(i => i.source === sourceFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.filename.toLowerCase().includes(q) ||
        i.title?.toLowerCase().includes(q) ||
        i.alt_text?.toLowerCase().includes(q) ||
        i.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name":
        items.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case "size":
        items.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
        break;
      default:
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return items;
  }, [mediaItems, selectedFolder, searchQuery, sortBy, contentTypeFilter, sourceFilter]);

  // Get unique content types for filter
  const contentTypes = useMemo(() => {
    const types = new Set<string>();
    mediaItems.forEach(m => m.usage.forEach(u => types.add(u.content_type)));
    return Array.from(types).sort();
  }, [mediaItems]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/') && 
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (files.length > 0) {
      setUploadModalOpen(true);
      await uploadMediaBulk(files, selectedFolder || undefined);
    }
  }, [uploadMediaBulk, selectedFolder]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const validFiles = Array.from(files).filter(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (validFiles.length > 0) {
      setUploadModalOpen(true);
      await uploadMediaBulk(validFiles, selectedFolder || undefined);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditAltText(item.alt_text || "");
    setEditTags(item.tags?.join(", ") || "");
    setEditNotes(item.admin_notes || "");
    setEditFolders(item.folders.map(f => f.id));
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const tags = editTags.split(",").map(t => t.trim()).filter(Boolean);
    
    await updateMedia(editingItem.id, {
      title: editTitle,
      alt_text: editAltText,
      tags,
      admin_notes: editNotes
    });

    const currentFolderIds = editingItem.folders.map(f => f.id);
    
    for (const folderId of editFolders) {
      if (!currentFolderIds.includes(folderId)) {
        await assignFolder(editingItem.id, folderId);
      }
    }
    
    for (const folderId of currentFolderIds) {
      if (!editFolders.includes(folderId)) {
        await removeFromFolder(editingItem.id, folderId);
      }
    }

    setEditingItem(null);
    await fetchMedia();
    await fetchFolders();
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;
    await deleteMedia(item.id);
    await fetchMedia();
    await fetchFolders();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName);
    setNewFolderName("");
    setNewFolderDialog(false);
    await fetchFolders();
  };

  const handleReplace = (item: MediaItem) => {
    setReplaceTarget(item);
    setReplaceModalOpen(true);
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTarget) return;

    await replaceMedia(replaceTarget.id, file);
    setReplaceModalOpen(false);
    setReplaceTarget(null);
    await fetchMedia();

    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  const handleScanUsage = async () => {
    setIsScanning(true);
    await scanAndSyncUsage();
    setIsScanning(false);
  };

  const handleDiscoverImages = async () => {
    setIsDiscovering(true);
    await discoverFrontendImages();
    setIsDiscovering(false);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending': return <Loader2 className="h-4 w-4 text-muted-foreground" />;
      case 'uploading': return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <AdminLayout>
      <div 
        className="flex h-[calc(100vh-4rem)]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        ref={dropZoneRef}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-primary rounded-lg m-2">
            <div className="text-center">
              <CloudUpload className="h-16 w-16 mx-auto text-primary mb-4" />
              <p className="text-xl font-semibold text-primary">Drop images here</p>
              <p className="text-sm text-muted-foreground">JPG, PNG, or WEBP</p>
            </div>
          </div>
        )}

        {/* Sidebar - Folders */}
        <div className="w-64 border-r border-border bg-muted/30 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Folders
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {/* All Images */}
              <button
                onClick={() => setSelectedFolder(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  !selectedFolder
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="flex-1 text-left">All Images</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {mediaItems.length}
                </Badge>
              </button>

              {/* System Folders */}
              {folders.filter(f => f.is_system).map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedFolder === folder.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {folder.item_count || 0}
                  </Badge>
                </button>
              ))}

              {/* Custom Folders */}
              {folders.filter(f => !f.is_system).length > 0 && (
                <>
                  <div className="pt-4 pb-2 px-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Custom Folders
                    </span>
                  </div>
                  {folders.filter(f => !f.is_system).map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                        selectedFolder === folder.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {folder.item_count || 0}
                      </Badge>
                    </button>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t border-border space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setNewFolderDialog(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleScanUsage}
              disabled={isScanning}
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Scan Usage
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleDiscoverImages}
              disabled={isDiscovering}
            >
              {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              Discover Images
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-border bg-background">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={contentTypeFilter || "all"} onValueChange={v => setContentTypeFilter(v === "all" ? null : v)}>
                <SelectTrigger className="w-40">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {contentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceFilter || "all"} onValueChange={v => setSourceFilter(v === "all" ? null : v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="frontend-detected">Detected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <FileImage className="h-4 w-4" />
                </Button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <button onClick={() => setSelectedFolder(null)} className="hover:text-foreground">
                All Images
              </button>
              {selectedFolder && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">
                    {folders.find(f => f.id === selectedFolder)?.name || "Folder"}
                  </span>
                </>
              )}
              <span className="ml-auto">
                {filteredMedia.length} image{filteredMedia.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Media Grid/List */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No images found</p>
                <p className="text-sm mb-4">Upload images or discover frontend images</p>
                <div className="flex gap-2">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="outline" onClick={handleDiscoverImages}>
                    <ScanSearch className="h-4 w-4 mr-2" />
                    Discover
                  </Button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredMedia.map(item => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={setPreviewItem}
                    onCopyUrl={copyUrl}
                    onReplace={handleReplace}
                    copiedUrl={copiedUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedia.map(item => (
                  <MediaListItem
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={setPreviewItem}
                    onCopyUrl={copyUrl}
                    onReplace={handleReplace}
                    copiedUrl={copiedUrl}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Upload Progress Modal */}
      <Dialog open={uploadModalOpen && uploadQueue.length > 0} onOpenChange={open => {
        if (!open && !uploading) {
          setUploadModalOpen(false);
          clearUploadQueue();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Uploading Files
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {uploadQueue.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-1 mt-1" />
                  )}
                  {item.status === 'failed' && item.error && (
                    <p className="text-xs text-destructive mt-1">{item.error}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(item.file.size)}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadModalOpen(false);
                clearUploadQueue();
              }}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Modal */}
      <Dialog open={replaceModalOpen} onOpenChange={setReplaceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Replace className="h-5 w-5" />
              Replace Image
            </DialogTitle>
          </DialogHeader>
          {replaceTarget && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={replaceTarget.file_url}
                    alt={replaceTarget.alt_text || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{replaceTarget.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    Used in {replaceTarget.usage.length} location{replaceTarget.usage.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <CloudUpload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Select a new image to replace this one
                </p>
                <input
                  type="file"
                  ref={replaceInputRef}
                  onChange={handleReplaceFile}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <Button onClick={() => replaceInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The new image will replace the old one everywhere it's used.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplaceModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={open => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="w-40 h-40 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={editingItem.file_url}
                    alt={editingItem.alt_text || ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="Image title"
                    />
                  </div>
                  <div>
                    <Label>Alt Text</Label>
                    <Textarea
                      value={editAltText}
                      onChange={e => setEditAltText(e.target.value)}
                      placeholder="Describe the image for accessibility"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  placeholder="landscape, mountains, nature"
                />
              </div>

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Internal notes (not visible to public)"
                  rows={2}
                />
              </div>

              <div>
                <Label>Folders</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {folders.map(folder => (
                    <Badge
                      key={folder.id}
                      variant={editFolders.includes(folder.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setEditFolders(prev =>
                          prev.includes(folder.id)
                            ? prev.filter(id => id !== folder.id)
                            : [...prev, folder.id]
                        );
                      }}
                    >
                      {folder.name}
                      {editFolders.includes(folder.id) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {editingItem.source === 'uploaded' ? (
                    <UploadCloud className="h-4 w-4 text-primary" />
                  ) : (
                    <Globe className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">
                    {editingItem.source === 'uploaded' ? 'Uploaded' : 'Frontend Detected'}
                  </span>
                </div>
                {editingItem.usage.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span className="text-sm">{editingItem.usage.length} usage{editingItem.usage.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {editingItem.usage.length > 0 && (
                <div>
                  <Label>Used In</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingItem.usage.map(u => (
                      <Badge key={u.id} variant="secondary">
                        <MapPin className="h-3 w-3 mr-1" />
                        {u.content_type.replace(/_/g, ' ')} {u.page_slug && `• ${u.page_slug}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={open => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title || previewItem?.filename}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-[60vh]">
                <img
                  src={previewItem.file_url}
                  alt={previewItem.alt_text || ""}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File Size</span>
                  <p className="font-medium">{formatFileSize(previewItem.file_size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <p className="font-medium">{previewItem.file_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded</span>
                  <p className="font-medium">
                    {format(new Date(previewItem.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Used In</span>
                  <p className="font-medium">{previewItem.usage.length} locations</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Source</span>
                  <p className="font-medium flex items-center gap-1">
                    {previewItem.source === 'uploaded' ? (
                      <>
                        <UploadCloud className="h-3 w-3" /> Uploaded
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3" /> Detected
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input value={previewItem.file_url} readOnly className="flex-1" />
                <Button variant="outline" onClick={() => copyUrl(previewItem.file_url)}>
                  {copiedUrl === previewItem.file_url ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Folder Name</Label>
            <Input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="My Folder"
              onKeyDown={e => e.key === "Enter" && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Media Card Component
function MediaCard({
  item,
  onEdit,
  onDelete,
  onPreview,
  onCopyUrl,
  onReplace,
  copiedUrl,
}: {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  onPreview: (item: MediaItem) => void;
  onCopyUrl: (url: string) => void;
  onReplace: (item: MediaItem) => void;
  copiedUrl: string | null;
}) {
  return (
    <Card className="group overflow-hidden">
      <div
        className="relative aspect-square cursor-pointer"
        onClick={() => onPreview(item)}
      >
        <img
          src={item.file_url}
          alt={item.alt_text || item.filename}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-8 w-8 text-white" />
          </div>
        </div>
        
        {/* Source badge */}
        <div className="absolute top-2 left-2 flex gap-1">
          {item.source === 'frontend-detected' && (
            <Badge className="bg-orange-500/80 text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Detected
            </Badge>
          )}
          {item.usage.length > 0 && (
            <Badge className="bg-primary/80 text-xs">
              {item.usage.length} use{item.usage.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReplace(item)}>
              <Replace className="h-4 w-4 mr-2" />
              Replace Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyUrl(item.file_url)}>
              {copiedUrl === item.file_url ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="p-2">
        <p className="text-xs truncate text-muted-foreground">{item.filename}</p>
      </CardContent>
    </Card>
  );
}

// Media List Item Component
function MediaListItem({
  item,
  onEdit,
  onDelete,
  onPreview,
  onCopyUrl,
  onReplace,
  copiedUrl,
  formatFileSize,
}: {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  onPreview: (item: MediaItem) => void;
  onCopyUrl: (url: string) => void;
  onReplace: (item: MediaItem) => void;
  copiedUrl: string | null;
  formatFileSize: (bytes: number | null) => string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => onPreview(item)}
        >
          <img
            src={item.file_url}
            alt={item.alt_text || item.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{item.title || item.filename}</p>
            {item.source === 'frontend-detected' && (
              <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                <Globe className="h-3 w-3 mr-1" />
                Detected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(item.file_size)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(item.created_at), "MMM d, yyyy")}
            </span>
            {item.usage.length > 0 && (
              <span className="flex items-center gap-1">
                <Link className="h-3 w-3" />
                {item.usage.length} use{item.usage.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {item.folders.slice(0, 2).map(f => (
            <Badge key={f.id} variant="outline" className="text-xs">
              {f.name}
            </Badge>
          ))}
          {item.folders.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{item.folders.length - 2}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onCopyUrl(item.file_url)}>
            {copiedUrl === item.file_url ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onReplace(item)}>
            <Replace className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}