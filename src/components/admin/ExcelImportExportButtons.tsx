import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ExcelImportExportButtonsProps {
  onExport: () => void;
  onImportClick: () => void;
  exporting?: boolean;
  importing?: boolean;
  disabled?: boolean;
}

export function ExcelImportExportButtons({
  onExport,
  onImportClick,
  exporting = false,
  importing = false,
  disabled = false,
}: ExcelImportExportButtonsProps) {
  const { roles } = useAuth();

  // Only SUPER_ADMIN, ADMIN, CONTENT_MANAGER can import
  const adminRoles = ["super_admin", "admin", "content_manager"];
  const canImport = roles.some(r => adminRoles.includes(r));
  // EDITOR can export only
  const canExport = canImport || roles.includes("editor");

  if (!canExport) return null;

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        disabled={disabled || exporting}
      >
        {exporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export
      </Button>
      
      {canImport && (
        <Button
          variant="default"
          size="sm"
          onClick={onImportClick}
          disabled={disabled || importing}
          className="bg-primary hover:bg-primary/90"
        >
          {importing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Import
        </Button>
      )}
    </div>
  );
}
