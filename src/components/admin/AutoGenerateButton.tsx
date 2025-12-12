import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PLATFORM_LIMITS, truncateAtSentenceBoundary } from "@/lib/sharePreviewUtils";

interface AutoGenerateButtonProps {
  entityTitle: string;
  entityDescription: string;
  onGenerate: (data: { title: string; description: string }) => void;
  useAI?: boolean;
  targetPlatform?: keyof typeof PLATFORM_LIMITS;
}

export function AutoGenerateButton({
  entityTitle,
  entityDescription,
  onGenerate,
  useAI = false,
  targetPlatform
}: AutoGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      if (useAI && entityDescription.length > 200) {
        // Use AI to generate optimized summary
        const { data, error } = await supabase.functions.invoke('ai-content', {
          body: {
            action: 'summarize_for_share',
            content: entityDescription,
            title: entityTitle,
            targetLength: targetPlatform 
              ? PLATFORM_LIMITS[targetPlatform].description 
              : 150
          }
        });

        if (error) throw error;

        onGenerate({
          title: data.title || entityTitle.slice(0, 60),
          description: data.summary || truncateAtSentenceBoundary(entityDescription, 150)
        });
        
        toast.success('AI-optimized preview generated');
      } else {
        // Simple truncation without AI
        const limits = targetPlatform ? PLATFORM_LIMITS[targetPlatform] : { title: 60, description: 150 };
        
        onGenerate({
          title: entityTitle.slice(0, limits.title),
          description: truncateAtSentenceBoundary(entityDescription, limits.description)
        });
        
        toast.success('Preview generated');
      }
    } catch (error) {
      console.error('Generate error:', error);
      // Fallback to simple truncation on error
      onGenerate({
        title: entityTitle.slice(0, 60),
        description: truncateAtSentenceBoundary(entityDescription, 150)
      });
      toast.info('Generated using fallback (AI unavailable)');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={isGenerating || (!entityTitle && !entityDescription)}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      {useAI ? 'AI Generate' : 'Auto Generate'}
    </Button>
  );
}
