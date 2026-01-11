import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary/5 border-t border-border/50 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center">
                <span className="arabic text-xl font-bold text-white">ع</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                Urbania <span className="text-primary">Welfare</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Committed to supporting and uplifting the community by providing essential welfare
              services, educational programs, and volunteering opportunities.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">Events</Link>
              <Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services</Link>
              <Link to="/education" className="text-sm text-muted-foreground hover:text-primary transition-colors">Education</Link>
              <Link to="/volunteering" className="text-sm text-muted-foreground hover:text-primary transition-colors">Volunteering</Link>
              <Link to="/registration" className="text-sm text-muted-foreground hover:text-primary transition-colors">Registration</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  123 Urbania Street, Community District<br />
                  Boston, MA 02125
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+15551234567" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:info@urbaniawelfare.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@urbaniawelfare.org
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Mon-Fri: 9AM-5PM | Sat-Sun: 10AM-3PM
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Urbania Welfare Community Center. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
