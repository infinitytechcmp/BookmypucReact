import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    const success = await login(formData.email, formData.password, 'admin');
    setIsLoading(false);

    if (success) {
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  return (
    <PublicLayout>
      <div className="relative min-h-[calc(100vh-200px)] overflow-hidden bg-gradient-to-br from-background via-background to-destructive/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-destructive/10 blur-3xl" />
          <div className="absolute -right-4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl animation-delay-2000" />
          <div className="absolute left-1/3 top-1/3 h-64 w-64 animate-pulse rounded-full bg-chart-2/10 blur-3xl animation-delay-4000" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-float rounded-full bg-primary/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Admin Badge */}
            <div className="mb-8 flex animate-slide-in justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive backdrop-blur-sm">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Administrator Access
              </div>
            </div>

            {/* Main Card */}
            <div className="group relative animate-fade-in">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 animate-pulse rounded-2xl bg-gradient-to-r from-destructive/50 via-primary/50 to-chart-2/50 opacity-30 blur transition duration-1000 group-hover:opacity-50" />

              {/* Card Content */}
              <div className="relative rounded-2xl border border-border/50 bg-card/95 p-8 shadow-2xl backdrop-blur-xl">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 shadow-lg">
                        <Shield className="h-10 w-10 animate-pulse text-destructive" />
                      </div>
                    </div>
                  </div>
                  <h1 className="mb-2 bg-gradient-to-r from-destructive via-primary to-chart-2 bg-clip-text text-3xl font-bold text-transparent">
                    Admin Portal
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Secure access to administrative dashboard
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Admin Email
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-destructive' : 'text-muted-foreground'}`} />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@bookmypuc.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="h-12 pl-11 transition-all duration-300 focus:ring-2 focus:ring-destructive/20"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Admin Password
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-destructive' : 'text-muted-foreground'}`} />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="h-12 pl-11 pr-11 transition-all duration-300 focus:ring-2 focus:ring-destructive/20"
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="group relative h-12 w-full overflow-hidden bg-gradient-to-r from-destructive to-destructive/80 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-destructive/50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          Access Dashboard
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </Button>
                </form>

                {/* Demo Credentials */}
                {/* <div className="mt-8 animate-slide-in rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-chart-2/5 p-4 backdrop-blur-sm animation-delay-500">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <Lock className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Demo Credentials</p>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Email:</span>
                      <code className="rounded bg-muted px-2 py-0.5 font-mono">admin@bookmypuc.com</code>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Password:</span>
                      <code className="rounded bg-muted px-2 py-0.5 font-mono">admin123</code>
                    </p>
                  </div>
                </div> */}

                {/* Security Notice */}
                <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    This is a secure admin portal. All login attempts are monitored and logged for security purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <p className="mt-6 animate-fade-in text-center text-sm text-muted-foreground animation-delay-1000">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
