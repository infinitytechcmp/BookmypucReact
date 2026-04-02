import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/types';
import { User, Building2, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'user' | 'shopOwner'>('user');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);
    const success = await login(formData.email, formData.password, role as UserRole);
    setIsLoading(false);

    if (success) {
      toast.success('Login successful!');
      if (role === 'user') {
        navigate('/user/dashboard');
      } else {
        navigate('/shop-owner/dashboard');
      }
    } else {
      toast.error('Invalid credentials or account inactive');
    }
  };

  return (
    <PublicLayout>
      <div className="relative min-h-[calc(100vh-200px)] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-chart-2/10 blur-3xl animation-delay-2000" />
        </div>

        <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Welcome Badge */}
            <div className="mb-8 flex animate-slide-in justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Welcome Back
              </div>
            </div>

            <Card className="animate-fade-in border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Login to BookMyPUC</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={role} onValueChange={(v) => setRole(v as 'user' | 'shopOwner')} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user" className="gap-2">
                      <User className="h-4 w-4" />
                      User
                    </TabsTrigger>
                    <TabsTrigger value="shopOwner" className="gap-2">
                      <Building2 className="h-4 w-4" />
                      Shop Owner
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="user" className="mt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            className="h-11 pl-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            className="h-11 pl-11 pr-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="h-11 w-full font-semibold shadow-lg transition-all hover:shadow-primary/50" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Logging in...
                          </div>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="shopOwner" className="mt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-shop">Email</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email-shop' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <Input
                            id="email-shop"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onFocus={() => setFocusedField('email-shop')}
                            onBlur={() => setFocusedField(null)}
                            className="h-11 pl-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-shop">Password</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password-shop' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <Input
                            id="password-shop"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setFocusedField('password-shop')}
                            onBlur={() => setFocusedField(null)}
                            className="h-11 pl-11 pr-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="h-11 w-full font-semibold shadow-lg transition-all hover:shadow-primary/50" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Logging in...
                          </div>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 space-y-4">
                  <div className="text-center text-sm">
                    <Link to="/forgot-password" className="text-primary transition-colors hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary transition-colors hover:underline">
                      Register
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Link */}
            <div className="mt-6 animate-fade-in text-center animation-delay-500">
              <Link
                to="/admin-login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Lock className="h-4 w-4" />
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
