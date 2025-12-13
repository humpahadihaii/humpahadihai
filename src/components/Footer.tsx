import { Link } from "react-router-dom";
import { Instagram, Mail, Facebook, Youtube, MapPin, Phone, ArrowRight, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useCMSSettings, useCMSFooterLinks } from "@/hooks/useCMSSettings";

const Footer = () => {
  const { data: settings } = useCMSSettings();
  const { data: footerLinks = [] } = useCMSFooterLinks();

  // Group footer links
  const legalLinks = footerLinks.filter(link => 
    ['privacy-policy', 'terms-and-conditions', 'disclaimer', 'about'].includes(link.page_slug || '') ||
    link.url === '/contact'
  );
  
  const socialLinks = footerLinks.filter(link => link.is_external);

  const exploreLinks = [
    { name: "Culture & Traditions", path: "/culture" },
    { name: "Food Trails", path: "/food" },
    { name: "Travel & Nature", path: "/travel" },
    { name: "Photo Gallery", path: "/gallery" },
    { name: "Districts", path: "/districts" },
    { name: "Marketplace", path: "/marketplace" },
  ];

  // District links for SEO internal linking
  const districtLinks = [
    { name: "Almora District", path: "/districts/almora" },
    { name: "Pithoragarh District", path: "/districts/pithoragarh" },
    { name: "Chamoli District", path: "/districts/chamoli" },
    { name: "Bageshwar District", path: "/districts/bageshwar" },
    { name: "Nainital District", path: "/districts/nainital" },
  ];

  // Culture links for SEO internal linking
  const cultureLinks = [
    { name: "Uttarakhand Traditions", path: "/culture" },
    { name: "Folk Culture", path: "/culture" },
    { name: "Traditional Food", path: "/food" },
  ];

  const legalLinksData = [
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Disclaimer", path: "/disclaimer" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground pb-24 md:pb-6">
      {/* Main Footer Content */}
      <div className="container-wide py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-xl font-semibold mb-4">
              {settings?.site_name || "Hum Pahadi Haii"}
            </h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mb-6">
              {settings?.tagline || "Celebrating Uttarakhand's rich culture, traditions, and heritage through stories, food, and breathtaking landscapes."}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <a 
                href={`mailto:${settings?.email_contact || 'contact@humpahadihaii.in'}`}
                className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{settings?.email_contact || 'contact@humpahadihaii.in'}</span>
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
              Explore
              <ArrowRight className="h-4 w-4 opacity-60" />
            </h4>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* District Links - SEO Internal Linking */}
          <div>
            <h4 className="font-semibold text-base mb-4">Popular Districts</h4>
            <ul className="space-y-2.5">
              {districtLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Culture Links */}
          <div>
            <h4 className="font-semibold text-base mb-4">Culture & Legal</h4>
            <ul className="space-y-2.5">
              {cultureLinks.map((link) => (
                <li key={link.path + link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="border-t border-primary-foreground/15 pt-2 mt-2">
                <Link 
                  to="/privacy-policy" 
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 inline-block"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 inline-block"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Connect */}
          <div>
            <h4 className="font-semibold text-base mb-4">Connect With Us</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
                  aria-label="Subscribe on YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
              <a
                href={`mailto:${settings?.email_contact || 'contact@humpahadihaii.in'}`}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
                aria-label="Send us an email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-primary-foreground/70">@hum_pahadi_haii</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/15">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
            <p>&copy; {new Date().getFullYear()} {settings?.site_name || "Hum Pahadi Haii"}. All rights reserved.</p>
            <p className="text-center sm:text-right">Made with ❤️ in Uttarakhand</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
