import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  SectionKey, 
  AIOutputSchema, 
  mapAIOutputToSection, 
  getMissingRequiredFields,
  getSectionMapping 
} from "@/lib/aiSectionMappings";

interface InsertResult {
  success: boolean;
  id?: string;
  error?: string;
  missingFields?: string[];
}

export const useAISectionInsert = () => {
  const [isInserting, setIsInserting] = useState(false);

  const insertToSection = async (
    aiOutput: AIOutputSchema,
    sectionKey: SectionKey,
    additionalData?: Record<string, any>
  ): Promise<InsertResult> => {
    setIsInserting(true);

    try {
      const mapping = getSectionMapping(sectionKey);
      if (!mapping) {
        return { success: false, error: "Invalid section selected" };
      }

      // Map AI output to DB fields
      let mappedData = mapAIOutputToSection(aiOutput, sectionKey);
      if (!mappedData) {
        return { success: false, error: "Failed to map AI output" };
      }

      // Merge with additional data (user edits)
      mappedData = { ...mappedData, ...additionalData };

      // Check for missing required fields
      const missingFields = getMissingRequiredFields(mappedData, sectionKey);
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        };
      }

      // Insert into database - use type assertion for dynamic table names
      const { data, error } = await (supabase as any)
        .from(mapping.table)
        .insert(mappedData)
        .select("id")
        .single();

      if (error) {
        console.error("Insert error:", error);
        return { success: false, error: error.message };
      }

      const insertedId = data?.id as string;
      if (!insertedId) {
        return { success: false, error: "Failed to get inserted ID" };
      }

      // Log audit entry
      await logAIGeneratedEntry(sectionKey, insertedId);

      toast.success(`Successfully added to ${mapping.label}`);
      return { success: true, id: insertedId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Insert error:", err);
      return { success: false, error: message };
    } finally {
      setIsInserting(false);
    }
  };

  const logAIGeneratedEntry = async (section: string, entryId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("admin_activity_logs").insert({
        user_id: user.id,
        user_email: user.email || "unknown",
        entity_type: section,
        entity_id: entryId,
        action: "create",
        summary: `AI-generated content added to ${section}`,
        metadata: { generated_by_ai: true },
      });
    } catch (err) {
      console.error("Failed to log audit entry:", err);
    }
  };

  return {
    insertToSection,
    isInserting,
  };
};
