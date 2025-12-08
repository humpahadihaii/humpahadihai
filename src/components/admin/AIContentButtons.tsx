import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2, FileText, Languages, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAIContent } from "@/hooks/useAIContent";

interface AIContentButtonsProps {
  type: "story" | "travel" | "product" | "promotion";
  onContentGenerated: (content: Record<string, string>) => void;
  currentContent?: Record<string, string>;
}

export const AIContentButtons = ({
  type,
  onContentGenerated,
  currentContent = {},
}: AIContentButtonsProps) => {
  const { generateContent, isLoading } = useAIContent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<string>("");
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleAction = async (action: string) => {
    if (action === "generate") {
      setDialogType(action);
      setInputs({});
      setDialogOpen(true);
      return;
    }

    if (action === "expand" || action === "improve" || action === "summarize") {
      const content = currentContent.body || currentContent.full_description || "";
      if (!content) {
        return;
      }
      const result = await generateContent({
        type,
        action,
        inputs: { content },
      });
      if (result?.body) {
        if (type === "story") {
          onContentGenerated({ body: result.body });
        } else {
          onContentGenerated({ full_description: result.body });
        }
      }
      return;
    }

    if (action === "seo") {
      const title = currentContent.title || currentContent.name || "";
      const content = currentContent.body || currentContent.full_description || currentContent.short_description || "";
      const result = await generateContent({
        type: "seo",
        action: "generate",
        inputs: { title, content },
      });
      if (result) {
        onContentGenerated({
          meta_title: result.seo_title || "",
          meta_description: result.meta_description || "",
        });
      }
      return;
    }

    if (action === "translate") {
      setDialogType(action);
      setInputs({ targetLanguage: "Hindi" });
      setDialogOpen(true);
      return;
    }
  };

  const handleDialogSubmit = async () => {
    const result = await generateContent({
      type,
      action: dialogType,
      inputs,
    });

    if (result) {
      const updates: Record<string, string> = {};

      if (type === "story") {
        if (result.title) updates.title = result.title;
        if (result.excerpt) updates.excerpt = result.excerpt;
        if (result.body) updates.body = result.body;
        if (result.tags) updates.tags = result.tags;
      } else if (type === "travel") {
        if (result.short_description) updates.short_description = result.short_description;
        if (result.full_description) updates.full_description = result.full_description;
        if (result.itinerary) updates.itinerary = result.itinerary;
        if (result.inclusions) updates.inclusions = result.inclusions;
        if (result.exclusions) updates.exclusions = result.exclusions;
        if (result.best_season) updates.best_season = result.best_season;
      } else if (type === "product") {
        if (result.short_description) updates.short_description = result.short_description;
        if (result.full_description) updates.full_description = result.full_description;
        if (result.tags) updates.tags = result.tags;
      } else if (type === "promotion") {
        if (result.description) updates.description = result.description;
        if (result.deliverables) updates.deliverables = result.deliverables;
      }

      if (dialogType === "translate" && result.body) {
        updates.translated_content = result.body;
      }

      onContentGenerated(updates);
    }

    setDialogOpen(false);
  };

  const getMenuItems = () => {
    const common = [
      { action: "expand", label: "Expand Content", icon: Wand2 },
      { action: "improve", label: "Improve Wording", icon: Sparkles },
      { action: "summarize", label: "Summarize", icon: FileText },
      { action: "seo", label: "Generate SEO", icon: Search },
      { action: "translate", label: "Translate", icon: Languages },
    ];

    return [
      { action: "generate", label: `Generate ${type === "story" ? "Article" : type === "travel" ? "Package" : type === "product" ? "Description" : "Package"}`, icon: Sparkles },
      ...common,
    ];
  };

  const renderDialogContent = () => {
    if (dialogType === "generate") {
      switch (type) {
        case "story":
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Title</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Traditional Pahadi Food in Garhwal"
                  value={inputs.topic || ""}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyPoints">Key Points (optional)</Label>
                <Textarea
                  id="keyPoints"
                  placeholder="e.g., Focus on local ingredients, traditional recipes, festival foods"
                  value={inputs.keyPoints || ""}
                  onChange={(e) => setInputs({ ...inputs, keyPoints: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Culture, Food, Travel"
                  value={inputs.category || ""}
                  onChange={(e) => setInputs({ ...inputs, category: e.target.value })}
                />
              </div>
            </>
          );

        case "travel":
          return (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Kedarnath"
                    value={inputs.destination || ""}
                    onChange={(e) => setInputs({ ...inputs, destination: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    placeholder="e.g., Garhwal"
                    value={inputs.region || ""}
                    onChange={(e) => setInputs({ ...inputs, region: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 5"
                    value={inputs.duration || ""}
                    onChange={(e) => setInputs({ ...inputs, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Input
                    id="difficulty"
                    placeholder="e.g., moderate"
                    value={inputs.difficulty || ""}
                    onChange={(e) => setInputs({ ...inputs, difficulty: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tripType">Trip Type</Label>
                <Input
                  id="tripType"
                  placeholder="e.g., pilgrimage, trek, heritage tour"
                  value={inputs.tripType || ""}
                  onChange={(e) => setInputs({ ...inputs, tripType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlights">Key Highlights</Label>
                <Textarea
                  id="highlights"
                  placeholder="e.g., temple visit, mountain views, local food"
                  value={inputs.highlights || ""}
                  onChange={(e) => setInputs({ ...inputs, highlights: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          );

        case "product":
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Pahadi Rajma"
                  value={inputs.name || ""}
                  onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Food, Handicrafts, Textiles"
                  value={inputs.category || ""}
                  onChange={(e) => setInputs({ ...inputs, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  placeholder="e.g., Chamoli, Uttarakhand"
                  value={inputs.origin || ""}
                  onChange={(e) => setInputs({ ...inputs, origin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attributes">Attributes</Label>
                <Input
                  id="attributes"
                  placeholder="e.g., organic, handmade, traditional"
                  value={inputs.attributes || ""}
                  onChange={(e) => setInputs({ ...inputs, attributes: e.target.value })}
                />
              </div>
            </>
          );

        case "promotion":
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type</Label>
                <Input
                  id="packageType"
                  placeholder="e.g., Instagram, Website, Combo"
                  value={inputs.packageType || ""}
                  onChange={(e) => setInputs({ ...inputs, packageType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="includes">What's Included</Label>
                <Textarea
                  id="includes"
                  placeholder="e.g., 1 reel, 3 stories, homepage banner for 7 days"
                  value={inputs.includes || ""}
                  onChange={(e) => setInputs({ ...inputs, includes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 7 days"
                  value={inputs.duration || ""}
                  onChange={(e) => setInputs({ ...inputs, duration: e.target.value })}
                />
              </div>
            </>
          );
      }
    }

    if (dialogType === "translate") {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="targetLanguage">Target Language</Label>
            <Input
              id="targetLanguage"
              value={inputs.targetLanguage || "Hindi"}
              onChange={(e) => setInputs({ ...inputs, targetLanguage: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content to Translate</Label>
            <Textarea
              id="content"
              placeholder="Paste content to translate..."
              value={inputs.content || currentContent.body || currentContent.full_description || ""}
              onChange={(e) => setInputs({ ...inputs, content: e.target.value })}
              rows={6}
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Assist
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>AI Content Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {getMenuItems().map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => handleAction(item.action)}
              disabled={isLoading}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Content Generator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">{renderDialogContent()}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDialogSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
