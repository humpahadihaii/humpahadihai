import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import type { ImportResult, ImportPreview } from "@/hooks/useExcelOperations";

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string;
  onDownloadTemplate: () => void;
  onParseFile: (file: File) => Promise<ImportPreview | null>;
  onImport: (file: File) => Promise<ImportResult>;
  onDownloadErrors: (errors: ImportResult["errors"]) => void;
  importing: boolean;
  importProgress: number;
  importResult: ImportResult | null;
  onRefresh: () => void;
}

export function ExcelImportModal({
  open,
  onOpenChange,
  sectionName,
  onDownloadTemplate,
  onParseFile,
  onImport,
  onDownloadErrors,
  importing,
  importProgress,
  importResult,
  onRefresh,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "result">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      return;
    }

    setFile(selectedFile);
    const previewData = await onParseFile(selectedFile);
    if (previewData) {
      setPreview(previewData);
      setStep("preview");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    await onImport(file);
    setStep("result");
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setStep("upload");
    onOpenChange(false);
    if (importResult && (importResult.inserted > 0 || importResult.updated > 0)) {
      onRefresh();
    }
  };

  const resetToUpload = () => {
    setFile(null);
    setPreview(null);
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {sectionName}</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import or update records
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Select an Excel file (.xlsx) to import
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="max-w-xs mx-auto"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tips:</strong>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Use the template to ensure correct column headers</li>
                  <li>Leave ID blank for new records, provide ID to update existing</li>
                  <li>For related records, you can use either ID or Name</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4 py-4">
            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <Badge variant="secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{preview.totalRows}</p>
                <p className="text-xs text-muted-foreground">Total Rows</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{preview.newRows}</p>
                <p className="text-xs text-muted-foreground">New Records</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{preview.updateRows}</p>
                <p className="text-xs text-muted-foreground">Updates</p>
              </div>
            </div>

            <div className="text-sm font-medium">Preview (First 5 rows):</div>
            <div className="border rounded-lg overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.headers.slice(0, 6).map((header) => (
                      <TableHead key={header} className="text-xs whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                    {preview.headers.length > 6 && (
                      <TableHead className="text-xs">...</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.previewData.map((row, idx) => (
                    <TableRow key={idx}>
                      {preview.headers.slice(0, 6).map((header) => (
                        <TableCell key={header} className="text-xs truncate max-w-32">
                          {String(row[header] ?? "")}
                        </TableCell>
                      ))}
                      {preview.headers.length > 6 && (
                        <TableCell className="text-xs">...</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                This action cannot be undone. Records with matching IDs will be updated.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "importing" && (
          <div className="space-y-4 py-8 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Importing...</p>
            <Progress value={importProgress} className="max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground">
              {Math.round(importProgress)}% complete
            </p>
          </div>
        )}

        {step === "result" && importResult && (
          <div className="space-y-4 py-4">
            <div className="text-center py-4">
              {importResult.errors.length === 0 ? (
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
              ) : (
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
              )}
              <p className="text-lg font-medium">Import Complete</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {importResult.inserted}
                </p>
                <p className="text-xs text-muted-foreground">Inserted</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {importResult.updated}
                </p>
                <p className="text-xs text-muted-foreground">Updated</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {importResult.skipped}
                </p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-600">
                    {importResult.errors.length} rows had errors
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownloadErrors(importResult.errors)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Error Report
                  </Button>
                </div>
                <div className="border rounded-lg max-h-32 overflow-auto">
                  {importResult.errors.slice(0, 5).map((error, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 text-xs border-b last:border-0"
                    >
                      <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      <span className="font-medium">Row {error.row}:</span>
                      <span className="text-muted-foreground truncate">
                        {error.message}
                      </span>
                    </div>
                  ))}
                  {importResult.errors.length > 5 && (
                    <div className="p-2 text-xs text-center text-muted-foreground">
                      ...and {importResult.errors.length - 5} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={resetToUpload}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                Confirm Import
              </Button>
            </>
          )}
          {step === "result" && (
            <>
              <Button variant="outline" onClick={resetToUpload}>
                Import Another
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
