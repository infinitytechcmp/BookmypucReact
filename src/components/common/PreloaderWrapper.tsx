import React from 'react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();

  if (loading && settings.preloaderEnabled === '1') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {settings.logo ? (
            <img src={settings.logo} alt="Loading..." className="h-12 w-auto animate-pulse" />
          ) : (
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          )}
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
