import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExcelColumn {
  key: string;
  header: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "date";
  transform?: (value: any) => any;
  reverseTransform?: (value: any) => any;
}

export interface RelationalLookup {
  key: string; // e.g., "district_id"
  nameKey: string; // e.g., "district_name"
  table: string;
  nameField: string;
  idField?: string;
}

export interface ExcelConfig {
  tableName: string;
  sheetName: string;
  columns: ExcelColumn[];
  lookups?: RelationalLookup[];
  primaryKey?: string;
}

export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string; data?: Record<string, any> }>;
}

export interface ImportPreview {
  totalRows: number;
  newRows: number;
  updateRows: number;
  previewData: Record<string, any>[];
  headers: string[];
}

export function useExcelOperations(config: ExcelConfig) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Build lookup maps for relational fields
  const buildLookupMaps = useCallback(async () => {
    const lookupMaps: Record<string, Record<string, string>> = {};
    const reverseLookupMaps: Record<string, Record<string, string>> = {};

    if (!config.lookups) return { lookupMaps, reverseLookupMaps };

    for (const lookup of config.lookups) {
      const { data } = await supabase
        .from(lookup.table as any)
        .select(`${lookup.idField || "id"}, ${lookup.nameField}`);

      if (data) {
        lookupMaps[lookup.key] = {};
        reverseLookupMaps[lookup.key] = {};
        (data as any[]).forEach((item: any) => {
          const id = item[lookup.idField || "id"];
          const name = item[lookup.nameField];
          lookupMaps[lookup.key][name?.toLowerCase?.() || ""] = id;
          reverseLookupMaps[lookup.key][id] = name;
        });
      }
    }

    return { lookupMaps, reverseLookupMaps };
  }, [config.lookups]);

  // Export to Excel
  const exportToExcel = useCallback(async (data: any[], filename?: string) => {
    setExporting(true);
    try {
      const { reverseLookupMaps } = await buildLookupMaps();

      // Transform data for export
      const exportData = data.map((row) => {
        const exportRow: Record<string, any> = {};

        config.columns.forEach((col) => {
          let value = row[col.key];

          // Apply reverse transform if exists
          if (col.reverseTransform) {
            value = col.reverseTransform(value);
          }

          // Handle booleans
          if (col.type === "boolean") {
            value = value ? "TRUE" : "FALSE";
          }

          // Handle dates
          if (col.type === "date" && value) {
            value = new Date(value).toISOString().split("T")[0];
          }

          exportRow[col.header] = value ?? "";
        });

        // Add relational name columns
        config.lookups?.forEach((lookup) => {
          const id = row[lookup.key];
          if (id && reverseLookupMaps[lookup.key]) {
            exportRow[lookup.nameKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())] = 
              reverseLookupMaps[lookup.key][id] || "";
          }
        });

        return exportRow;
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, config.sheetName);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      // Generate filename
      const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const defaultFilename = `hum-pahadi-haii-${config.sheetName.toLowerCase().replace(/\s+/g, "-")}-${date}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename || defaultFilename);
      toast.success(`Exported ${data.length} records`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  }, [config, buildLookupMaps]);

  // Download template
  const downloadTemplate = useCallback(() => {
    const headers: Record<string, string> = {};
    
    config.columns.forEach((col) => {
      headers[col.header] = "";
    });

    // Add relational name columns
    config.lookups?.forEach((lookup) => {
      const headerName = lookup.nameKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      headers[headerName] = "";
    });

    const ws = XLSX.utils.json_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, config.sheetName);

    // Add column widths
    const colWidths = Object.keys(headers).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `${config.sheetName.toLowerCase().replace(/\s+/g, "-")}-template.xlsx`);
    toast.success("Template downloaded");
  }, [config]);

  // Parse Excel file
  const parseExcelFile = useCallback(async (file: File): Promise<ImportPreview | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Record<string, any>[];

          if (jsonData.length === 0) {
            toast.error("Excel file is empty");
            resolve(null);
            return;
          }

          const headers = Object.keys(jsonData[0]);
          
          // Check for existing records by ID
          const idsInFile = jsonData
            .filter((row) => row["ID"] || row["id"])
            .map((row) => row["ID"] || row["id"]);

          let existingIds: string[] = [];
          if (idsInFile.length > 0) {
            const { data: existing } = await supabase
              .from(config.tableName as any)
              .select(config.primaryKey || "id")
              .in(config.primaryKey || "id", idsInFile);
            
            existingIds = (existing as any[] || []).map((r: any) => r[config.primaryKey || "id"]);
          }

          const newRows = jsonData.filter((row) => {
            const id = row["ID"] || row["id"];
            return !id || !existingIds.includes(id);
          }).length;

          resolve({
            totalRows: jsonData.length,
            newRows,
            updateRows: jsonData.length - newRows,
            previewData: jsonData.slice(0, 5),
            headers,
          });
        } catch (error) {
          console.error("Parse error:", error);
          toast.error("Failed to parse Excel file");
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }, [config.tableName, config.primaryKey]);

  // Import from Excel
  const importFromExcel = useCallback(async (file: File): Promise<ImportResult> => {
    setImporting(true);
    setImportProgress(0);
    setImportResult(null);

    const result: ImportResult = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    try {
      const { lookupMaps } = await buildLookupMaps();

      const data = await new Promise<Record<string, any>[]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          resolve(XLSX.utils.sheet_to_json(worksheet, { defval: "" }));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      // Create header to column key map
      const headerToKey: Record<string, string> = {};
      config.columns.forEach((col) => {
        headerToKey[col.header.toLowerCase()] = col.key;
      });

      // Process rows in batches
      const BATCH_SIZE = 100;
      const totalBatches = Math.ceil(data.length / BATCH_SIZE);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batch = data.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
        const rowsToUpsert: any[] = [];

        for (let i = 0; i < batch.length; i++) {
          const rowIndex = batchIndex * BATCH_SIZE + i + 2; // +2 for Excel row number (1-indexed + header)
          const row = batch[i];

          try {
            const record: Record<string, any> = {};
            let hasError = false;

            // Map Excel columns to database fields
            for (const col of config.columns) {
              // Find matching header (case-insensitive)
              let value: any;
              for (const [header, val] of Object.entries(row)) {
                if (header.toLowerCase() === col.header.toLowerCase()) {
                  value = val;
                  break;
                }
              }

              // Check required fields
              if (col.required && (value === undefined || value === null || value === "")) {
                result.errors.push({
                  row: rowIndex,
                  message: `Missing required field: ${col.header}`,
                  data: row,
                });
                hasError = true;
                break;
              }

              // Transform value based on type
              if (value !== undefined && value !== null && value !== "") {
                if (col.type === "boolean") {
                  value = value === "TRUE" || value === true || value === 1 || value === "1" || value === "yes";
                } else if (col.type === "number") {
                  value = parseFloat(String(value).replace(/,/g, "")) || null;
                } else if (col.transform) {
                  value = col.transform(value);
                }
              } else {
                value = null;
              }

              record[col.key] = value;
            }

            if (hasError) {
              result.skipped++;
              continue;
            }

            // Resolve relational lookups by name
            if (config.lookups) {
              for (const lookup of config.lookups) {
                // If ID is not provided, try to resolve by name
                if (!record[lookup.key]) {
                  const nameHeaderKey = lookup.nameKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  let nameValue: string | undefined;
                  
                  for (const [header, val] of Object.entries(row)) {
                    if (header.toLowerCase() === nameHeaderKey.toLowerCase() || 
                        header.toLowerCase() === lookup.nameKey.toLowerCase()) {
                      nameValue = String(val).toLowerCase();
                      break;
                    }
                  }

                  if (nameValue && lookupMaps[lookup.key]) {
                    record[lookup.key] = lookupMaps[lookup.key][nameValue] || null;
                    
                    if (!record[lookup.key]) {
                      result.errors.push({
                        row: rowIndex,
                        message: `Could not find ${lookup.table} with name: ${nameValue}`,
                        data: row,
                      });
                      hasError = true;
                    }
                  }
                }
              }
            }

            if (!hasError) {
              rowsToUpsert.push(record);
            } else {
              result.skipped++;
            }
          } catch (error: any) {
            result.errors.push({
              row: rowIndex,
              message: error.message || "Unknown error",
              data: row,
            });
            result.skipped++;
          }
        }

        // Upsert batch
        if (rowsToUpsert.length > 0) {
          const { data: upserted, error } = await supabase
            .from(config.tableName as any)
            .upsert(rowsToUpsert as any, { 
              onConflict: config.primaryKey || "id",
              ignoreDuplicates: false,
            })
            .select();

          if (error) {
            console.error("Upsert error:", error);
            rowsToUpsert.forEach((_, idx) => {
              result.errors.push({
                row: batchIndex * BATCH_SIZE + idx + 2,
                message: error.message,
              });
            });
            result.skipped += rowsToUpsert.length;
          } else {
            result.inserted += (upserted as any[] || []).length || rowsToUpsert.length;
          }
        }

        setImportProgress(((batchIndex + 1) / totalBatches) * 100);
      }

      setImportResult(result);

      if (result.inserted > 0 || result.updated > 0) {
        toast.success(`Imported ${result.inserted + result.updated} records`);
      }
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} rows had errors`);
      }

      return result;
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("Import failed: " + error.message);
      throw error;
    } finally {
      setImporting(false);
    }
  }, [config, buildLookupMaps]);

  // Download error report
  const downloadErrorReport = useCallback((errors: ImportResult["errors"]) => {
    if (errors.length === 0) return;

    const errorData = errors.map((e) => ({
      "Row Number": e.row,
      "Error Message": e.message,
      ...e.data,
    }));

    const ws = XLSX.utils.json_to_sheet(errorData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");

    XLSX.writeFile(wb, `import-errors-${Date.now()}.xlsx`);
  }, []);

  return {
    exporting,
    importing,
    importProgress,
    importResult,
    exportToExcel,
    downloadTemplate,
    parseExcelFile,
    importFromExcel,
    downloadErrorReport,
    setImportResult,
  };
}
