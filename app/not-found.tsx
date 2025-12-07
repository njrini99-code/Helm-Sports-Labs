'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Search,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Compass,
  Users,
  Calendar,
  MessageSquare,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// SUGGESTED PAGES
// ═══════════════════════════════════════════════════════════════════════════

const SUGGESTED_PAGES = [
  {
    title: 'Player Dashboard',
    description: 'View your profile, stats, and recruiting activity',
    href: '/player',
    icon: Users,
    color: 'emerald',
  },
  {
    title: 'Coach Dashboard',
    description: 'Manage your program and find recruits',
    href: '/coach/college',
    icon: Compass,
    color: 'blue',
  },
  {
    title: 'Discover Programs',
    description: 'Browse colleges and showcase events',
    href: '/player/discover',
    icon: Search,
    color: 'purple',
  },
  {
    title: 'Messages',
    description: 'Check your conversations',
    href: '/player/messages',
    icon: MessageSquare,
    color: 'amber',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// POPULAR SEARCHES
// ═══════════════════════════════════════════════════════════════════════════

const POPULAR_SEARCHES = [
  'D1 baseball programs',
  'Recruiting tips',
  'Showcase events',
  'Player stats',
  'College camps',
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function NotFoundPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  // Generate breadcrumbs from current path
  const breadcrumbs = pathname
    ? pathname.split('/').filter(Boolean).map((segment, index, arr) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: '/' + arr.slice(0, index + 1).join('/'),
        isLast: index === arr.length - 1,
      }))
    : [];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to discover page with search query
      router.push(`/player/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Get color classes
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0d1117] to-[#111] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Radial glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 border-b border-white/5 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              Scout<span className="text-blue-500">Pulse</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav 
            className={`mb-8 transition-all duration-700 ${
              isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <ol className="flex items-center gap-2 text-sm flex-wrap">
              <li>
                <Link 
                  href="/" 
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  {crumb.isLast ? (
                    <span className="text-red-400 font-medium">{crumb.label}</span>
                  ) : (
                    <Link 
                      href={crumb.href}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* 404 Glass Card */}
        <div 
          className={`relative transition-all duration-700 delay-100 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Glassmorphism container */}
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
            
            {/* Inner glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative">
              {/* 404 Badge */}
              <div className="flex justify-center mb-6">
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-4 py-1.5 text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Error 404
                </Badge>
              </div>

              {/* Large 404 Text */}
              <div className="text-center mb-6">
                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 select-none">
                  404
                </h1>
              </div>

              {/* Message */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Page Not Found
                </h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                  Looks like this page struck out! The page you&apos;re looking for doesn&apos;t exist 
                  or may have been moved to a new location.
                </p>
              </div>

              {/* Search Section */}
              <div className="max-w-md mx-auto mb-8">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search ScoutPulse..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-24 py-3 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 h-8"
                    >
                      Search
                    </Button>
                  </div>
                </form>

                {/* Popular Searches */}
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(term)}
                        className="text-xs px-3 py-1 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full sm:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Link href="/" className="w-full sm:w-auto">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                    <Home className="w-4 h-4 mr-2" />
                    Return Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Pages */}
        <div 
          className={`mt-12 transition-all duration-700 delay-300 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Suggested Pages</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SUGGESTED_PAGES.map((page, index) => {
              const colors = getColorClasses(page.color);
              return (
                <Link
                  key={index}
                  href={page.href}
                  className={`group relative bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
                      <page.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {page.title}
                        </h4>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {page.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div 
          className={`mt-12 text-center transition-all duration-700 delay-500 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Need help?</span>
            <a 
              href="mailto:support@scoutpulse.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} ScoutPulse. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
