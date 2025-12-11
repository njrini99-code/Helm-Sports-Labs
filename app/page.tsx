'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Video, Compass, Users, Menu, X } from "lucide-react";
import {
  glassCardPremium,
  glassPanel as glassPanelEnhanced,
  glassButton as glassButtonEnhanced,
  cn,
} from '@/lib/glassmorphism-enhanced';
import { createClient } from '@/lib/supabase/client';
import { isDevMode, getDevRole } from '@/lib/dev-mode';
import { logError } from '@/lib/utils/errorLogger';
import { HeroSectionLight } from '@/components/landing/HeroSectionLight';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { TestimonialsCarousel } from '@/components/landing/TestimonialsCarousel';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { DevModeSelector } from '@/components/dev/DevModeSelector';
import { SkipLink } from '@/components/ui/skip-link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PageLoading } from '@/components/ui/loading-state';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomSheet } from '@/components/ui/bottom-sheet';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type UserType = 'player' | 'coach' | 'admin';
type CoachType = 'college' | 'high_school' | 'juco' | 'showcase';

// ═══════════════════════════════════════════════════════════════════════════
// REDIRECT MAP
// ═══════════════════════════════════════════════════════════════════════════

const DASHBOARD_REDIRECTS: Record<string, string> = {
  // User types
  player: '/player/dashboard',
  coach: '/coach/college', // Default coach redirect
  admin: '/admin/dashboard',
  
  // Coach types (more specific)
  college: '/coach/college',
  high_school: '/coach/high-school',
  juco: '/coach/juco',
  showcase: '/coach/showcase',
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function normalizeCoachType(type: string | null): CoachType | null {
  if (!type) return null;
  const normalized = type.toLowerCase().replace(/-/g, '_');
  if (['college', 'high_school', 'juco', 'showcase'].includes(normalized)) {
    return normalized as CoachType;
  }
  return null;
}

function normalizeUserType(type: string | null | undefined): UserType | null {
  if (!type) return null;
  const normalized = type.toLowerCase();
  if (['player', 'coach', 'admin'].includes(normalized)) {
    return normalized as UserType;
  }
  return null;
}

function getDashboardPath(userType: UserType | null, coachType: CoachType | null): string {
  if (userType === 'coach' && coachType) {
    return DASHBOARD_REDIRECTS[coachType] || DASHBOARD_REDIRECTS.coach;
  }
  if (userType) {
    return DASHBOARD_REDIRECTS[userType] || '/';
  }
  return '/';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient();

      try {
        // ═══════════════════════════════════════════════════════════════════
        // DEV MODE - Redirect based on dev role
        // ═══════════════════════════════════════════════════════════════════
        if (isDevMode()) {
          const devRole = getDevRole() || 'player';
          
          let userType: UserType = 'player';
          let coachType: CoachType | null = null;
          
          if (devRole !== 'player') {
            userType = 'coach';
            coachType = devRole === 'high-school' ? 'high_school' 
              : devRole === 'juco' ? 'juco'
              : devRole === 'showcase' ? 'showcase'
              : 'college';
          }

          const targetPath = getDashboardPath(userType, coachType);
          setIsAuthenticated(true);
          router.replace(targetPath);
          return;
        }

        // ═══════════════════════════════════════════════════════════════════
        // PRODUCTION - Check if user is logged in
        // ═══════════════════════════════════════════════════════════════════
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Not authenticated - show landing page
          setChecking(false);
          setIsAuthenticated(false);
          return;
        }

        // User is authenticated - determine where to redirect
        setIsAuthenticated(true);

        // Get user profile to determine user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, user_type')
          .eq('id', session.user.id)
          .maybeSingle();

        const rawUserType = profile?.user_type || profile?.role;
        const userType = normalizeUserType(rawUserType);

        // Get coach type if user is a coach
        let coachType: CoachType | null = null;
        if (userType === 'coach') {
          const { data: coach } = await supabase
            .from('coaches')
            .select('coach_type')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          coachType = normalizeCoachType(coach?.coach_type || null);
        }

        // Redirect to appropriate dashboard
        const targetPath = getDashboardPath(userType, coachType);
        router.replace(targetPath);

      } catch (error) {
        logError(error, { component: 'HomePage', action: 'checkAuth' });
        setChecking(false);
        setIsAuthenticated(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // ═══════════════════════════════════════════════════════════════════════
  // LOADING STATE - while checking auth (using enhanced loading component)
  // ═══════════════════════════════════════════════════════════════════════
  if (checking || isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center">
        <PageLoading 
          text={isAuthenticated ? 'Redirecting to your dashboard...' : 'Loading...'} 
        />
      </main>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LANDING PAGE - for unauthenticated users
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30 text-slate-900 dark:text-slate-100 scroll-smooth">
      {/* Skip Link for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Premium Glass Header */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-2xl",
        "bg-white/[0.8] dark:bg-slate-900/[0.8]",
        "border-b border-emerald-100/50 dark:border-emerald-900/50",
        "shadow-lg shadow-emerald-500/5"
      )}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight hover:opacity-80 transition-opacity"
              aria-label="ScoutPulse Home"
            >
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white font-black text-lg">SP</span>
              </div>
              <span>Scout<span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">Pulse</span></span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a 
                href="#features" 
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
              >
                Testimonials
              </a>
              <ThemeToggle />
            </div>
            
            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Log In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild 
                  className={cn(
                    glassButtonEnhanced.primary,
                    "text-sm"
                  )}
                  size="sm"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Bottom Sheet */}
      <BottomSheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu"
        showClose={true}
      >
        <nav className="space-y-4">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 text-lg font-medium text-slate-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 text-lg font-medium text-slate-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
          >
            Testimonials
          </Link>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-center text-lg font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className={cn(glassButtonEnhanced.primary, "w-full")}
                size="lg"
              >
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </motion.div>
          </div>
        </nav>
      </BottomSheet>

      {/* Main Content */}
      <div id="main-content">
        {/* HERO SECTION */}
        <HeroSectionLight />

        {/* Section Divider */}
        <SectionDivider />

        {/* FEATURES - Bento Grid */}
        <section id="features" aria-labelledby="features-heading">
          <BentoGrid />
        </section>

        {/* Section Divider */}
        <SectionDivider />

        {/* TESTIMONIALS */}
        <section id="testimonials" aria-labelledby="testimonials-heading">
          <TestimonialsCarousel />
        </section>

        {/* Section Divider */}
        <SectionDivider />

        {/* FINAL CTA */}
        <FinalCTASection />
      </div>

      {/* Dev Mode Selector */}
      <DevModeSelector />

      {/* Premium Glass Footer */}
      <footer className={cn(
        "relative backdrop-blur-2xl",
        "bg-white/[0.7] dark:bg-slate-900/[0.7]",
        "border-t border-emerald-100/50 dark:border-emerald-900/50",
        "shadow-lg shadow-emerald-500/5"
      )} role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white mb-3 hover:opacity-80 transition-opacity"
                aria-label="ScoutPulse Home"
              >
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span className="text-white font-black text-lg">SP</span>
                </div>
                <span>Scout<span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">Pulse</span></span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Modern. Simple. Trusted.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md">
                Connecting serious athletes with serious programs. Your future in baseball recruiting starts here.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="#features" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link 
                    href="#testimonials" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/auth/signup" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/auth/login" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Log In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/support" 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-8 border-t border-emerald-100/50 dark:border-emerald-900/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                © {new Date().getFullYear()} ScoutPulse. Built to help serious athletes and serious programs connect.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://twitter.com/scoutpulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/scoutpulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="p-4 bg-white/10 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
        {icon}
      </div>
      <p className="text-lg font-medium">{title}</p>
    </div>
  );
}
