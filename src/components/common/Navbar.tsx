import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/common/NotificationBell';

export function Navbar() {
  const { toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Find Centers', path: '/find-centers' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contact Us', path: '/contact' }
  ];

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
          <img 
            src="/puclogo.png" 
            alt="BookMyPUC Logo" 
            className="h-[55px] w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`group relative text-sm font-medium transition-colors ${
                location.pathname === link.path ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-chart-2 transition-all duration-300 ${
                location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
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

          {/* Auth Buttons */}
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
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-primary'
                    }`}
                  >
                    <span className="relative">
                      {link.name}
                      <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                        location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} />
                    </span>
                  </Link>
                ))}
                {!isAuthenticated ? (
                  <div className="space-y-2 pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/register">Register</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4">
                    <Button className="w-full" asChild>
                      <Link to={getDashboardPath()}>Dashboard</Link>
                    </Button>
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
