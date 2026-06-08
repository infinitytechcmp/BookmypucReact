import React, { createContext, useContext, useEffect, useState } from 'react';
import { cmsService } from '@/services/cmsService';
import { colorToHsl } from '@/utils/colorUtils';

interface SocialLink {
  key: string;
  value: string;
}

export interface SiteSettings {
  logo?: string;
  adminLogo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  footerBackgroundColor?: string;
  footerBottomBackgroundColor?: string;
  footerHeadingColor?: string;
  footerTextColor?: string;
  copyrightText?: string;
  headerActionLabel?: string;
  headerActionUrl?: string;
  siteTitle?: string;
  seoDescription?: string;
  socialLinks?: Array<Record<string, string>>;
  preloaderEnabled?: string;
  preloaderVersion?: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    cmsService.getThemeOptions().then(response => {
      if (mounted) {
        if (!response.error && response.data) {
          const data = response.data;

          // Parse social links
          let socialLinks = [];
          if (data['apexa-social_links']) {
            try {
              const parsed = JSON.parse(data['apexa-social_links']);
              // The API returns an array of arrays of {key, value}. Let's flatten to array of objects.
              // Example: [[{"key":"name","value":"Facebook"},{"key":"url","value":"..."}]]
              socialLinks = parsed.map((itemArr: any[]) => {
                const obj: Record<string, string> = {};
                itemArr.forEach(item => {
                  obj[item.key] = item.value;
                });
                return obj;
              });
            } catch (e) {
              console.error('Failed to parse social links', e);
            }
          }

          const newSettings: SiteSettings = {
            logo: cmsService.getImageUrl(data['apexa-logo']) || undefined,
            adminLogo: cmsService.getImageUrl(data['apexa-admin_logo']) || undefined,
            favicon: cmsService.getImageUrl(data['apexa-favicon']) || undefined,
            primaryColor: data['apexa-primary_color'],
            secondaryColor: data['apexa-secondary_color'],
            footerBackgroundColor: data['apexa-footer_background_color'],
            footerBottomBackgroundColor: data['apexa-footer_bottom_background_color'],
            footerHeadingColor: data['apexa-footer_heading_color'],
            footerTextColor: data['apexa-footer_text_color'],
            copyrightText: data['apexa-copyright']?.replace('%Y', new Date().getFullYear().toString()),
            headerActionLabel: data['apexa-header_action_label'],
            headerActionUrl: data['apexa-header_action_url'],
            siteTitle: data['apexa-site_title'],
            seoDescription: data['apexa-seo_description'],
            preloaderEnabled: data['apexa-preloader_enabled'],
            preloaderVersion: data['apexa-preloader_version'],
            socialLinks,
          };

          setSettings(newSettings);

          // Apply dynamic CSS variables for Tailwind
          const root = document.documentElement;
          if (newSettings.primaryColor) {
            const hsl = colorToHsl(newSettings.primaryColor);
            if (hsl) {
              root.style.setProperty('--primary', hsl);
              // Also map to chart-1 for consistency in charts
              root.style.setProperty('--chart-1', hsl);
            }
          }
          if (newSettings.secondaryColor) {
            const hsl = colorToHsl(newSettings.secondaryColor);
            if (hsl) {
              root.style.setProperty('--secondary', hsl);
              // Map to chart-2 so gradient texts utilize the secondary color
              root.style.setProperty('--chart-2', hsl);
            }
          }
          // if (data['apexa-text_color']) {
          //   const hsl = colorToHsl(data['apexa-text_color']);
          //   if (hsl) {
          //     root.style.setProperty('--foreground', hsl);
          //   }
          // }

          // Apply Favicon
          if (newSettings.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = newSettings.favicon;
            if (data['apexa-favicon_type']) {
              link.type = data['apexa-favicon_type'];
            }
          }

          // Apply SEO Title
          if (newSettings.siteTitle) {
            document.title = newSettings.siteTitle;
          }

          // Apply SEO Description
          if (newSettings.seoDescription) {
            let meta = document.querySelector("meta[name='description']") as HTMLMetaElement;
            if (!meta) {
              meta = document.createElement('meta');
              meta.name = 'description';
              document.head.appendChild(meta);
            }
            meta.content = newSettings.seoDescription;
          }

          // Apply Fonts
          const primaryFont = data['apexa-tp_primary_font'];
          const secondaryFont = data['apexa-tp_secondary_font'];

          if (primaryFont || secondaryFont) {
            const fontUrl = `https://fonts.googleapis.com/css2?${[primaryFont, secondaryFont]
              .filter(Boolean)
              .map(f => `family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700`)
              .join('&')}&display=swap`;

            let link = document.querySelector("link[id='dynamic-fonts']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.id = 'dynamic-fonts';
              link.rel = 'stylesheet';
              document.head.appendChild(link);
            }
            link.href = fontUrl;

            if (primaryFont) {
              root.style.setProperty('--font-primary', `"${primaryFont}", sans-serif`);
            }
            if (secondaryFont) {
              root.style.setProperty('--font-secondary', `"${secondaryFont}", sans-serif`);
            }
          }
        }
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to fetch theme options:', err);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
