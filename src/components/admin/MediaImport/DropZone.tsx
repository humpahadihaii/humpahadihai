import { useState, useCallback, useRef } from "react";
import { Upload, X, FileImage, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DropZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  uploading: boolean;
  uploadProgress: number;
  maxFiles?: number;
  maxSize?: number; // in MB
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_SIZE_DEFAULT = 20; // 20MB per file

export function DropZone({
  files,
  onFilesChange,
  uploading,
  uploadProgress,
  maxFiles = 500,
  maxSize = MAX_SIZE_DEFAULT,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((newFiles: File[]): File[] => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    for (const file of newFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        newErrors.push(`${file.name}: Invalid file type`);
        continue;
      }
      if (file.size > maxSize * 1024 * 1024) {
        newErrors.push(`${file.name}: File too large (max ${maxSize}MB)`);
        continue;
      }
      if (files.length + validFiles.length >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }
      validFiles.push(file);
    }

    setErrors(newErrors);
    return validFiles;
  }, [files.length, maxFiles, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  }, [files, onFilesChange, validateFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = validateFiles(selectedFiles);
    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
    // Reset input
    e.target.value = "";
  }, [files, onFilesChange, validateFiles]);

  const removeFile = useCallback((index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  }, [files, onFilesChange]);

  const clearAll = useCallback(() => {
    onFilesChange([]);
    setErrors([]);
  }, [onFilesChange]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          uploading && "pointer-events-none opacity-60"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <div className="text-center">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <p className="text-lg font-medium">
            {isDragging ? "Drop files here" : "Drag & drop images here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse • JPG, PNG, WebP, AVIF, GIF
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxSize}MB per file • Up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
            <AlertCircle className="h-4 w-4" />
            Some files were not added
          </div>
          <ul className="text-xs text-destructive/80 space-y-0.5 ml-6">
            {errors.slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {errors.length > 5 && (
              <li>...and {errors.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Selected Files Preview */}
      {files.length > 0 && !uploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{files.length} files selected</span>
              <span className="text-sm text-muted-foreground">
                ({(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>

          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-3">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
