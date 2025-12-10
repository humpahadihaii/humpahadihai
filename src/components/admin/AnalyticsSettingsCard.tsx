import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, BarChart3, Megaphone, Info } from 'lucide-react';
import { useAnalyticsSettings } from '@/hooks/useAnalyticsSettings';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AnalyticsSettingsCard() {
  const { settings, loading, saving, updateSettings } = useAnalyticsSettings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Google Analytics Settings
        </CardTitle>
        <CardDescription>
          Control analytics tracking and privacy settings for your site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analytics Enabled Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="analytics-enabled" className="text-base">
                Enable Analytics
              </Label>
              <p className="text-sm text-muted-foreground">
                Track page views and user interactions
              </p>
            </div>
          </div>
          <Switch
            id="analytics-enabled"
            checked={settings?.analytics_enabled ?? true}
            onCheckedChange={(checked) => updateSettings({ analytics_enabled: checked })}
            disabled={saving}
          />
        </div>

        {/* IP Anonymization Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="anonymize-ip" className="text-base flex items-center gap-2">
                Anonymize IP Addresses
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        When enabled, user IP addresses are anonymized before being sent to Google Analytics. 
                        Recommended for GDPR compliance.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <p className="text-sm text-muted-foreground">
                Privacy protection for user data
              </p>
            </div>
          </div>
          <Switch
            id="anonymize-ip"
            checked={settings?.anonymize_ip ?? true}
            onCheckedChange={(checked) => updateSettings({ anonymize_ip: checked })}
            disabled={saving}
          />
        </div>

        {/* Ad Personalization Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="ad-personalization" className="text-base flex items-center gap-2">
                Ad Personalization Signals
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Allows Google to use analytics data for remarketing and personalized advertising. 
                        Requires cookie consent banner if enabled.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable remarketing features (requires consent)
              </p>
            </div>
          </div>
          <Switch
            id="ad-personalization"
            checked={settings?.ad_personalization_enabled ?? false}
            onCheckedChange={(checked) => updateSettings({ ad_personalization_enabled: checked })}
            disabled={saving}
          />
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <h4 className="font-medium mb-2">How to Set Up</h4>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Get your GA4 Measurement ID from Google Analytics (format: G-XXXXXXXXXX)</li>
            <li>Add it as the <code className="bg-background px-1 rounded">GA4_MEASUREMENT_ID</code> secret</li>
            <li>For server-side events, also add <code className="bg-background px-1 rounded">GA4_API_SECRET</code></li>
            <li>Events will start tracking after the next page load</li>
          </ol>
        </div>

        {settings?.updated_at && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(settings.updated_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
