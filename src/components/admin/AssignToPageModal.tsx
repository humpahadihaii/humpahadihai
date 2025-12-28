import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Link2,
  FileImage,
} from "lucide-react";
import { useAssignImageToPage, ContentType, PageOption, ImageField, AssignmentResult } from "@/hooks/useAssignImageToPage";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface AssignToPageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  mediaId: string;
  imageName: string;
  onComplete?: () => void;
}

type Step = "select_type" | "select_pages" | "select_field" | "confirm" | "result";

export function AssignToPageModal({
  open,
  onOpenChange,
  imageUrl,
  mediaId,
  imageName,
  onComplete,
}: AssignToPageModalProps) {
  const {
    loading,
    pages,
    getContentTypes,
    getImageFields,
    fetchPages,
    assignImage,
  } = useAssignImageToPage();

  const [step, setStep] = useState<Step>("select_type");
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPages, setSelectedPages] = useState<PageOption[]>([]);
  const [selectedField, setSelectedField] = useState<ImageField | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [results, setResults] = useState<AssignmentResult[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const contentTypes = useMemo(() => getContentTypes(), [getContentTypes]);
  const imageFields = useMemo(
    () => (contentType ? getImageFields(contentType) : []),
    [contentType, getImageFields]
  );

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("select_type");
      setContentType(null);
      setSearchQuery("");
      setSelectedPages([]);
      setSelectedField(null);
      setResults([]);
    }
  }, [open]);

  // Fetch pages when content type changes or search query changes
  useEffect(() => {
    if (contentType && step === "select_pages") {
      fetchPages(contentType, debouncedSearch);
    }
  }, [contentType, debouncedSearch, step, fetchPages]);

  const handleContentTypeSelect = (type: ContentType) => {
    setContentType(type);
    setSelectedPages([]);
    setSelectedField(null);
    setStep("select_pages");
  };

  const handlePageToggle = (page: PageOption) => {
    setSelectedPages(prev => {
      const exists = prev.some(p => p.id === page.id);
      if (exists) {
        return prev.filter(p => p.id !== page.id);
      } else {
        return [...prev, page];
      }
    });
  };

  const handleFieldSelect = (field: ImageField) => {
    setSelectedField(field);
    setStep("confirm");
  };

  const handleAssign = async () => {
    if (!contentType || selectedPages.length === 0 || !selectedField) return;

    setAssigning(true);
    const pageIds = selectedPages.map(p => p.id);
    const assignmentResults = await assignImage(
      imageUrl,
      mediaId,
      contentType,
      pageIds,
      selectedField.field_name,
      selectedField.is_array
    );
    setResults(assignmentResults);
    setStep("result");
    setAssigning(false);
  };

  const handleClose = () => {
    if (results.some(r => r.success)) {
      onComplete?.();
    }
    onOpenChange(false);
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Assign Image to Page
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Badge variant={step === "select_type" ? "default" : "outline"}>1. Content Type</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === "select_pages" ? "default" : "outline"}>2. Select Pages</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === "select_field" ? "default" : "outline"}>3. Image Field</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === "confirm" || step === "result" ? "default" : "outline"}>4. Confirm</Badge>
        </div>

        {/* Image preview */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
            <img
              src={imageUrl}
              alt={imageName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{imageName}</p>
            <p className="text-xs text-muted-foreground truncate">{imageUrl}</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Step 1: Select Content Type */}
          {step === "select_type" && (
            <div className="space-y-3">
              <Label>Select Content Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {contentTypes.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant="outline"
                    className="h-auto py-3 justify-start"
                    onClick={() => handleContentTypeSelect(value)}
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Pages */}
          {step === "select_pages" && (
            <div className="space-y-3 flex flex-col h-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("select_type")}
                >
                  ← Back
                </Button>
                <Badge variant="outline">
                  {contentTypes.find(t => t.value === contentType)?.label}
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or slug..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="flex-1 border rounded-lg max-h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : pages.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No pages found
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {pages.map(page => {
                      const isSelected = selectedPages.some(p => p.id === page.id);
                      return (
                        <div
                          key={page.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted"
                          )}
                          onClick={() => handlePageToggle(page)}
                        >
                          <Checkbox checked={isSelected} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{page.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              /{page.slug}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {selectedPages.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedPages.length} page{selectedPages.length !== 1 ? "s" : ""} selected
                  </span>
                  <Button onClick={() => setStep("select_field")}>
                    Continue →
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Field */}
          {step === "select_field" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("select_pages")}
                >
                  ← Back
                </Button>
                <Badge variant="outline">
                  {selectedPages.length} page{selectedPages.length !== 1 ? "s" : ""} selected
                </Badge>
              </div>

              <Label>Select Image Field to Update</Label>
              <div className="space-y-2">
                {imageFields.map(field => {
                  // Show current image preview for each field (from first selected page)
                  const firstPage = selectedPages[0];
                  const currentValue = firstPage?.current_images[field.field_name];
                  const hasCurrentImage = currentValue && (
                    Array.isArray(currentValue) ? currentValue.length > 0 : !!currentValue
                  );

                  return (
                    <div
                      key={field.field_name}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors hover:border-primary",
                        selectedField?.field_name === field.field_name && "border-primary bg-primary/5"
                      )}
                      onClick={() => handleFieldSelect(field)}
                    >
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{field.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {field.is_array ? "Gallery (adds to existing)" : "Single image (replaces)"}
                          </p>
                        </div>
                        {hasCurrentImage && (
                          <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                            <img
                              src={Array.isArray(currentValue) ? currentValue[0] : currentValue}
                              alt="Current"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("select_field")}
                  disabled={assigning}
                >
                  ← Back
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <h3 className="font-semibold">Confirm Assignment</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Content Type:</span>
                    <span className="font-medium">
                      {contentTypes.find(t => t.value === contentType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Field:</span>
                    <span className="font-medium">{selectedField?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action:</span>
                    <span className="font-medium">
                      {selectedField?.is_array ? "Add to gallery" : "Replace image"}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Pages to update ({selectedPages.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPages.map(page => (
                      <Badge key={page.id} variant="secondary" className="text-xs">
                        {page.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {step === "result" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                {successCount > 0 && failCount === 0 ? (
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                ) : failCount > 0 && successCount === 0 ? (
                  <AlertCircle className="h-10 w-10 text-destructive" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-yellow-500" />
                )}
                <div>
                  <p className="font-semibold">
                    {successCount > 0 && failCount === 0
                      ? "All assignments successful!"
                      : failCount > 0 && successCount === 0
                      ? "Assignments failed"
                      : "Partial success"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {successCount} succeeded, {failCount} failed
                  </p>
                </div>
              </div>

              <ScrollArea className="max-h-[200px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded text-sm",
                        result.success ? "bg-green-500/10" : "bg-destructive/10"
                      )}
                    >
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="truncate">{result.page_title}</span>
                      {result.error && (
                        <span className="text-xs text-destructive truncate">
                          ({result.error})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={handleClose} disabled={assigning}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={assigning}>
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Confirm & Assign"
                )}
              </Button>
            </>
          )}
          {step === "result" && (
            <Button onClick={handleClose}>Done</Button>
          )}
          {step !== "confirm" && step !== "result" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
