import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAISectionInsert } from "@/hooks/useAISectionInsert";
import { useAuth } from "@/hooks/useAuth";
import {
  SectionKey,
  AIOutputSchema,
  SECTION_MAPPINGS,
  SECTION_GROUPS,
  getSectionMapping,
  mapAIOutputToSection,
  getMissingRequiredFields,
} from "@/lib/aiSectionMappings";
import { supabase } from "@/integrations/supabase/client";

interface AIResultActionsProps {
  aiOutput: AIOutputSchema;
  onSuccess?: (sectionKey: SectionKey, id: string) => void;
}

interface District {
  id: string;
  name: string;
}

export const AIResultActions = ({ aiOutput, onSuccess }: AIResultActionsProps) => {
  const { role, isSuperAdmin, isAdmin } = useAuth();
  const { insertToSection, isInserting } = useAISectionInsert();
  const [selectedSection, setSelectedSection] = useState<SectionKey | "">("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Check if user has permission
  const canSave = isSuperAdmin || isAdmin;

  // Fetch districts for dropdown
  useEffect(() => {
    const fetchDistricts = async () => {
      const { data } = await supabase
        .from("districts")
        .select("id, name")
        .order("name");
      if (data) setDistricts(data);
    };
    fetchDistricts();
  }, []);

  // Update edited data when section changes
  useEffect(() => {
    if (selectedSection) {
      const mapped = mapAIOutputToSection(aiOutput, selectedSection);
      setEditedData(mapped || {});
      const missing = getMissingRequiredFields(mapped || {}, selectedSection);
      setMissingFields(missing);
    }
  }, [selectedSection, aiOutput]);

  const handlePreview = () => {
    if (!selectedSection) return;
    setPreviewOpen(true);
  };

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...editedData, [field]: value };
    setEditedData(newData);
    if (selectedSection) {
      const missing = getMissingRequiredFields(newData, selectedSection);
      setMissingFields(missing);
    }
  };

  const handleSave = async () => {
    if (!selectedSection || !canSave) return;

    const result = await insertToSection(aiOutput, selectedSection, editedData);
    
    if (result.success && result.id) {
      setPreviewOpen(false);
      setSelectedSection("");
      setEditedData({});
      onSuccess?.(selectedSection, result.id);
    } else if (result.missingFields) {
      setMissingFields(result.missingFields);
    }
  };

  const renderFieldInput = (field: string, value: any) => {
    const isTextArea = ["description", "body", "content", "full_description", "thought", "itinerary", "inclusions", "exclusions"].includes(field);
    const isDistrict = field === "district_id";
    const isCategory = field === "category";

    if (isDistrict) {
      return (
        <Select
          value={value || ""}
          onValueChange={(v) => handleFieldChange(field, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (isCategory && selectedSection === "district_content") {
      return (
        <Select
          value={value || ""}
          onValueChange={(v) => handleFieldChange(field, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Festival">Festival</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Place">Place</SelectItem>
            <SelectItem value="Culture">Culture</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (isTextArea) {
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          rows={4}
          className="resize-none"
        />
      );
    }

    return (
      <Input
        value={value || ""}
        onChange={(e) => handleFieldChange(field, e.target.value)}
      />
    );
  };

  const getFieldsForSection = (): string[] => {
    if (!selectedSection) return [];
    const mapping = getSectionMapping(selectedSection);
    if (!mapping) return [];

    // Get all unique DB fields from the mapping
    const dbFields = new Set(Object.values(mapping.fieldMapping));
    // Add required fields
    mapping.requiredFields.forEach((f) => dbFields.add(f));
    // Remove slug as it's auto-generated
    dbFields.delete("slug");
    
    return Array.from(dbFields);
  };

  if (!aiOutput || Object.keys(aiOutput).length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Send className="h-4 w-4" />
        Send AI Output to Section
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={selectedSection}
          onValueChange={(v) => setSelectedSection(v as SectionKey)}
        >
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Select section..." />
          </SelectTrigger>
          <SelectContent>
            {SECTION_GROUPS.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.sections.map((sectionKey) => {
                  const mapping = SECTION_MAPPINGS.find((m) => m.key === sectionKey);
                  if (!mapping) return null;
                  return (
                    <SelectItem key={sectionKey} value={sectionKey}>
                      {mapping.label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={!selectedSection}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview & Edit
        </Button>

        {canSave ? (
          <Button
            onClick={handleSave}
            disabled={!selectedSection || isInserting || missingFields.length > 0}
          >
            {isInserting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Save to Section
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground self-center">
            Only Admin/Super Admin can save
          </p>
        )}
      </div>

      {missingFields.length > 0 && selectedSection && (
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Missing required fields: {missingFields.join(", ")}. Please fill them in the preview.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview & Edit Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Preview & Edit - {getSectionMapping(selectedSection as SectionKey)?.label}
            </DialogTitle>
            <DialogDescription>
              Review and edit the mapped fields before saving
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {missingFields.length > 0 && (
                <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please fill in the required fields: {missingFields.join(", ")}
                  </AlertDescription>
                </Alert>
              )}

              {getFieldsForSection().map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    {getSectionMapping(selectedSection as SectionKey)?.requiredFields.includes(field) && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  {renderFieldInput(field, editedData[field])}
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cancel
            </Button>
            {canSave && (
              <Button
                onClick={handleSave}
                disabled={isInserting || missingFields.length > 0}
              >
                {isInserting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save to {getSectionMapping(selectedSection as SectionKey)?.label}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
