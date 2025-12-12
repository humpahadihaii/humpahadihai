import { Link } from "react-router-dom";
import { Instagram, Mail, Facebook, Youtube } from "lucide-react";
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

  return (
    <footer className="bg-primary text-primary-foreground pb-24 md:pb-4">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">{settings?.site_name || "Hum Pahadi Haii"}</h3>
            <p className="text-sm opacity-90">
              {settings?.tagline || "Celebrating Uttarakhand's rich culture, traditions, and heritage through stories, food, and breathtaking landscapes."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/culture" className="hover:opacity-70 transition-opacity">Culture & Traditions</Link></li>
              <li><Link to="/food" className="hover:opacity-70 transition-opacity">Food Trails</Link></li>
              <li><Link to="/travel" className="hover:opacity-70 transition-opacity">Travel & Nature</Link></li>
              <li><Link to="/gallery" className="hover:opacity-70 transition-opacity">Gallery</Link></li>
            </ul>
          </div>

          {/* Legal - CMS Driven */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:opacity-70 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:opacity-70 transition-opacity">Terms & Conditions</Link></li>
              <li><Link to="/disclaimer" className="hover:opacity-70 transition-opacity">Disclaimer</Link></li>
              <li><Link to="/contact" className="hover:opacity-70 transition-opacity">Contact</Link></li>
            </ul>
          </div>

          {/* Social - CMS Driven */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <div className="flex gap-3 mb-4">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-foreground/10 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-foreground/10 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-foreground/10 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              <a
                href={`mailto:${settings?.email_contact || 'contact@humpahadihaii.in'}`}
                className="bg-primary-foreground/10 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm opacity-90">@hum_pahadi_haii</p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} {settings?.site_name || "Hum Pahadi Haii"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
