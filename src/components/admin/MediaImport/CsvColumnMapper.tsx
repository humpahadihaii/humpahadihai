import { useState, useCallback, useRef } from "react";
import { FileSpreadsheet, Download, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { CsvMapping } from "@/hooks/useMediaImport";

const FIELD_DEFINITIONS = {
  filename: { label: "Filename", required: true, description: "Must match uploaded file name exactly" },
  entity_type: { label: "Section", required: false, description: "village, district, provider, listing, event, product, gallery" },
  entity_slug_or_id: { label: "Entity ID/Slug", required: false, description: "ID or slug of the linked entity" },
  title: { label: "Title", required: false, description: "Display title for the image" },
  alt_text: { label: "Alt Text", required: false, description: "Accessibility text for screen readers" },
  caption: { label: "Caption", required: false, description: "Short description shown under image" },
  credit: { label: "Credit", required: false, description: "Photo credit / attribution" },
  tags: { label: "Tags", required: false, description: "Semicolon-separated tags (e.g., temple;sunset)" },
  language: { label: "Language", required: false, description: "en (English) or hi (Hindi)" },
  geolat: { label: "Latitude", required: false, description: "GPS latitude (e.g., 30.12345)" },
  geolng: { label: "Longitude", required: false, description: "GPS longitude (e.g., 79.12345)" },
  publish: { label: "Publish", required: false, description: "true or false" },
};

type FieldKey = keyof typeof FIELD_DEFINITIONS;

interface CsvColumnMapperProps {
  onMappingsChange: (mappings: CsvMapping[]) => void;
  mappings: CsvMapping[];
}

export function CsvColumnMapper({ onMappingsChange, mappings }: CsvColumnMapperProps) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, FieldKey | "skip">>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = useCallback(() => {
    const template = [
      {
        filename: "IMG_001.jpg",
        entity_type: "village",
        entity_slug_or_id: "bageshwar",
        title: "Bageshwar Temple View",
        alt_text: "Temple with mountains in background",
        caption: "Sunrise view of the temple",
        credit: "Photo: Raj Kumar",
        tags: "temple;sunrise;mountains",
        language: "en",
        geolat: "30.12345",
        geolng: "79.12345",
        publish: "true"
      },
      {
        filename: "IMG_002.jpg",
        entity_type: "district",
        entity_slug_or_id: "almora",
        title: "Almora Hills",
        alt_text: "Panoramic view of Almora hills",
        caption: "Evening view from Bright End Corner",
        credit: "Hum Pahadi",
        tags: "hills;panorama;sunset",
        language: "en",
        geolat: "29.5892",
        geolng: "79.6530",
        publish: "true"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mapping");
    XLSX.writeFile(wb, "media-import-template.xlsx");
  }, []);

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { header: 1 });
        
        if (jsonData.length < 2) {
          toast.error("CSV must have headers and at least one data row");
          return;
        }

        const headers = (jsonData[0] as unknown as string[]).filter(Boolean);
        const rows = jsonData.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = String((row as unknown as string[])[i] || "");
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v));

        setCsvHeaders(headers);
        setCsvPreview(rows.slice(0, 5));

        // Auto-map columns with matching names
        const autoMapping: Record<string, FieldKey | "skip"> = {};
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase().replace(/[_\s-]/g, "");
          Object.keys(FIELD_DEFINITIONS).forEach(field => {
            if (field.replace("_", "") === lowerHeader || field === lowerHeader) {
              autoMapping[header] = field as FieldKey;
            }
          });
        });
        setColumnMapping(autoMapping);

        toast.success(`Loaded ${rows.length} rows from CSV`);
      } catch {
        toast.error("Failed to parse CSV file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }, []);

  const applyMapping = useCallback(() => {
    if (!csvPreview.length) return;

    const filenameColumn = Object.entries(columnMapping).find(([, v]) => v === "filename")?.[0];
    if (!filenameColumn) {
      toast.error("Filename column is required");
      return;
    }

    // Re-read full CSV and apply mapping
    const fullReader = new FileReader();
    fullReader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

      const mappedData: CsvMapping[] = jsonData.map(row => {
        const mapped: CsvMapping = { filename: "" };
        Object.entries(columnMapping).forEach(([csvCol, field]) => {
          if (field !== "skip" && row[csvCol]) {
            (mapped as unknown as Record<string, string>)[field] = row[csvCol];
          }
        });
        return mapped;
      }).filter(m => m.filename);

      onMappingsChange(mappedData);
      toast.success(`Applied mappings for ${mappedData.length} files`);
    };
  }, [columnMapping, csvPreview.length, onMappingsChange]);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">CSV Metadata Mapping</CardTitle>
              <CardDescription className="text-xs">
                Optional: Upload a CSV to pre-assign metadata to files
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-1" />
              Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Upload CSV
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>
        </div>
      </CardHeader>

      {mappings.length > 0 && csvHeaders.length === 0 && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            {mappings.length} file mappings loaded
          </div>
        </CardContent>
      )}

      {csvHeaders.length > 0 && (
        <CardContent className="space-y-4 pt-0">
          {/* Column Mapping */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Map CSV columns to fields</p>
              <Badge variant="outline">{csvPreview.length} rows preview</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {csvHeaders.map(header => (
                <div key={header} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-medium text-muted-foreground truncate flex-1">
                      {header}
                    </label>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <Select
                    value={columnMapping[header] || "skip"}
                    onValueChange={(v) => setColumnMapping(prev => ({ ...prev, [header]: v as FieldKey | "skip" }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">— Skip —</SelectItem>
                      {Object.entries(FIELD_DEFINITIONS).map(([key, def]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{def.label}</span>
                            {def.required && <Badge variant="destructive" className="text-[10px] px-1">Required</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {csvHeaders.map(header => (
                    <TableHead key={header} className="text-xs py-2">
                      <div className="flex items-center gap-1">
                        {columnMapping[header] && columnMapping[header] !== "skip" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="text-[10px]">
                                  {FIELD_DEFINITIONS[columnMapping[header] as FieldKey]?.label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {FIELD_DEFINITIONS[columnMapping[header] as FieldKey]?.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">{header}</span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvPreview.map((row, i) => (
                  <TableRow key={i}>
                    {csvHeaders.map(header => (
                      <TableCell key={header} className="text-xs py-1.5 max-w-[120px] truncate">
                        {row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button onClick={applyMapping} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Apply Column Mapping
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
