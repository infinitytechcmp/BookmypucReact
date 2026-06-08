import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cmsService } from '@/services/cmsService';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Moon, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { NotificationBell } from '@/components/common/NotificationBell';

interface NavLink {
  name: string;
  path: string;
  children?: NavLink[];
}

export function Navbar() {
  const { toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { settings } = useSiteSettings();
  const location = useLocation();

  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    cmsService.getMenuBySlug('header')
      .then(data => {
        if (data && !data.error && data.data) {
          const nodes = Array.isArray(data.data) ? data.data : (data.data.menu_nodes || data.data.data || []);
          if (Array.isArray(nodes) && nodes.length > 0) {

            const formatPath = (rawPath: string) => {
              let path = rawPath || '/';
              try {
                if (path.startsWith('http')) {
                  path = new URL(path).pathname;
                }
              } catch (e) { }

              // Ensure path is absolute to prevent relative URL stacking (e.g., /about/contact)
              if (!path.startsWith('/')) {
                path = `/${path}`;
              }

              return path;
            };

            const parseNodes = (menuNodes: any[]): NavLink[] => {
              return menuNodes.map(item => ({
                name: item.title || item.name || 'Menu Item',
                path: formatPath(item.url),
                children: item.child && Array.isArray(item.child) && item.child.length > 0
                  ? parseNodes(item.child)
                  : undefined
              }));
            };

            const fetchedLinks = parseNodes(nodes);
            if (fetchedLinks.length > 0) {
              setNavLinks(fetchedLinks);
            }
          }
        }
      })
      .catch(err => console.error('Failed to fetch main menu:', err));
  }, []);

  const isActive = (link: NavLink, currentPath: string): boolean => {
    if (currentPath === link.path) return true;
    if (link.children && link.children.some(child => isActive(child, currentPath))) {
      return true;
    }
    // Check if path is a parent directory (excluding root '/')
    if (link.path !== '/' && currentPath.startsWith(`${link.path}/`)) {
      return true;
    }
    return false;
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'shopOwner') return '/shop-owner/dashboard';
    return '/user/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo with Animation */}
        <Link to="/" className="group flex items-center">
          {settings.logo ? (
            <img
              src={settings.logo}
              alt={settings.siteTitle || "Logo"}
              className="h-[40px] md:h-[55px] w-auto transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <img
              src="/puclogo.png"
              alt="BookMyPUC Logo"
              className="h-[40px] md:h-[55px] w-auto transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 lg:flex">
          {navLinks.map((link) => (
            <div key={link.path} className="group relative">
              <Link
                to={link.path}
                className={`flex items-center gap-1 text-sm transition-colors py-2 ${isActive(link, location.pathname) ? 'text-primary font-semibold' : 'text-muted-foreground font-medium hover:text-primary'
                  }`}
              >
                {link.name}
                {link.children && <ChevronDown className={`h-4 w-4 transition-transform group-hover:rotate-180 ${isActive(link, location.pathname) ? 'text-primary' : ''}`} />}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-chart-2 transition-all duration-300 ${isActive(link, location.pathname) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
              </Link>

              {/* Desktop Dropdown Menu */}
              {link.children && (
                <div className="absolute left-0 top-full hidden w-56 pt-2 group-hover:block animate-in fade-in slide-in-from-top-2">
                  <div className="rounded-xl border border-border/50 bg-background/95 p-2 shadow-xl backdrop-blur-md">
                    {link.children.map(child => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block rounded-md px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${isActive(child, location.pathname) ? 'bg-primary/5 text-primary' : 'text-muted-foreground'
                          }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell - Only show when authenticated */}
          {isAuthenticated && <NotificationBell />}

          {/* Theme Toggle with Animation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="group relative overflow-hidden rounded-full transition-all hover:bg-primary/10"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all group-hover:rotate-180 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all group-hover:-rotate-180 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Auth Buttons or Header Action */}
          {/* {!isAuthenticated && settings.headerActionUrl && settings.headerActionLabel && (
            <Button className="group relative hidden overflow-hidden shadow-lg transition-all hover:shadow-primary/50 md:inline-flex" asChild>
              <Link to={settings.headerActionUrl}>
                <span className="relative z-10">{settings.headerActionLabel}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </Button>
          )} */}

          {isAuthenticated ? (
            <Button
              variant="default"
              className="group relative hidden overflow-hidden shadow-lg transition-all hover:shadow-primary/50 md:inline-flex"
              asChild
            >
              <Link to={getDashboardPath()}>
                <span className="relative z-10">Dashboard</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="hidden hover:bg-primary/10 md:inline-flex" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="group relative hidden overflow-hidden shadow-lg transition-all hover:shadow-primary/50 md:inline-flex" asChild>
                <Link to="/register">
                  <span className="relative z-10">Register</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <div key={link.path} className="flex flex-col space-y-1">
                    <SheetClose asChild>
                      <Link
                        to={link.path}
                        className={`group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive(link, location.pathname)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-primary'
                          }`}
                      >
                        <span className="relative">
                          {link.name}
                          <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive(link, location.pathname) ? 'w-full' : 'w-0 group-hover:w-full'
                            }`} />
                        </span>
                      </Link>
                    </SheetClose>

                    {/* Mobile Dropdown Sublinks */}
                    {link.children && (
                      <div className="pl-6 flex flex-col space-y-1 border-l-2 border-border/50 ml-4 mt-2">
                        {link.children.map(child => (
                          <SheetClose asChild key={child.path}>
                            <Link
                              to={child.path}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive(child, location.pathname)
                                ? 'text-primary bg-primary/5'
                                : 'text-muted-foreground hover:bg-muted hover:text-primary'
                                }`}
                            >
                              {child.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {!isAuthenticated ? (
                  <div className="space-y-2 pt-4">
                    <SheetClose asChild>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/login">Login</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="w-full" asChild>
                        <Link to="/register">Register</Link>
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="pt-4">
                    <SheetClose asChild>
                      <Button className="w-full" asChild>
                        <Link to={getDashboardPath()}>Dashboard</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
