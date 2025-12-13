import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Plus, Trash2, Calendar, MapPin, Eye, Settings, Sparkles, 
  Utensils, Mountain, Trees, RefreshCw, Search 
} from "lucide-react";
import {
  useFeaturedContentConfig,
  useFeaturedContentSlots,
  useFeaturedContentMutations,
  useAllCulturalContent,
  useCombinedFeaturedContent,
  SECTION_LABELS,
  FeaturedCulturalContent,
} from "@/hooks/useFeaturedContent";

const SECTION_KEYS = [
  'cultural_highlight',
  'local_food', 
  'spiritual',
  'nature',
  'districts',
];

const SECTION_ICONS: Record<string, React.ElementType> = {
  cultural_highlight: Sparkles,
  local_food: Utensils,
  spiritual: Mountain,
  nature: Trees,
  districts: MapPin,
};

export default function AdminFeaturedContentPage() {
  const [activeSection, setActiveSection] = useState(SECTION_KEYS[0]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: config, isLoading: configLoading } = useFeaturedContentConfig();
  const { data: slots } = useFeaturedContentSlots(activeSection);
  const { data: allContent } = useAllCulturalContent();
  const { data: previewContent } = useCombinedFeaturedContent(activeSection, config?.items_per_section || 3);
  
  const { updateConfig, addSlot, removeSlot, updateSlot } = useFeaturedContentMutations();
  
  const handleToggleAutoRotation = async () => {
    try {
      await updateConfig.mutateAsync({ auto_rotation_enabled: !config?.auto_rotation_enabled });
      toast.success(`Auto-rotation ${config?.auto_rotation_enabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };
  
  const handleUpdateItemsPerSection = async (value: string) => {
    try {
      await updateConfig.mutateAsync({ items_per_section: parseInt(value) });
      toast.success("Items per section updated");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };
  
  const handleAddContent = async (content: FeaturedCulturalContent) => {
    try {
      await addSlot.mutateAsync({
        content_id: content.id,
        section_key: activeSection,
        priority: (slots?.length || 0) + 1,
      });
      toast.success(`Added "${content.title}" to ${SECTION_LABELS[activeSection]}`);
      setAddDialogOpen(false);
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("This content is already in this section");
      } else {
        toast.error("Failed to add content");
      }
    }
  };
  
  const handleRemoveSlot = async (slotId: string, title: string) => {
    try {
      await removeSlot.mutateAsync(slotId);
      toast.success(`Removed "${title}" from featured`);
    } catch (error) {
      toast.error("Failed to remove content");
    }
  };
  
  const filteredContent = allContent?.filter(content => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      content.title.toLowerCase().includes(term) ||
      content.district?.name.toLowerCase().includes(term) ||
      content.category?.name.toLowerCase().includes(term)
    );
  }) || [];
  
  const existingContentIds = new Set(slots?.map(s => s.content_id) || []);
  const availableContent = filteredContent.filter(c => !existingContentIds.has(c.id));
  
  const Icon = SECTION_ICONS[activeSection] || Sparkles;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Featured Content Manager</h1>
          <p className="text-muted-foreground">
            Control what appears on the homepage and manage auto-rotation settings
          </p>
        </div>
      </div>
      
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="auto-rotation"
                checked={config?.auto_rotation_enabled ?? true}
                onCheckedChange={handleToggleAutoRotation}
                disabled={updateConfig.isPending}
              />
              <Label htmlFor="auto-rotation" className="cursor-pointer">
                <span className="font-medium">Auto-Rotation</span>
                <span className="block text-sm text-muted-foreground">
                  Automatically select featured content daily
                </span>
              </Label>
            </div>
            
            <div className="flex items-center gap-3">
              <Label htmlFor="items-count">Items per Section</Label>
              <Select
                value={String(config?.items_per_section || 3)}
                onValueChange={handleUpdateItemsPerSection}
              >
                <SelectTrigger id="items-count" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Rotation: {config?.rotation_frequency || 'daily'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="flex flex-wrap h-auto gap-2">
          {SECTION_KEYS.map((key) => {
            const SectionIcon = SECTION_ICONS[key] || Sparkles;
            return (
              <TabsTrigger key={key} value={key} className="gap-2">
                <SectionIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{SECTION_LABELS[key]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {SECTION_KEYS.map((sectionKey) => (
          <TabsContent key={sectionKey} value={sectionKey} className="space-y-6 mt-6">
            {/* Manual Featured Content */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {SECTION_LABELS[sectionKey]}
                  </CardTitle>
                  <CardDescription>
                    Manually selected content takes priority over auto-rotation
                  </CardDescription>
                </div>
                
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Add Content to {SECTION_LABELS[sectionKey]}</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by title, district, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex-1 overflow-auto space-y-2 max-h-96">
                      {availableContent.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No available content found
                        </p>
                      ) : (
                        availableContent.map((content) => (
                          <div
                            key={content.id}
                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleAddContent(content)}
                          >
                            {content.hero_image && (
                              <img
                                src={content.hero_image}
                                alt={content.title}
                                className="w-16 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{content.title}</h4>
                              <div className="flex gap-2 mt-1">
                                {content.district && (
                                  <Badge variant="outline" className="text-xs">
                                    {content.district.name}
                                  </Badge>
                                )}
                                {content.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {content.category.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              <CardContent>
                {slots && slots.length > 0 ? (
                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                      >
                        {slot.content?.hero_image && (
                          <img
                            src={slot.content.hero_image}
                            alt={slot.content.title}
                            className="w-20 h-14 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{slot.content?.title}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {slot.content?.district && (
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {slot.content.district.name}
                              </Badge>
                            )}
                            {slot.content?.category && (
                              <Badge variant="secondary" className="text-xs">
                                {slot.content.category.name}
                              </Badge>
                            )}
                            {slot.is_manual && (
                              <Badge className="text-xs bg-primary/10 text-primary">
                                Manual
                              </Badge>
                            )}
                          </div>
                          {(slot.start_date || slot.end_date) && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {slot.start_date && <span>From: {slot.start_date}</span>}
                              {slot.end_date && <span>Until: {slot.end_date}</span>}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveSlot(slot.id, slot.content?.title || '')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No manually featured content</p>
                    <p className="text-sm">
                      {config?.auto_rotation_enabled 
                        ? "Auto-rotation will select content for this section" 
                        : "Add content to display in this section"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Homepage Preview
                </CardTitle>
                <CardDescription>
                  This is how content will appear on the homepage today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewContent && previewContent.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {previewContent.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg overflow-hidden border bg-card"
                      >
                        <div className="aspect-video relative">
                          {item.hero_image ? (
                            <img
                              src={item.hero_image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/50 to-accent/50" />
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium line-clamp-1">{item.title}</h4>
                          <div className="flex gap-2 mt-1">
                            {item.district && (
                              <Badge variant="outline" className="text-xs">
                                {item.district.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No content available for preview
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
