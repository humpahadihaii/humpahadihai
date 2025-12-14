import { CheckCircle, Plus, ExternalLink, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportJob } from "@/hooks/useMediaImport";

interface ImportCompleteProps {
  job: ImportJob | null;
  onStartNew: () => void;
}

export function ImportComplete({ job, onStartNew }: ImportCompleteProps) {
  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-700 dark:text-green-400">
          Import Complete!
        </CardTitle>
        <CardDescription className="text-base">
          Your images have been successfully published
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="flex justify-center gap-8 py-4">
          <div className="text-center">
            <p className="text-4xl font-bold">{job?.success_count || 0}</p>
            <p className="text-sm text-muted-foreground">Published</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-600">{job?.warning_count || 0}</p>
            <p className="text-sm text-muted-foreground">With Warnings</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-red-600">{job?.error_count || 0}</p>
            <p className="text-sm text-muted-foreground">Skipped</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onStartNew} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Start New Import
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/admin/gallery">
              <Image className="h-4 w-4 mr-2" />
              View Media Library
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">What's next?</p>
          <div className="grid sm:grid-cols-2 gap-2">
            <Link 
              to="/admin/site-images" 
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Site Images</p>
                <p className="text-xs text-muted-foreground">Assign to homepage sections</p>
              </div>
            </Link>
            <Link 
              to="/admin/villages" 
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Villages</p>
                <p className="text-xs text-muted-foreground">Link images to village pages</p>
              </div>
            </Link>
            <Link 
              to="/admin/districts" 
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Districts</p>
                <p className="text-xs text-muted-foreground">Add to district galleries</p>
              </div>
            </Link>
            <Link 
              to="/admin/cultural-content" 
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Cultural Content</p>
                <p className="text-xs text-muted-foreground">Use in culture articles</p>
              </div>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
