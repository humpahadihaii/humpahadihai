import { useState, useEffect } from "react";
import { Share2, X, MessageCircle, Facebook, Instagram, Youtube, Twitter, Linkedin, Mail, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  ref: string;
  getShareUrl: (url: string, title: string, message: string) => string;
  color: string;
}

const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <MessageCircle className="h-5 w-5" />,
    ref: "wa",
    getShareUrl: (url, title, message) => 
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${message}\n${url}`)}`,
    color: "bg-green-500 hover:bg-green-600"
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook className="h-5 w-5" />,
    ref: "fb",
    getShareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "bg-blue-600 hover:bg-blue-700"
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-5 w-5" />,
    ref: "ig",
    getShareUrl: (url) => url, // Instagram doesn't support direct sharing, copy link instead
    color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: <Youtube className="h-5 w-5" />,
    ref: "yt",
    getShareUrl: (url) => url, // YouTube doesn't support direct sharing
    color: "bg-red-600 hover:bg-red-700"
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: <Twitter className="h-5 w-5" />,
    ref: "tw",
    getShareUrl: (url, title, message) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${message}`)}&url=${encodeURIComponent(url)}`,
    color: "bg-black hover:bg-gray-800"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin className="h-5 w-5" />,
    ref: "ln",
    getShareUrl: (url, title) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: "bg-blue-700 hover:bg-blue-800"
  },
  {
    id: "email",
    name: "Email",
    icon: <Mail className="h-5 w-5" />,
    ref: "email",
    getShareUrl: (url, title, message) => 
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n\n${url}`)}`,
    color: "bg-gray-600 hover:bg-gray-700"
  },
  {
    id: "copy",
    name: "Copy Link",
    icon: <Copy className="h-5 w-5" />,
    ref: "copy",
    getShareUrl: (url) => url,
    color: "bg-gray-500 hover:bg-gray-600"
  }
];

interface ShareSettings {
  is_enabled: boolean;
  share_title: string;
  default_message: string;
  button_position: string;
  theme: string;
}

export function FloatingShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<ShareSettings | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchSettings();
    // Delay visibility for smooth animation
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Track referral on page load
    trackReferralOnLoad();
  }, [location.pathname]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('social_share_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Failed to fetch share settings:', error);
        return;
      }
      
      if (data) {
        setSettings(data as ShareSettings);
      }
    } catch (error) {
      console.error('Error fetching share settings:', error);
    }
  };

  const trackReferralOnLoad = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    
    if (!ref) return;

    // Check 24-hour cookie for deduplication
    const cookieKey = `share_ref_${location.pathname}_${ref}`;
    const existingCookie = document.cookie.includes(cookieKey);
    
    if (existingCookie) return;

    // Set cookie for 24 hours
    document.cookie = `${cookieKey}=1; max-age=86400; path=/`;

    // Determine page type and ID
    const pathParts = location.pathname.split('/').filter(Boolean);
    const pageType = pathParts[0] || 'home';
    
    try {
      await supabase.functions.invoke('track-referral', {
        body: {
          ref_source: ref,
          full_url: window.location.href,
          page_type: pageType,
          page_id: null
        }
      });
    } catch (error) {
      console.error('Failed to track referral:', error);
    }
  };

  const getShareUrl = (platform: SharePlatform) => {
    const baseUrl = window.location.origin + location.pathname;
    const urlWithRef = `${baseUrl}?ref=${platform.ref}`;
    return urlWithRef;
  };

  const handleShare = async (platform: SharePlatform) => {
    const shareUrl = getShareUrl(platform);
    const title = settings?.share_title || "Share the Pahadi Spirit!";
    const message = settings?.default_message || "Discover the beauty of Uttarakhand!";

    // Track share event
    try {
      await supabase.from('internal_events').insert({
        event_name: 'share_click',
        metadata: {
          platform: platform.id,
          page_type: location.pathname.split('/')[1] || 'home',
          url: shareUrl
        }
      });
    } catch (error) {
      console.error('Failed to track share event:', error);
    }

    // Handle copy link separately
    if (platform.id === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    // Handle Instagram (copy link as it doesn't support direct sharing)
    if (platform.id === 'instagram' || platform.id === 'youtube') {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(`Link copied! Share it on ${platform.name}`);
      return;
    }

    // Try native share API on mobile
    if (navigator.share && platform.id !== 'email') {
      try {
        await navigator.share({
          title: title,
          text: message,
          url: shareUrl
        });
        return;
      } catch (error) {
        // Fallback to platform-specific URL
      }
    }

    // Open platform-specific share URL
    const platformShareUrl = platform.getShareUrl(shareUrl, title, message);
    window.open(platformShareUrl, '_blank', 'width=600,height=400');
  };

  // Don't render if disabled
  if (settings && !settings.is_enabled) return null;

  const positionClasses = settings?.button_position === 'bottom-left' 
    ? 'left-4 sm:left-6' 
    : 'right-4 sm:right-6';

  const themeClasses = {
    'pahadi-green': 'bg-emerald-600 hover:bg-emerald-700 text-white',
    'light': 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200',
    'dark': 'bg-gray-900 hover:bg-gray-800 text-white'
  };

  const buttonTheme = themeClasses[settings?.theme as keyof typeof themeClasses] || themeClasses['pahadi-green'];

  return (
    <div 
      className={cn(
        "fixed bottom-20 z-50 transition-all duration-500",
        positionClasses,
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
              buttonTheme
            )}
            aria-label="Share this page"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Share2 className="h-5 w-5" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center text-lg font-semibold">
              {settings?.share_title || "Share the Pahadi Spirit!"}
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-4 pb-6">
            {SHARE_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:bg-muted"
              >
                <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center text-white",
                  platform.color
                )}>
                  {platform.id === 'copy' && copied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    platform.icon
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
