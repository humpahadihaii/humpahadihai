import { CheckCircle, AlertTriangle, XCircle, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MediaAsset, ImportError } from "@/hooks/useMediaImport";
import * as XLSX from "xlsx";

interface ValidationResultsProps {
  assets: MediaAsset[];
  errors: ImportError[];
  warningCount: number;
  errorCount: number;
  getPublicUrl: (path: string, bucket?: string) => string;
  onRevalidate: () => void;
  processing: boolean;
}

export function ValidationResults({
  assets,
  errors,
  warningCount,
  errorCount,
  getPublicUrl,
  onRevalidate,
  processing,
}: ValidationResultsProps) {
  const validCount = assets.filter(a => a.validation_status === "valid").length;
  const assetsWithIssues = assets.filter(a => a.validation_errors && a.validation_errors.length > 0);

  const downloadErrorReport = () => {
    if (assetsWithIssues.length === 0) return;

    const reportData = assetsWithIssues.map(asset => ({
      filename: asset.original_filename,
      title: asset.title || "",
      section: asset.entity_type || "unlinked",
      status: asset.validation_status,
      issues: asset.validation_errors?.join("; ") || "",
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Validation Issues");
    XLSX.writeFile(wb, `validation-report-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Group errors by type
  const errorsByType: Record<string, MediaAsset[]> = {};
  assetsWithIssues.forEach(asset => {
    asset.validation_errors?.forEach(err => {
      if (!errorsByType[err]) {
        errorsByType[err] = [];
      }
      errorsByType[err].push(asset);
    });
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-600" />
            <p className="text-4xl font-bold text-green-600">{validCount}</p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">Ready to Import</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-yellow-600" />
            <p className="text-4xl font-bold text-yellow-600">{warningCount}</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">With Warnings</p>
            <p className="text-xs text-muted-foreground mt-1">Can still import</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-10 w-10 mx-auto mb-3 text-red-600" />
            <p className="text-4xl font-bold text-red-600">{errorCount}</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">Errors</p>
            <p className="text-xs text-muted-foreground mt-1">Needs fixing</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRevalidate} disabled={processing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${processing ? "animate-spin" : ""}`} />
          Re-validate All
        </Button>
        {assetsWithIssues.length > 0 && (
          <Button variant="outline" onClick={downloadErrorReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>

      {/* Issues Breakdown */}
      {Object.keys(errorsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues by Type</CardTitle>
            <CardDescription>
              Click to expand and see affected files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(errorsByType).map(([issueType, affectedAssets]) => (
                <AccordionItem key={issueType} value={issueType} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge 
                        variant={issueType.toLowerCase().includes("error") ? "destructive" : "outline"}
                        className="shrink-0"
                      >
                        {affectedAssets.length}
                      </Badge>
                      <span className="text-sm font-medium">{issueType}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2 py-2">
                        {affectedAssets.map(asset => (
                          <div key={asset.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                            <img
                              src={getPublicUrl(asset.storage_path, "media-imports")}
                              alt={asset.title || asset.filename}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{asset.original_filename}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {asset.entity_type || "unlinked"} • {asset.title || "No title"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* All Clear State */}
      {assetsWithIssues.length === 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">All Clear!</h3>
            <p className="text-muted-foreground mt-2">
              All {assets.length} files passed validation and are ready to import.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Helpful Tips */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Common Issues & Solutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• <strong>No entity linked:</strong> Assign a section (Village, District, etc.) in the mapping step</li>
            <li>• <strong>Missing title:</strong> Add a descriptive title for better SEO and accessibility</li>
            <li>• <strong>Possible duplicate:</strong> File with same content already exists - consider skipping</li>
            <li>• <strong>Invalid coordinates:</strong> Check latitude (0-90) and longitude (-180 to 180) values</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
