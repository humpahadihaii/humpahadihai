import { CheckCircle, Save, RotateCcw, Loader2, AlertTriangle, Image, FolderOpen, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MediaAsset, ImportJob } from "@/hooks/useMediaImport";

interface ImportReviewProps {
  assets: MediaAsset[];
  job: ImportJob | null;
  processing: boolean;
  onCommit: () => void;
  onRollback: () => void;
  isSuperAdmin: boolean;
  getPublicUrl: (path: string, bucket?: string) => string;
}

export function ImportReview({
  assets,
  job,
  processing,
  onCommit,
  onRollback,
  isSuperAdmin,
  getPublicUrl,
}: ImportReviewProps) {
  const readyCount = assets.filter(a => a.validation_status === "valid" || a.validation_status === "warning").length;
  const linkedCount = assets.filter(a => a.entity_type && a.entity_type !== "unlinked").length;
  const warningCount = assets.filter(a => a.validation_status === "warning").length;
  
  // Group by section
  const sectionBreakdown: Record<string, number> = {};
  assets.forEach(asset => {
    const section = asset.entity_type || "unlinked";
    sectionBreakdown[section] = (sectionBreakdown[section] || 0) + 1;
  });

  // Group by tags
  const tagCounts: Record<string, number> = {};
  assets.forEach(asset => {
    asset.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Ready to Import
          </CardTitle>
          <CardDescription>
            Review your import before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Image className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-4xl font-bold">{assets.length}</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-green-600">{readyCount}</p>
              <p className="text-sm text-muted-foreground">Ready</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-blue-600">{linkedCount}</p>
              <p className="text-sm text-muted-foreground">Linked</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-600">{warningCount}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Section Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              By Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sectionBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([section, count]) => (
                  <div key={section} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{section}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <Progress value={(count / assets.length) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Tag Cloud */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Top Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                    <span className="ml-1.5 text-muted-foreground">({count})</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sample Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sample Preview</CardTitle>
          <CardDescription>First 12 images from this import</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {assets.slice(0, 12).map(asset => (
                <div key={asset.id} className="aspect-square rounded-lg overflow-hidden bg-muted relative group">
                  <img
                    src={getPublicUrl(asset.storage_path, "media-imports")}
                    alt={asset.title || asset.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <p className="text-[10px] text-white truncate">{asset.title || asset.original_filename}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg" 
          className="flex-1 h-14 text-lg"
          onClick={onCommit} 
          disabled={processing || readyCount === 0}
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Publish {readyCount} Images
            </>
          )}
        </Button>

        {isSuperAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="h-14" disabled={processing}>
                <RotateCcw className="h-5 w-5 mr-2" />
                Rollback
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rollback Import?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {assets.length} uploaded files and their database records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onRollback} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, Rollback Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Warning for unlinked */}
      {assets.length - linkedCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              {assets.length - linkedCount} images are not linked to any section
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              These will be imported but won't appear anywhere on the site until linked. You can link them later from the Media Library.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
