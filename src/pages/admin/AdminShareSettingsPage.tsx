import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useShareSettings } from "@/hooks/useShareAnalytics";
import { toast } from "sonner";
import { Loader2, Share2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminShareSettingsPage() {
  const { loading, settings, updateSettings } = useShareSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    is_enabled: true,
    share_title: "Share the Pahadi Spirit!",
    default_message: "Discover the beauty of Uttarakhand!",
    button_position: "bottom-right",
    theme: "pahadi-green"
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        is_enabled: settings.is_enabled,
        share_title: settings.share_title || "Share the Pahadi Spirit!",
        default_message: settings.default_message || "Discover the beauty of Uttarakhand!",
        button_position: settings.button_position || "bottom-right",
        theme: settings.theme || "pahadi-green"
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateSettings(formData);
    setSaving(false);
    
    if (success) {
      toast.success("Share settings updated successfully");
    } else {
      toast.error("Failed to update settings");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Share2 className="h-6 w-6" />
              Social Sharing Settings
            </h1>
            <p className="text-muted-foreground">
              Configure the floating share button that appears on all public pages
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Enable or disable the share button globally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Share Button</Label>
                  <p className="text-sm text-muted-foreground">
                    Show floating share button on all public pages
                  </p>
                </div>
                <Switch
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_enabled: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="share_title">Share Menu Title</Label>
                <Input
                  id="share_title"
                  value={formData.share_title}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, share_title: e.target.value }))
                  }
                  placeholder="Share the Pahadi Spirit!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_message">Default Share Message</Label>
                <Textarea
                  id="default_message"
                  value={formData.default_message}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, default_message: e.target.value }))
                  }
                  placeholder="Discover the beauty of Uttarakhand!"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This message will be included when sharing to platforms that support text
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the share button looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Button Position</Label>
                <Select
                  value={formData.button_position}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, button_position: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={formData.theme}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pahadi-green">Pahadi Green</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              <div className="pt-4">
                <Label>Preview</Label>
                <div className="mt-2 border rounded-lg p-8 bg-muted/30 relative h-32">
                  <div 
                    className={`absolute bottom-4 ${
                      formData.button_position === 'bottom-left' ? 'left-4' : 'right-4'
                    }`}
                  >
                    <div className={`
                      h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg
                      ${formData.theme === 'pahadi-green' ? 'bg-emerald-600' : ''}
                      ${formData.theme === 'light' ? 'bg-white text-gray-800 border' : ''}
                      ${formData.theme === 'dark' ? 'bg-gray-900' : ''}
                    `}>
                      <Share2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platforms Info */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Platforms</CardTitle>
            <CardDescription>The share button supports the following platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'WhatsApp', code: 'wa', color: 'bg-green-500' },
                { name: 'Facebook', code: 'fb', color: 'bg-blue-600' },
                { name: 'Instagram', code: 'ig', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
                { name: 'YouTube', code: 'yt', color: 'bg-red-600' },
                { name: 'X (Twitter)', code: 'tw', color: 'bg-black' },
                { name: 'LinkedIn', code: 'ln', color: 'bg-blue-700' },
                { name: 'Email', code: 'email', color: 'bg-gray-600' },
                { name: 'Copy Link', code: 'copy', color: 'bg-gray-500' },
              ].map((platform) => (
                <div key={platform.code} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`h-8 w-8 rounded-full ${platform.color}`} />
                  <div>
                    <p className="font-medium text-sm">{platform.name}</p>
                    <p className="text-xs text-muted-foreground">?ref={platform.code}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
