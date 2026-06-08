import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import PreloaderWrapper from '@/components/common/PreloaderWrapper';

import routes from './routes';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SiteSettingsProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <IntersectObserver />
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                <PreloaderWrapper>
                  <Routes>
                    {routes.map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </PreloaderWrapper>
              </main>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </SiteSettingsProvider>
    </ThemeProvider>
  );
};

export default App;
