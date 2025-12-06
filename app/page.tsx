import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Video, Compass, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 border-b border-white/5 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              Scout<span className="text-blue-500">Pulse</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#for-players" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                For Players
              </a>
              <a href="#for-coaches" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                For Coaches
              </a>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Log In
              </Link>
              <Button asChild variant="gradient" size="sm">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-5xl px-6 pt-28 pb-24 text-center">
        <Badge className="mb-6 bg-white/10 text-white px-4 py-1 border-white/20">
          For high school, showcase, JUCO & college baseball
        </Badge>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
          Recruiting. Reimagined.
        </h1>

        <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
          ScoutPulse helps players showcase their talent and coaches discover,
          evaluate, and recruit — all in one modern, AI-powered platform.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/auth/signup?role=player">
            <Button size="lg" className="bg-[#FF8A00] hover:bg-[#ff9e2f] text-white">
              I&apos;m a Player →
            </Button>
          </Link>

          <Link href="/auth/signup?role=coach">
            <Button size="lg" className="bg-[#00C27A] hover:bg-[#1ad692] text-white">
              I&apos;m a Coach →
            </Button>
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <Feature icon={<Shield className="w-6 h-6 text-emerald-400" />} title="Verified Profiles" />
          <Feature icon={<Compass className="w-6 h-6 text-blue-400" />} title="AI-Powered Discovery" />
          <Feature icon={<Video className="w-6 h-6 text-cyan-400" />} title="Video Highlights" />
          <Feature icon={<Users className="w-6 h-6 text-purple-400" />} title="All Levels Supported" />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="text-2xl font-bold text-white mb-2 inline-block">
              Scout<span className="text-blue-500">Pulse</span>
            </Link>
            <p className="text-sm text-muted-foreground">Modern. Simple. Trusted.</p>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-white/5">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScoutPulse. Built to help serious athletes and serious programs connect.
          </p>
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
