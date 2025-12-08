import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Copy, Check, FileText, Plane, Store, Megaphone, Search, Languages } from "lucide-react";
import { useAIContent } from "@/hooks/useAIContent";
import { toast } from "sonner";

export default function AdminAIToolsPage() {
  const { generateContent, isLoading } = useAIContent();
  const [copied, setCopied] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  // Story generator state
  const [storyTopic, setStoryTopic] = useState("");
  const [storyKeyPoints, setStoryKeyPoints] = useState("");
  const [storyCategory, setStoryCategory] = useState("Culture");

  // Travel package generator state
  const [travelDestination, setTravelDestination] = useState("");
  const [travelRegion, setTravelRegion] = useState("Garhwal");
  const [travelDuration, setTravelDuration] = useState("");
  const [travelDifficulty, setTravelDifficulty] = useState("moderate");
  const [travelHighlights, setTravelHighlights] = useState("");

  // Product description state
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productOrigin, setProductOrigin] = useState("");
  const [productAttributes, setProductAttributes] = useState("");

  // SEO generator state
  const [seoTitle, setSeoTitle] = useState("");
  const [seoContent, setSeoContent] = useState("");

  // Translator state
  const [translateContent, setTranslateContent] = useState("");
  const [translateTarget, setTranslateTarget] = useState("Hindi");

  const copyToClipboard = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerateStory = async () => {
    const result = await generateContent({
      type: "story",
      action: "generate",
      inputs: {
        topic: storyTopic,
        keyPoints: storyKeyPoints,
        category: storyCategory,
      },
    });
    if (result) {
      setResults({
        ...results,
        storyTitle: result.title || "",
        storyExcerpt: result.excerpt || "",
        storyBody: result.body || "",
      });
    }
  };

  const handleGenerateTravel = async () => {
    const result = await generateContent({
      type: "travel",
      action: "generate",
      inputs: {
        destination: travelDestination,
        region: travelRegion,
        duration: travelDuration,
        difficulty: travelDifficulty,
        highlights: travelHighlights,
      },
    });
    if (result) {
      setResults({
        ...results,
        travelDescription: result.full_description || "",
        travelItinerary: result.itinerary || "",
        travelInclusions: result.inclusions || "",
        travelExclusions: result.exclusions || "",
      });
    }
  };

  const handleGenerateProduct = async () => {
    const result = await generateContent({
      type: "product",
      action: "generate",
      inputs: {
        name: productName,
        category: productCategory,
        origin: productOrigin,
        attributes: productAttributes,
      },
    });
    if (result) {
      setResults({
        ...results,
        productShort: result.short_description || "",
        productFull: result.full_description || "",
        productTags: result.tags || "",
      });
    }
  };

  const handleGenerateSEO = async () => {
    const result = await generateContent({
      type: "seo",
      action: "generate",
      inputs: {
        title: seoTitle,
        content: seoContent,
      },
    });
    if (result) {
      setResults({
        ...results,
        seoMetaTitle: result.seo_title || "",
        seoMetaDescription: result.meta_description || "",
      });
    }
  };

  const handleTranslate = async () => {
    const result = await generateContent({
      type: "story",
      action: "translate",
      inputs: {
        content: translateContent,
        targetLanguage: translateTarget,
      },
    });
    if (result) {
      setResults({
        ...results,
        translatedContent: result.body || "",
      });
    }
  };

  const ResultCard = ({ label, value, resultKey }: { label: string; value: string; resultKey: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(resultKey, value)}
          >
            {copied === resultKey ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <Textarea
        value={value}
        readOnly
        rows={4}
        className="bg-muted/50"
        placeholder="Generated content will appear here..."
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Tools
          </h1>
          <p className="text-muted-foreground">
            Generate content using AI assistance powered by Gemini
          </p>
        </div>

        <Tabs defaultValue="story" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto">
            <TabsTrigger value="story" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Story</span>
            </TabsTrigger>
            <TabsTrigger value="travel" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              <span className="hidden sm:inline">Travel</span>
            </TabsTrigger>
            <TabsTrigger value="product" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Product</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="translate" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Translate</span>
            </TabsTrigger>
          </TabsList>

          {/* Story Generator */}
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Story Generator
                </CardTitle>
                <CardDescription>
                  Generate articles and stories about Uttarakhand's culture, food, and heritage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Topic / Title</Label>
                    <Input
                      placeholder="e.g., Traditional Pahadi Food in Garhwal"
                      value={storyTopic}
                      onChange={(e) => setStoryTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={storyCategory} onValueChange={setStoryCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Culture", "Food", "History", "Festival", "Travel", "Tradition"].map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Key Points (optional)</Label>
                  <Textarea
                    placeholder="e.g., Focus on local ingredients, traditional recipes, festival foods"
                    value={storyKeyPoints}
                    onChange={(e) => setStoryKeyPoints(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button onClick={handleGenerateStory} disabled={isLoading || !storyTopic}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Story
                    </>
                  )}
                </Button>

                {(results.storyTitle || results.storyExcerpt || results.storyBody) && (
                  <div className="space-y-4 pt-4 border-t">
                    <ResultCard label="Generated Title" value={results.storyTitle || ""} resultKey="storyTitle" />
                    <ResultCard label="Excerpt" value={results.storyExcerpt || ""} resultKey="storyExcerpt" />
                    <ResultCard label="Body Content" value={results.storyBody || ""} resultKey="storyBody" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Travel Package Generator */}
          <TabsContent value="travel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Travel Package Generator
                </CardTitle>
                <CardDescription>
                  Generate travel package descriptions, itineraries, and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Input
                      placeholder="e.g., Kedarnath, Valley of Flowers"
                      value={travelDestination}
                      onChange={(e) => setTravelDestination(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select value={travelRegion} onValueChange={setTravelRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Garhwal">Garhwal</SelectItem>
                        <SelectItem value="Kumaon">Kumaon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (days)</Label>
                    <Input
                      placeholder="e.g., 5"
                      value={travelDuration}
                      onChange={(e) => setTravelDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={travelDifficulty} onValueChange={setTravelDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="challenging">Challenging</SelectItem>
                        <SelectItem value="difficult">Difficult</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Key Highlights</Label>
                  <Textarea
                    placeholder="e.g., temple visit, mountain views, local food"
                    value={travelHighlights}
                    onChange={(e) => setTravelHighlights(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button onClick={handleGenerateTravel} disabled={isLoading || !travelDestination}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Package
                    </>
                  )}
                </Button>

                {(results.travelDescription || results.travelItinerary) && (
                  <div className="space-y-4 pt-4 border-t">
                    <ResultCard label="Description" value={results.travelDescription || ""} resultKey="travelDescription" />
                    <ResultCard label="Itinerary" value={results.travelItinerary || ""} resultKey="travelItinerary" />
                    <ResultCard label="Inclusions" value={results.travelInclusions || ""} resultKey="travelInclusions" />
                    <ResultCard label="Exclusions" value={results.travelExclusions || ""} resultKey="travelExclusions" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Description Generator */}
          <TabsContent value="product">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Product Description Generator
                </CardTitle>
                <CardDescription>
                  Generate descriptions for Pahadi products and handicrafts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      placeholder="e.g., Pahadi Rajma, Aipan Art"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      placeholder="e.g., Food, Handicrafts, Textiles"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Origin</Label>
                    <Input
                      placeholder="e.g., Chamoli, Uttarakhand"
                      value={productOrigin}
                      onChange={(e) => setProductOrigin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attributes</Label>
                    <Input
                      placeholder="e.g., organic, handmade, traditional"
                      value={productAttributes}
                      onChange={(e) => setProductAttributes(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleGenerateProduct} disabled={isLoading || !productName}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Description
                    </>
                  )}
                </Button>

                {(results.productShort || results.productFull) && (
                  <div className="space-y-4 pt-4 border-t">
                    <ResultCard label="Short Description" value={results.productShort || ""} resultKey="productShort" />
                    <ResultCard label="Full Description" value={results.productFull || ""} resultKey="productFull" />
                    <ResultCard label="Suggested Tags" value={results.productTags || ""} resultKey="productTags" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Generator */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO Generator
                </CardTitle>
                <CardDescription>
                  Generate SEO-optimized meta titles and descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    placeholder="e.g., Kedarnath Temple - Sacred Pilgrimage"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content Summary</Label>
                  <Textarea
                    placeholder="Paste a brief summary or the main content of your page..."
                    value={seoContent}
                    onChange={(e) => setSeoContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={handleGenerateSEO} disabled={isLoading || !seoTitle}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate SEO
                    </>
                  )}
                </Button>

                {(results.seoMetaTitle || results.seoMetaDescription) && (
                  <div className="space-y-4 pt-4 border-t">
                    <ResultCard label="Meta Title" value={results.seoMetaTitle || ""} resultKey="seoMetaTitle" />
                    <ResultCard label="Meta Description" value={results.seoMetaDescription || ""} resultKey="seoMetaDescription" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Translator */}
          <TabsContent value="translate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Content Translator
                </CardTitle>
                <CardDescription>
                  Translate content between English and Hindi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Language</Label>
                  <Select value={translateTarget} onValueChange={setTranslateTarget}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content to Translate</Label>
                  <Textarea
                    placeholder="Paste content to translate..."
                    value={translateContent}
                    onChange={(e) => setTranslateContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button onClick={handleTranslate} disabled={isLoading || !translateContent}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="h-4 w-4 mr-2" />
                      Translate
                    </>
                  )}
                </Button>

                {results.translatedContent && (
                  <div className="space-y-4 pt-4 border-t">
                    <ResultCard label="Translated Content" value={results.translatedContent || ""} resultKey="translatedContent" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}