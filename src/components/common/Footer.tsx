import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';

export function Footer() {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  // Helper to map icon classes to Lucide icons
  const renderSocialIcon = (iconClass: string) => {
    if (iconClass.includes('facebook')) return <Facebook className="h-4 w-4" />;
    if (iconClass.includes('twitter') || iconClass.includes('x')) return <Twitter className="h-4 w-4" />;
    if (iconClass.includes('instagram')) return <Instagram className="h-4 w-4" />;
    if (iconClass.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
    if (iconClass.includes('youtube')) return <Youtube className="h-4 w-4" />;
    if (iconClass.includes('mail')) return <Mail className="h-4 w-4" />;
    return null;
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.siteTitle || "Logo"}
                  className="h-[40px] md:h-[55px] w-auto"
                />
              ) : (
                <img
                  src="/puclogo.png"
                  alt="BookMyPUC Logo"
                  className="h-[40px] md:h-[55px] w-auto"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for hassle-free PUC certificate bookings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/find-centers" className="text-muted-foreground hover:text-primary">
                  Find Centers
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-muted-foreground hover:text-primary">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-muted-foreground hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: carburantepuc@gmail.com</li>
              <li>Phone: +91 8180820024</li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            <p>{settings.copyrightText || `© ${currentYear} BookMyPUC. All rights reserved.`}</p>
          </div>
          {settings.socialLinks && settings.socialLinks.length > 0 && (
            <div className="flex space-x-4">
              {settings.socialLinks.map((social, index) => {
                if (!social.url || !social.icon) return null;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={social.name || social.social || 'Social link'}
                  >
                    {renderSocialIcon(social.icon)}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
