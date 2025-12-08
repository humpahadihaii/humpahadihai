import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIVillageDescriptionProps {
  villageName: string;
  districtName: string;
  onContentGenerated: (content: {
    introduction?: string;
    history?: string;
    traditions?: string;
    festivals?: string;
    foods?: string;
    handicrafts?: string;
  }) => void;
}

const AIVillageDescription = ({ villageName, districtName, onContentGenerated }: AIVillageDescriptionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to use AI features");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: "story",
          action: "generate",
          inputs: {
            topic: `Detailed information about ${villageName} village in ${districtName} district, Uttarakhand`,
            keyPoints: "Overview, history, cultural traditions, local festivals, famous local foods, and handicrafts",
            category: "Culture",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const result = await response.json();
      const content = result.content || "";

      // Parse the content into sections
      const parseSection = (label: string): string => {
        const regex = new RegExp(`${label}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z]+[:\\s]|$)`, "i");
        const match = content.match(regex);
        return match ? match[1].trim() : "";
      };

      // Try to extract structured content
      const body = parseSection("BODY") || content;
      
      // Split body into logical sections
      const paragraphs = body.split(/\n\n+/);
      
      const parsedContent = {
        introduction: paragraphs[0] || `${villageName} is a village in ${districtName} district, Uttarakhand.`,
        history: paragraphs[1] || "",
        traditions: paragraphs.find((p: string) => p.toLowerCase().includes("tradition") || p.toLowerCase().includes("culture")) || "",
        festivals: paragraphs.find((p: string) => p.toLowerCase().includes("festival") || p.toLowerCase().includes("celebration")) || "",
        foods: paragraphs.find((p: string) => p.toLowerCase().includes("food") || p.toLowerCase().includes("cuisine")) || "",
        handicrafts: paragraphs.find((p: string) => p.toLowerCase().includes("handicraft") || p.toLowerCase().includes("craft")) || "",
      };

      setGeneratedContent(parsedContent);
      toast.success("Content generated! Review and apply.");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      setDialogOpen(false);
      setGeneratedContent(null);
      toast.success("Content applied to form!");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          AI: Generate Description
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI-Generated Village Description</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!generatedContent ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Generate rich description for <strong>{villageName}</strong> in <strong>{districtName}</strong> district.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                AI will create: Overview, History, Cultural traditions, Festivals, Local foods, and Handicrafts
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Now
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Introduction</h4>
                <p className="text-sm text-muted-foreground">{generatedContent.introduction?.substring(0, 200)}...</p>
              </div>
              {generatedContent.history && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">History</h4>
                  <p className="text-sm text-muted-foreground">{generatedContent.history?.substring(0, 150)}...</p>
                </div>
              )}
              {generatedContent.festivals && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Festivals</h4>
                  <p className="text-sm text-muted-foreground">{generatedContent.festivals?.substring(0, 150)}...</p>
                </div>
              )}
              {generatedContent.foods && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Local Foods</h4>
                  <p className="text-sm text-muted-foreground">{generatedContent.foods?.substring(0, 150)}...</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setGeneratedContent(null)} className="flex-1">
                  Regenerate
                </Button>
                <Button onClick={handleApply} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Apply to Form
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIVillageDescription;
