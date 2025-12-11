import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useVillageLinkJobs } from "@/hooks/useVillageLinkJobs";
import * as XLSX from "xlsx";

interface Props {
  villageId: string;
  villageName: string;
  onImportComplete?: () => void;
}

interface ImportRow {
  item_type: string;
  item_id: string;
  promote?: boolean | string;
  priority?: number | string;
}

interface ValidationResult {
  row: number;
  data: ImportRow;
  valid: boolean;
  errors: string[];
}

export function VillageLinkBulkImport({ villageId, villageName, onImportComplete }: Props) {
  const { bulkImport, isLoading } = useVillageLinkJobs(villageId);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ValidationResult[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; errors: { row: number; error: string }[] } | null>(null);

  const validTypes = ['provider', 'listing', 'package', 'product'];

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ImportRow>(worksheet);

        // Validate rows
        const validated: ValidationResult[] = jsonData.map((row, index) => {
          const errors: string[] = [];
          
          if (!row.item_type) {
            errors.push('Missing item_type');
          } else if (!validTypes.includes(row.item_type.toLowerCase())) {
            errors.push(`Invalid item_type: ${row.item_type}`);
          }
          
          if (!row.item_id) {
            errors.push('Missing item_id');
          } else if (!/^[0-9a-f-]{36}$/i.test(row.item_id)) {
            errors.push('Invalid item_id format (must be UUID)');
          }

          return {
            row: index + 2, // Excel rows start at 1, plus header
            data: {
              ...row,
              item_type: row.item_type?.toLowerCase() || '',
              promote: row.promote === true || row.promote === 'true' || row.promote === 'TRUE',
              priority: parseInt(String(row.priority)) || 0
            },
            valid: errors.length === 0,
            errors
          };
        });

        setPreviewData(validated);
      } catch (err) {
        console.error('Error parsing file:', err);
        setPreviewData([]);
      }
    };
    reader.readAsBinaryString(selectedFile);
  }, []);

  const handleImport = async () => {
    const validRows = previewData.filter(r => r.valid);
    if (validRows.length === 0) return;

    const items = validRows.map(r => ({
      item_type: r.data.item_type,
      item_id: r.data.item_id,
      promote: r.data.promote as boolean,
      priority: r.data.priority as number
    }));

    const result = await bulkImport(items);
    if (result.success && result.data) {
      setImportResult(result.data);
      onImportComplete?.();
    }
  };

  const downloadTemplate = () => {
    const template = [
      { item_type: 'provider', item_id: 'uuid-here', promote: false, priority: 0 },
      { item_type: 'listing', item_id: 'uuid-here', promote: true, priority: 10 },
      { item_type: 'package', item_id: 'uuid-here', promote: false, priority: 5 },
      { item_type: 'product', item_id: 'uuid-here', promote: false, priority: 0 }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Village Links');
    XLSX.writeFile(wb, `village_links_template_${villageName.replace(/\s+/g, '_')}.xlsx`);
  };

  const downloadErrorReport = () => {
    if (!importResult?.errors?.length) return;

    const errorData = importResult.errors.map(e => ({
      row: e.row,
      error: e.error
    }));

    const ws = XLSX.utils.json_to_sheet(errorData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Errors');
    XLSX.writeFile(wb, `import_errors_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const validCount = previewData.filter(r => r.valid).length;
  const errorCount = previewData.filter(r => !r.valid).length;

  return (
    <div className="space-y-6">
      {/* Instructions & Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Village Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload an Excel or CSV file to bulk link items to {villageName}. 
            Download the template to see the required format.
          </p>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> item_type (provider/listing/package/product), item_id (UUID)
              <br />
              <strong>Optional columns:</strong> promote (true/false), priority (number)
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            
            {file && (
              <span className="text-sm text-muted-foreground self-center">
                {file.name}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview ({previewData.length} rows)</CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-green-500">{validCount} valid</Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive">{errorCount} errors</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Row</TableHead>
                    <TableHead className="w-16">Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Promote</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 100).map((row) => (
                    <TableRow key={row.row} className={row.valid ? '' : 'bg-destructive/10'}>
                      <TableCell>{row.row}</TableCell>
                      <TableCell>
                        {row.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{row.data.item_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.data.item_id?.substring(0, 8)}...</TableCell>
                      <TableCell>{row.data.promote ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{row.data.priority}</TableCell>
                      <TableCell className="text-sm text-destructive">
                        {row.errors.join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleImport} 
                disabled={validCount === 0 || isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {validCount} Valid Rows
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{importResult.success} items imported successfully</span>
              </div>
              {importResult.errors?.length > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>{importResult.errors.length} items failed</span>
                </div>
              )}
            </div>

            {importResult.errors?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Some rows failed to import:
                </p>
                <ScrollArea className="h-[150px] border rounded p-2">
                  {importResult.errors.map((err, idx) => (
                    <p key={idx} className="text-sm text-destructive">
                      Row {err.row}: {err.error}
                    </p>
                  ))}
                </ScrollArea>
                <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
