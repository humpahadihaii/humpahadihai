import { cn } from "@/lib/utils";
import { 
  Facebook, Twitter, MessageCircle, Linkedin, Instagram, Mail, Eye,
  Smartphone, Monitor
} from "lucide-react";
import { PLATFORM_LIMITS, getPlatformPreview, Platform } from "@/lib/sharePreviewUtils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlatformPreviewSimulatorProps {
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  titleSuffix?: string;
  siteUrl?: string;
  className?: string;
}

const PLATFORM_CONFIG = {
  facebook: { 
    label: 'Facebook', 
    icon: Facebook, 
    color: 'text-blue-600',
    bgColor: 'bg-[#f0f2f5]'
  },
  twitter: { 
    label: 'X (Twitter)', 
    icon: Twitter, 
    color: 'text-sky-500',
    bgColor: 'bg-black'
  },
  whatsapp: { 
    label: 'WhatsApp', 
    icon: MessageCircle, 
    color: 'text-green-600',
    bgColor: 'bg-[#e5ddd5]'
  },
  linkedin: { 
    label: 'LinkedIn', 
    icon: Linkedin, 
    color: 'text-blue-700',
    bgColor: 'bg-[#f3f2ef]'
  },
  instagram: { 
    label: 'Instagram', 
    icon: Instagram, 
    color: 'text-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'
  },
  email: { 
    label: 'Email', 
    icon: Mail, 
    color: 'text-orange-500',
    bgColor: 'bg-white'
  }
} as const;

function CharCounter({ current, max, label }: { current: number; max: number; label: string }) {
  const percentage = (current / max) * 100;
  const isOver = current > max;
  const isNearLimit = percentage > 85 && !isOver;
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn(
        "font-mono",
        isOver && "text-red-500 font-semibold",
        isNearLimit && "text-yellow-600",
        !isOver && !isNearLimit && "text-green-600"
      )}>
        {current}/{max}
      </span>
      {isOver && <Badge variant="destructive" className="text-[10px] px-1 py-0">Truncated</Badge>}
    </div>
  );
}

function FacebookPreview({ preview, image, siteUrl }: { 
  preview: ReturnType<typeof getPlatformPreview>; 
  image?: string;
  siteUrl: string;
}) {
  return (
    <div className="bg-[#f0f2f5] p-3 rounded-lg">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        {image ? (
          <div className="relative">
            <img src={image} alt="Preview" className="w-full h-[157px] object-cover" />
          </div>
        ) : (
          <div className="w-full h-[157px] bg-muted flex items-center justify-center">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="p-3 bg-[#f2f3f5]">
          <p className="text-xs text-[#65676b] uppercase tracking-wide">{siteUrl}</p>
          <h3 className="font-semibold text-[15px] text-[#050505] leading-tight mt-0.5 line-clamp-2">
            {preview.title}
          </h3>
          <p className="text-[13px] text-[#65676b] line-clamp-1 mt-0.5">
            {preview.description}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-3">
        <CharCounter current={preview.titleLength} max={preview.charLimits.title} label="Title" />
        <CharCounter current={preview.descriptionLength} max={preview.charLimits.description} label="Desc" />
      </div>
    </div>
  );
}

function TwitterPreview({ preview, image, siteUrl }: { 
  preview: ReturnType<typeof getPlatformPreview>; 
  image?: string;
  siteUrl: string;
}) {
  return (
    <div className="bg-black p-3 rounded-lg">
      <div className="bg-white rounded-2xl overflow-hidden">
        {image ? (
          <img src={image} alt="Preview" className="w-full h-[157px] object-cover" />
        ) : (
          <div className="w-full h-[157px] bg-muted flex items-center justify-center">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-semibold text-[15px] text-black leading-tight line-clamp-2">
            {preview.title}
          </h3>
          <p className="text-[13px] text-[#536471] line-clamp-2 mt-1">
            {preview.description}
          </p>
          <p className="text-[13px] text-[#536471] flex items-center gap-1 mt-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-5.66 2.12l-1.41 1.42c-1.96 1.95-1.96 5.11 0 7.07 1.95 1.95 5.11 1.95 7.07 0l1.41-1.42 1.41 1.42-1.41 1.41c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.73-2.73-7.16 0-9.9l1.42-1.41 1.41 1.41z" />
            </svg>
            {siteUrl}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-3">
        <CharCounter current={preview.titleLength} max={preview.charLimits.title} label="Title" />
        <CharCounter current={preview.descriptionLength} max={preview.charLimits.description} label="Desc" />
      </div>
    </div>
  );
}

function WhatsAppPreview({ preview, image, siteUrl }: { 
  preview: ReturnType<typeof getPlatformPreview>; 
  image?: string;
  siteUrl: string;
}) {
  return (
    <div className="bg-[#e5ddd5] p-3 rounded-lg">
      <div className="flex justify-end">
        <div className="bg-[#dcf8c6] rounded-lg p-2 max-w-[280px] shadow-sm">
          <div className="bg-white rounded-lg overflow-hidden mb-1">
            {image ? (
              <img src={image} alt="Preview" className="w-full h-[120px] object-cover" />
            ) : (
              <div className="w-full h-[120px] bg-muted flex items-center justify-center">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="p-2">
              <p className="text-[10px] text-teal-600 font-medium uppercase">{siteUrl}</p>
              <h3 className="font-semibold text-[12px] text-black leading-tight line-clamp-2">
                {preview.title}
              </h3>
              <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                {preview.description}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-blue-600 underline truncate">
            {siteUrl}
          </p>
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-gray-500">10:30 AM</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-3">
        <CharCounter current={preview.titleLength} max={preview.charLimits.title} label="Title" />
        <CharCounter current={preview.descriptionLength} max={preview.charLimits.description} label="Desc" />
      </div>
    </div>
  );
}

function LinkedInPreview({ preview, image, siteUrl }: { 
  preview: ReturnType<typeof getPlatformPreview>; 
  image?: string;
  siteUrl: string;
}) {
  return (
    <div className="bg-[#f3f2ef] p-3 rounded-lg">
      <div className="bg-white rounded-lg overflow-hidden shadow border border-gray-200">
        {image ? (
          <img src={image} alt="Preview" className="w-full h-[157px] object-cover" />
        ) : (
          <div className="w-full h-[157px] bg-muted flex items-center justify-center">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="p-3 border-t">
          <h3 className="font-semibold text-[14px] text-[#000000e6] leading-tight line-clamp-2">
            {preview.title}
          </h3>
          <p className="text-[12px] text-[#00000099] mt-0.5">{siteUrl}</p>
        </div>
      </div>
      <div className="mt-2 flex gap-3">
        <CharCounter current={preview.titleLength} max={preview.charLimits.title} label="Title" />
        <CharCounter current={preview.descriptionLength} max={preview.charLimits.description} label="Desc" />
      </div>
    </div>
  );
}

export function PlatformPreviewSimulator({
  title,
  description,
  image,
  siteName = 'Hum Pahadi Haii',
  titleSuffix = '',
  siteUrl = 'humpahadihaii.in',
  className
}: PlatformPreviewSimulatorProps) {
  const platforms: Platform[] = ['facebook', 'twitter', 'whatsapp', 'linkedin'];
  
  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="facebook" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {platforms.map(platform => {
            const config = PLATFORM_CONFIG[platform];
            const Icon = config.icon;
            return (
              <TabsTrigger key={platform} value={platform} className="gap-1">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {platforms.map(platform => {
          const preview = getPlatformPreview(platform, { 
            title, 
            description, 
            image,
            siteName,
            titleSuffix
          });
          
          return (
            <TabsContent key={platform} value={platform} className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Tabs defaultValue="mobile" className="w-full">
                  <TabsList className="h-8">
                    <TabsTrigger value="mobile" className="h-7 gap-1 px-2">
                      <Smartphone className="h-3 w-3" /> Mobile
                    </TabsTrigger>
                    <TabsTrigger value="desktop" className="h-7 gap-1 px-2">
                      <Monitor className="h-3 w-3" /> Desktop
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="mobile" className="mt-3">
                    <div className="max-w-[320px] mx-auto">
                      {platform === 'facebook' && (
                        <FacebookPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                      {platform === 'twitter' && (
                        <TwitterPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                      {platform === 'whatsapp' && (
                        <WhatsAppPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                      {platform === 'linkedin' && (
                        <LinkedInPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="desktop" className="mt-3">
                    <div className="max-w-[500px]">
                      {platform === 'facebook' && (
                        <FacebookPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                      {platform === 'twitter' && (
                        <TwitterPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                      {platform === 'whatsapp' && (
                        <WhatsAppPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                      {platform === 'linkedin' && (
                        <LinkedInPreview preview={preview} image={image} siteUrl={siteUrl} />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
