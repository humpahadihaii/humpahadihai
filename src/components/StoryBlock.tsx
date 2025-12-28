import { Link } from "react-router-dom";
import { Mountain, Heart, Sparkles, Trees, Home, Sun } from "lucide-react";
import { memo } from "react";

interface StoryBlockProps {
  variant?: "default" | "subtle" | "accent";
  theme?: keyof typeof STORY_THEMES;
  className?: string;
  showLink?: boolean;
}

const THEME_ICONS = {
  hills: Mountain,
  culture: Sparkles,
  villages: Home,
  faith: Heart,
  traditions: Sun,
  nature: Trees,
};

const STORY_THEMES = {
  hills: {
    title: "Life in the Hills",
    story: "Life in Uttarakhand moves with the rhythm of the mountains — slow, resilient, and deeply connected to nature. Every sunrise brings gratitude, every season a celebration.",
    icon: "hills" as const,
    link: { text: "Explore our villages", url: "/districts" },
  },
  culture: {
    title: "Why Pahadi Culture is Different",
    story: "In the hills, community is everything. Neighbors are family, festivals are shared, and traditions flow through generations like mountain streams — pure and unbroken.",
    icon: "culture" as const,
    link: { text: "Discover our culture", url: "/culture" },
  },
  villages: {
    title: "Stories from Our Villages",
    story: "Each village holds centuries of wisdom — in the architecture of stone houses, the melodies of folk songs, and the recipes passed down from grandmother to grandchild.",
    icon: "villages" as const,
    link: { text: "See our heritage", url: "/gallery" },
  },
  faith: {
    title: "Mountains, Faith & Daily Life",
    story: "Here, spirituality isn't separate from life — it's woven into morning prayers, temple bells echoing through valleys, and the quiet reverence for nature's gifts.",
    icon: "faith" as const,
    link: { text: "Explore spiritual places", url: "/culture" },
  },
  traditions: {
    title: "Traditions Passed Through Generations",
    story: "From Aipan art to harvest festivals, from hand-woven woolens to age-old recipes — every tradition carries the soul of those who came before us.",
    icon: "traditions" as const,
    link: { text: "Learn about traditions", url: "/history" },
  },
  nature: {
    title: "Where Nature Speaks",
    story: "The Himalayas teach patience. The rivers teach persistence. Living among these ancient mountains, we learn to take only what we need and give back with gratitude.",
    icon: "nature" as const,
    link: { text: "View our landscapes", url: "/gallery" },
  },
};

export const StoryBlock = memo(({ 
  variant = "default", 
  theme = "hills",
  className = "",
  showLink = true 
}: StoryBlockProps) => {
  const content = STORY_THEMES[theme];
  const IconComponent = THEME_ICONS[content.icon];

  const bgStyles = {
    default: "bg-muted/30 border-border/40",
    subtle: "bg-transparent border-border/20",
    accent: "bg-primary/5 border-primary/10",
  };

  return (
    <div className={`rounded-2xl border ${bgStyles[variant]} p-6 md:p-8 ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
          <IconComponent className="h-6 w-6" />
        </div>
        
        {/* Title */}
        <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-3">
          {content.title}
        </h3>
        
        {/* Story */}
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          {content.story}
        </p>
        
        {/* Optional Link */}
        {showLink && content.link && (
          <Link 
            to={content.link.url}
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {content.link.text}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  );
});

StoryBlock.displayName = "StoryBlock";

// Compact inline version for sidebars or smaller spaces
export const StoryBlockInline = memo(({ 
  theme = "hills",
  className = "" 
}: { theme?: keyof typeof STORY_THEMES; className?: string }) => {
  const content = STORY_THEMES[theme];
  const IconComponent = THEME_ICONS[content.icon];

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/30 ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground text-sm mb-1">{content.title}</h4>
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
          {content.story}
        </p>
      </div>
    </div>
  );
});

StoryBlockInline.displayName = "StoryBlockInline";

// Rotating story block that cycles through themes
export const RotatingStoryBlock = memo(({ 
  variant = "default",
  className = "",
  showLink = true 
}: Omit<StoryBlockProps, "theme">) => {
  // Deterministic rotation based on day of year
  const themes = Object.keys(STORY_THEMES) as Array<keyof typeof STORY_THEMES>;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const theme = themes[dayOfYear % themes.length];

  return <StoryBlock variant={variant} theme={theme} className={className} showLink={showLink} />;
});

RotatingStoryBlock.displayName = "RotatingStoryBlock";

export default StoryBlock;
