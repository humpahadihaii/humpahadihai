import { Link } from "react-router-dom";
import { MapPin, Palette, Camera, Mountain, UtensilsCrossed } from "lucide-react";

interface LinkItem {
  title: string;
  href: string;
  description?: string;
}

interface InternalLinksProps {
  title: string;
  links: LinkItem[];
  variant?: "default" | "compact" | "inline";
  icon?: "district" | "culture" | "gallery" | "food" | "travel";
}

const iconMap = {
  district: MapPin,
  culture: Palette,
  gallery: Camera,
  food: UtensilsCrossed,
  travel: Mountain,
};

/**
 * SEO-friendly internal linking component with static anchor tags
 * Used to create structured navigation between related content
 */
const InternalLinks = ({ title, links, variant = "default", icon }: InternalLinksProps) => {
  const Icon = icon ? iconMap[icon] : null;

  if (links.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground font-medium">{title}:</span>
        {links.map((link, index) => (
          <span key={link.href}>
            <Link 
              to={link.href}
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              {link.title}
            </Link>
            {index < links.length - 1 && <span className="text-muted-foreground ml-2">•</span>}
          </span>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="py-4">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </h4>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link 
                to={link.href}
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link 
              to={link.href}
              className="group flex flex-col"
            >
              <span className="text-primary font-medium group-hover:text-primary/80 group-hover:underline transition-colors">
                {link.title}
              </span>
              {link.description && (
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {link.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InternalLinks;

// Pre-defined link collections for common use cases
export const DISTRICT_LINKS = [
  { title: "Almora District Culture", href: "/districts/almora" },
  { title: "Pithoragarh Traditions & Heritage", href: "/districts/pithoragarh" },
  { title: "Chamoli Cultural Life", href: "/districts/chamoli" },
  { title: "Nainital District", href: "/districts/nainital" },
  { title: "Bageshwar Heritage", href: "/districts/bageshwar" },
  { title: "Tehri Garhwal", href: "/districts/tehri-garhwal" },
];

export const CULTURE_LINKS = [
  { title: "Kumaoni Cultural Traditions", href: "/culture" },
  { title: "Traditional Foods of Uttarakhand", href: "/food" },
  { title: "Garhwali & Kumaoni Folk Traditions", href: "/culture" },
];

export const GALLERY_LINK = { 
  title: "Uttarakhand Culture Photo Gallery", 
  href: "/gallery" 
};

// Helper to get related districts for a region
export const getRelatedDistrictLinks = (currentSlug: string, region?: string) => {
  const garhwalDistricts = [
    { title: "Chamoli District", href: "/districts/chamoli" },
    { title: "Dehradun District", href: "/districts/dehradun" },
    { title: "Haridwar District", href: "/districts/haridwar" },
    { title: "Pauri Garhwal", href: "/districts/pauri-garhwal" },
    { title: "Rudraprayag District", href: "/districts/rudraprayag" },
    { title: "Tehri Garhwal", href: "/districts/tehri-garhwal" },
    { title: "Uttarkashi District", href: "/districts/uttarkashi" },
  ];

  const kumaonDistricts = [
    { title: "Almora District", href: "/districts/almora" },
    { title: "Bageshwar District", href: "/districts/bageshwar" },
    { title: "Champawat District", href: "/districts/champawat" },
    { title: "Nainital District", href: "/districts/nainital" },
    { title: "Pithoragarh District", href: "/districts/pithoragarh" },
    { title: "Udham Singh Nagar", href: "/districts/udham-singh-nagar" },
  ];

  const allDistricts = region?.toLowerCase() === "garhwal" 
    ? garhwalDistricts 
    : region?.toLowerCase() === "kumaon" 
      ? kumaonDistricts 
      : [...garhwalDistricts, ...kumaonDistricts];

  return allDistricts
    .filter(d => !d.href.includes(currentSlug))
    .slice(0, 3);
};
