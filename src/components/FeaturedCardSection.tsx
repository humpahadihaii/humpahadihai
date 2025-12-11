import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Pencil
} from "lucide-react";
import { usePublicFeaturedCards, getLocalizedText, type FeaturedCard } from "@/hooks/useFeaturedCards";
import { useSiteImages } from "@/hooks/useSiteImages";
import { trackInternalEvent } from "@/lib/internalTracker";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import aipanPatternFallback from "@/assets/aipan-pattern.jpg";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  globe: Globe,
  mail: Mail,
  phone: Phone,
  "map-pin": MapPin,
};

interface FeaturedCardItemProps {
  card: FeaturedCard;
  locale?: string;
  fallbackImage?: string;
  showEditButton?: boolean;
}

const FeaturedCardItem = ({ 
  card, 
  locale = "en", 
  fallbackImage,
  showEditButton = false 
}: FeaturedCardItemProps) => {
  const IconComponent = ICON_MAP[card.icon_name || "instagram"] || Instagram;
  
  const title = getLocalizedText(card.title, locale);
  const subtitle = getLocalizedText(card.subtitle, locale);
  const ctaLabel = getLocalizedText(card.cta_label, locale);
  const ctaUrl = getLocalizedText(card.cta_url, locale);
  const imageAlt = getLocalizedText(card.image_alt, locale) || title;

  const handleCtaClick = () => {
    trackInternalEvent({
      eventName: "featured_card_cta_click",
      metadata: {
        card_slug: card.slug,
        card_id: card.id,
        locale,
        cta_url: ctaUrl,
      },
    });
  };

  const isExternalLink = ctaUrl.startsWith("http") || ctaUrl.startsWith("mailto:") || ctaUrl.startsWith("wa.me");

  return (
    <div 
      className="rounded-2xl p-12 shadow-xl relative overflow-hidden"
      style={{ 
        backgroundImage: card.image_url 
          ? `url(${card.image_url})` 
          : fallbackImage 
            ? `url(${fallbackImage})`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className={`absolute inset-0 ${card.gradient_color || 'bg-white/85'}`}></div>
      
      {showEditButton && (
        <Link 
          to={`/admin/featured-cards`}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          title="Edit this card"
        >
          <Pencil className="h-4 w-4 text-primary" />
        </Link>
      )}
      
      <div className="relative z-10 text-center">
        <IconComponent className="h-16 w-16 text-secondary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-primary mb-4">{title}</h2>
        <p className="text-lg text-foreground/80 mb-6">{subtitle}</p>
        
        {isExternalLink ? (
          <Button 
            size="lg" 
            asChild 
            className="bg-secondary hover:bg-secondary/90 text-white shadow-lg"
            onClick={handleCtaClick}
          >
            <a 
              href={ctaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={imageAlt}
            >
              {ctaLabel}
            </a>
          </Button>
        ) : (
          <Button 
            size="lg" 
            asChild 
            className="bg-secondary hover:bg-secondary/90 text-white shadow-lg"
            onClick={handleCtaClick}
          >
            <Link to={ctaUrl}>{ctaLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

interface FeaturedCardSectionProps {
  slug?: string;
  locale?: string;
  className?: string;
}

export const FeaturedCardSection = ({ 
  slug = "follow-our-journey",
  locale = "en",
  className = ""
}: FeaturedCardSectionProps) => {
  const { data: cards, isLoading } = usePublicFeaturedCards(locale);
  const { getImage } = useSiteImages();
  const { roles } = useAuth();
  
  const fallbackImage = getImage('instagram_cta_background', aipanPatternFallback);
  
  // Check if user can edit (super_admin or admin)
  const canEdit = roles?.some(r => r === 'super_admin' || r === 'admin');

  if (isLoading) {
    return (
      <section className={`py-16 px-4 ${className}`}>
        <div className="container mx-auto max-w-3xl">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </section>
    );
  }

  // If slug is provided, show specific card
  if (slug) {
    const card = cards?.find(c => c.slug === slug);
    
    if (!card) {
      return null;
    }

    return (
      <section className={`py-16 px-4 ${className}`}>
        <div className="container mx-auto max-w-3xl text-center">
          <FeaturedCardItem 
            card={card} 
            locale={locale} 
            fallbackImage={fallbackImage}
            showEditButton={canEdit}
          />
        </div>
      </section>
    );
  }

  // Show all cards if no slug
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {cards.map((card) => (
            <FeaturedCardItem 
              key={card.id}
              card={card} 
              locale={locale}
              fallbackImage={fallbackImage}
              showEditButton={canEdit}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCardSection;
