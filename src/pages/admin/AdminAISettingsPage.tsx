import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Save, Key, Sparkles } from "lucide-react";

const AdminAISettingsPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "gemini_api_key")
        .maybeSingle();

      if (error) throw error;
      
      if (data?.value) {
        // Value is stored as JSON, extract the string
        const keyValue = typeof data.value === 'string' ? data.value : (data.value as any)?.key || "";
        setApiKey(keyValue);
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsSaving(true);
    try {
      // Check if key exists
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "gemini_api_key")
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("site_settings")
          .update({ value: { key: apiKey.trim() }, updated_at: new Date().toISOString() })
          .eq("key", "gemini_api_key");

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "gemini_api_key", value: { key: apiKey.trim() } });

        if (error) throw error;
      }

      toast.success("API key saved successfully");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return key.substring(0, 4) + "•".repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI Settings
          </h1>
          <p className="text-muted-foreground">
            Configure AI services for content generation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gemini API Key
            </CardTitle>
            <CardDescription>
              Enter your Google Gemini API key to enable AI-powered content generation.
              Get your API key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google AI Studio
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSave} disabled={isSaving || isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
              {apiKey && !showKey && (
                <p className="text-sm text-muted-foreground">
                  Current key: {maskApiKey(apiKey)}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">Note:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>The API key is stored securely in the database</li>
                <li>Make sure your API key has sufficient quota</li>
                <li>Free tier has limited requests per minute/day</li>
                <li>Consider upgrading to a paid plan for higher limits</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAISettingsPage;
