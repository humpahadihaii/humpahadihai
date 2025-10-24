import { Link } from "react-router-dom";
import { Instagram, Mail, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">Hum Pahadi Haii</h3>
            <p className="text-sm opacity-90">
              Celebrating Uttarakhand's rich culture, traditions, and heritage through stories, food, and breathtaking landscapes.
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

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:opacity-70 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:opacity-70 transition-opacity">Terms & Conditions</Link></li>
              <li><Link to="/disclaimer" className="hover:opacity-70 transition-opacity">Disclaimer</Link></li>
              <li><Link to="/contact" className="hover:opacity-70 transition-opacity">Contact</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <div className="flex gap-3 mb-4">
              <a
                href="https://instagram.com/hum_pahadi_haii"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-foreground/10 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-foreground/10 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@humpahadi.com"
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
          <p>&copy; {new Date().getFullYear()} Hum Pahadi Haii. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
