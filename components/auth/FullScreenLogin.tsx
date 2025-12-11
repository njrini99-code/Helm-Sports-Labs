'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import {
  glassCardPremium,
  glassPanel as glassPanelEnhanced,
  glassButton as glassButtonEnhanced,
  glassDarkZone as glassDarkZoneEnhanced,
} from '@/lib/glassmorphism-enhanced';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { SkipLink } from '@/components/ui/skip-link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function FullScreenLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const { toast } = useToast();

  // Form state
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const particleCount = 50;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Validation
  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      const error = validateEmail(email);
      setErrors((prev) => ({ ...prev, email: error }));
    } else {
      const error = validatePassword(password);
      setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrors({
          general: error.message.includes('Invalid login credentials')
            ? 'Invalid email or password'
            : error.message,
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Success - show toast and redirect
        toast({
          variant: 'success',
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 500);
      }
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'An error occurred',
      });
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrors({ general: error.message });
      }
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  };

  return (
    <motion.div 
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Skip Link */}
      <SkipLink href="#login-form">Skip to login form</SkipLink>

      {/* Ultimate Glassmorphism Dark Zone Background */}
      <div className={cn(glassDarkZoneEnhanced, "absolute inset-0")}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Premium Glass Login Card */}
      <motion.div 
        className="relative z-10 w-full max-w-md px-6 py-8 sm:px-8 sm:py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={cn(glassPanelEnhanced, "p-8 sm:p-10 relative overflow-hidden")}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-50 animate-pulse" />
          
          {/* Logo with Premium Animation */}
          <motion.div 
            className="flex flex-col items-center mb-8 relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative mb-4">
              <motion.div 
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br from-emerald-500/90 via-emerald-500/95 to-emerald-600/90",
                  "border border-white/30 shadow-[0_8px_32px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]",
                  "backdrop-blur-xl"
                )}
                animate={{ 
                  boxShadow: [
                    "0 8px 32px rgba(16,185,129,0.4)",
                    "0 12px 48px rgba(16,185,129,0.6)",
                    "0 8px 32px rgba(16,185,129,0.4)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl sm:text-3xl font-bold text-white">SP</span>
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400/60 animate-ping" />
              <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-cyan-400/40 blur-xl animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
              ScoutPulse
            </h1>
            <p className="text-white/70 text-sm mt-2 font-medium">Welcome back</p>
          </motion.div>

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
            {/* Premium Glass Error Message */}
            {errors.general && (
              <motion.div 
                className={cn(
                  "flex items-center gap-2 p-4 rounded-xl backdrop-blur-lg",
                  "bg-red-500/15 border border-red-500/30 text-red-300 text-sm",
                  "shadow-lg shadow-red-500/20"
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="w-4 h-4" strokeWidth={2} />
                <span>{errors.general}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('email')}
                error={errors.email && touched.email}
                errorMessage={errors.email && touched.email ? errors.email : undefined}
                label="Email address"
                placeholder="Enter your email"
                className={cn(
                  "backdrop-blur-xl bg-white/[0.08] border-white/[0.15]",
                  "text-white placeholder-white/50",
                  "focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
                )}
                aria-required="true"
                aria-invalid={errors.email && touched.email ? 'true' : 'false'}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                    }
                  }}
                  onBlur={() => handleBlur('password')}
                  error={errors.password && touched.password}
                  errorMessage={errors.password && touched.password ? errors.password : undefined}
                  label="Password"
                  placeholder="Enter your password"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 backdrop-blur-sm pr-12"
                  aria-required="true"
                  aria-invalid={errors.password && touched.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded p-1.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Premium Glass Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={cn(
                glassButtonEnhanced.primary,
                "w-full py-4 text-base font-semibold",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative bg-white/5 px-4 text-sm text-gray-400">
                Or continue with
              </div>
            </div>

            {/* Premium Glass Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl backdrop-blur-lg",
                  "bg-white/[0.08] border border-white/[0.15] text-white text-sm font-medium",
                  "hover:bg-white/[0.12] hover:border-white/20",
                  "shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10",
                  "transition-all duration-300"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl backdrop-blur-lg",
                  "bg-white/[0.08] border border-white/[0.15] text-white text-sm font-medium",
                  "hover:bg-white/[0.12] hover:border-white/20",
                  "shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10",
                  "transition-all duration-300"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.16c-.15-2.05 1.66-3.78 3.74-4.04.27 2.21-1.81 4.08-3.74 4.04z" />
                </svg>
                Apple
              </motion.button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
