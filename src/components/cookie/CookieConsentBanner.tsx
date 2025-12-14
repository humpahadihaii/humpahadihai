import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useCookieConsent, ConsentState } from '@/hooks/useCookieConsent';
import { Shield, Cookie, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookieConsentBanner() {
  const {
    settings,
    consent,
    showBanner,
    showPreferences,
    loading,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useCookieConsent();

  const [localPreferences, setLocalPreferences] = useState<Partial<ConsentState>>({
    analytics: true,
    marketing: true,
    preferences: true,
  });

  if (loading || !settings || (!showBanner && !showPreferences) || consent) {
    return null;
  }

  const categories = settings.categories || {};
  const position = settings.banner_position || 'bottom';

  const handleSavePreferences = () => {
    savePreferences(localPreferences);
  };

  const positionClasses = {
    bottom: 'bottom-0 left-0 right-0',
    top: 'top-0 left-0 right-0',
    'bottom-left': 'bottom-4 left-4 max-w-md',
    'bottom-right': 'bottom-4 right-4 max-w-md',
  };

  return (
    <>
      {/* Main Banner */}
      {showBanner && !showPreferences && (
        <div
          className={`fixed z-[9999] ${positionClasses[position as keyof typeof positionClasses] || positionClasses.bottom}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-banner-title"
        >
          <div className="bg-card border-t border-border shadow-2xl p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Cookie className="h-5 w-5 text-primary" />
                    <h2 id="cookie-banner-title" className="font-semibold text-foreground">
                      {settings.banner_title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {settings.banner_description}{' '}
                    <Link 
                      to={settings.privacy_policy_url} 
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </Link>
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPreferences}
                    className="text-xs md:text-sm"
                  >
                    {settings.manage_text}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rejectAll}
                    className="text-xs md:text-sm"
                  >
                    {settings.reject_all_text}
                  </Button>
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="text-xs md:text-sm"
                  >
                    {settings.accept_all_text}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <Dialog open={showPreferences} onOpenChange={(open) => !open && closePreferences()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Essential cookies are always active.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary Cookies - Always On */}
            {categories.necessary && (
              <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{categories.necessary.title}</h4>
                  <p className="text-sm text-muted-foreground">{categories.necessary.description}</p>
                </div>
                <Switch checked disabled className="data-[state=checked]:bg-primary" />
              </div>
            )}

            {/* Analytics Cookies */}
            {categories.analytics?.enabled && (
              <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{categories.analytics.title}</h4>
                  <p className="text-sm text-muted-foreground">{categories.analytics.description}</p>
                </div>
                <Switch
                  checked={localPreferences.analytics}
                  onCheckedChange={(checked) => 
                    setLocalPreferences(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
            )}

            {/* Marketing Cookies */}
            {categories.marketing?.enabled && (
              <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{categories.marketing.title}</h4>
                  <p className="text-sm text-muted-foreground">{categories.marketing.description}</p>
                </div>
                <Switch
                  checked={localPreferences.marketing}
                  onCheckedChange={(checked) => 
                    setLocalPreferences(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            )}

            {/* Preference Cookies */}
            {categories.preferences?.enabled && (
              <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{categories.preferences.title}</h4>
                  <p className="text-sm text-muted-foreground">{categories.preferences.description}</p>
                </div>
                <Switch
                  checked={localPreferences.preferences}
                  onCheckedChange={(checked) => 
                    setLocalPreferences(prev => ({ ...prev, preferences: checked }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Link 
              to={settings.cookie_policy_url} 
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Cookie Policy
            </Link>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={rejectAll}>
                {settings.reject_all_text}
              </Button>
              <Button onClick={handleSavePreferences}>
                {settings.save_text}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}