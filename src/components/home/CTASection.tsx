import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomepageCTA } from "@/hooks/useHomepageCTAs";
import { icons } from "lucide-react";

interface CTASectionProps {
  ctas: HomepageCTA[];
  className?: string;
  wrapperClassName?: string;
}

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = icons[name as keyof typeof icons];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

export const CTAButton = ({ cta }: { cta: HomepageCTA }) => {
  const customStyles = cta.background_color || cta.text_color
    ? {
        backgroundColor: cta.background_color || undefined,
        color: cta.text_color || undefined,
        borderColor: cta.background_color || undefined,
      }
    : undefined;

  const buttonContent = (
    <>
      {cta.icon && <DynamicIcon name={cta.icon} className="h-4 w-4 mr-2" />}
      {cta.label}
    </>
  );

  return (
    <Button
      variant={cta.variant}
      size={cta.size}
      style={customStyles}
      asChild
    >
      <Link
        to={cta.url}
        target={cta.open_in_new_tab ? "_blank" : undefined}
        rel={cta.open_in_new_tab ? "noopener noreferrer" : undefined}
      >
        {buttonContent}
      </Link>
    </Button>
  );
};

export const HeroCTAs = ({ ctas }: { ctas: HomepageCTA[] }) => {
  if (!ctas.length) return null;

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-8">
      {ctas.map((cta) => (
        <CTAButton key={cta.id} cta={cta} />
      ))}
    </div>
  );
};

export const BelowHeroCTAs = ({ ctas }: { ctas: HomepageCTA[] }) => {
  if (!ctas.length) return null;

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {ctas.map((cta) => (
            <CTAButton key={cta.id} cta={cta} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const MidPageCTA = ({ ctas }: { ctas: HomepageCTA[] }) => {
  if (!ctas.length) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
          Ready to Explore More?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Discover the beauty, culture, and traditions of Uttarakhand with us.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {ctas.map((cta) => (
            <CTAButton key={cta.id} cta={cta} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const FooterCTA = ({ ctas }: { ctas: HomepageCTA[] }) => {
  if (!ctas.length) return null;

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
          Get in Touch
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Have questions or want to share your Pahadi story? We'd love to hear from you.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {ctas.map((cta) => (
            <CTAButton key={cta.id} cta={cta} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function CTASection({ ctas, className, wrapperClassName }: CTASectionProps) {
  if (!ctas.length) return null;

  return (
    <div className={wrapperClassName}>
      <div className={`flex flex-wrap gap-3 justify-center ${className || ""}`}>
        {ctas.map((cta) => (
          <CTAButton key={cta.id} cta={cta} />
        ))}
      </div>
    </div>
  );
}
