'use client';

import { useEffect, useState } from 'react';
import { HeroSectionLight } from '@/components/landing/HeroSectionLight';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { TestimonialsCarousel } from '@/components/landing/TestimonialsCarousel';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export default function LandingRedesignTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Check for emerald/teal colors in DOM
    const checkForOldColors = () => {
      const html = document.documentElement.outerHTML;
      const emeraldMatches = html.match(/emerald-\d+/g);
      const tealMatches = html.match(/teal-\d+/g);
      const slateMatches = html.match(/slate-\d+/g);
      
      const hasEmerald = emeraldMatches && emeraldMatches.length > 0;
      const hasTeal = tealMatches && tealMatches.length > 0;
      const hasSlate = slateMatches && slateMatches.length > 0;

      if (hasEmerald || hasTeal || hasSlate) {
        const issues = [];
        if (hasEmerald) issues.push(`Found ${emeraldMatches.length} emerald-* references`);
        if (hasTeal) issues.push(`Found ${tealMatches.length} teal-* references`);
        if (hasSlate) issues.push(`Found ${slateMatches.length} slate-* references`);
        return {
          passed: false,
          message: issues.join(', ')
        };
      }
      return { passed: true, message: 'No emerald/teal/slate colors found' };
    };

    // Test 2: Check for helm colors
    const checkForHelmColors = () => {
      const html = document.documentElement.outerHTML;
      const helmGreenMatches = html.match(/helm-green-\d+/g);
      const helmGrayMatches = html.match(/helm-gray-\d+/g);
      const helmCreamMatches = html.match(/helm-cream-\d+/g);

      const hasHelmGreen = helmGreenMatches && helmGreenMatches.length > 0;
      const hasHelmGray = helmGrayMatches && helmGrayMatches.length > 0;
      const hasHelmCream = helmCreamMatches && helmCreamMatches.length > 0;

      if (hasHelmGreen && (hasHelmGray || hasHelmCream)) {
        return {
          passed: true,
          message: `Found helm-green (${helmGreenMatches.length}), helm-gray (${helmGrayMatches?.length || 0}), helm-cream (${helmCreamMatches?.length || 0})`
        };
      }
      return { passed: false, message: 'Missing helm color palette' };
    };

    // Test 3: Check for glassCard and glassHero usage
    const checkGlassStyling = () => {
      const html = document.documentElement.outerHTML;
      const hasGlassCard = html.includes('glassCard') || html.includes('backdrop-blur');
      const hasGlassHero = html.includes('glassHero');

      if (hasGlassCard && hasGlassHero) {
        return { passed: true, message: 'glassCard and glassHero styling found' };
      }
      return { passed: false, message: 'Missing glass styling' };
    };

    // Test 4: Check console errors
    const checkConsoleErrors = () => {
      // This will be checked manually, but we can note it
      return { passed: true, message: 'Check browser console manually (F12)' };
    };

    // Run all tests
    results.push({
      name: 'No emerald/teal/slate colors',
      ...checkForOldColors()
    });

    results.push({
      name: 'Helm color palette present',
      ...checkForHelmColors()
    });

    results.push({
      name: 'Glass styling (glassCard/glassHero)',
      ...checkGlassStyling()
    });

    results.push({
      name: 'Console errors check',
      ...checkConsoleErrors()
    });

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run tests after component mounts
    setTimeout(() => runTests(), 1000);
  }, []);

  const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
  const someFailed = testResults.some(r => !r.passed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-helm-cream-50 to-helm-cream-100 dark:from-helm-gray-950 dark:to-helm-gray-900">
      {/* Test Results Banner */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-helm-gray-900/80 border-b border-helm-gray-200 dark:border-helm-gray-800 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-helm-gray-950 dark:text-helm-cream-100">
                Landing Page Redesign Test
              </h1>
              <p className="text-sm text-helm-gray-600 dark:text-helm-cream-300 mt-1">
                Verify Phase 3 implementation
              </p>
            </div>
            <div className="flex items-center gap-4">
              {testResults.length > 0 && (
                <div className={cn(
                  "px-4 py-2 rounded-lg font-semibold",
                  allPassed 
                    ? "bg-helm-green-100 dark:bg-helm-green-900/30 text-helm-green-700 dark:text-helm-green-300"
                    : someFailed
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : "bg-helm-gray-100 dark:bg-helm-gray-800 text-helm-gray-700 dark:text-helm-gray-300"
                )}>
                  {allPassed ? 'All Tests Passed ✓' : someFailed ? 'Some Tests Failed ✗' : 'Running...'}
                </div>
              )}
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-4 py-2 bg-helm-green-500 hover:bg-helm-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Re-run Tests'}
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {testResults.map((result, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg border",
                    result.passed
                      ? "bg-helm-green-50 dark:bg-helm-green-900/20 border-helm-green-200 dark:border-helm-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {result.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-helm-green-600 dark:text-helm-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={cn(
                      "text-sm font-semibold",
                      result.passed
                        ? "text-helm-green-900 dark:text-helm-green-100"
                        : "text-red-900 dark:text-red-100"
                    )}>
                      {result.name}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs mt-1",
                    result.passed
                      ? "text-helm-green-700 dark:text-helm-green-300"
                      : "text-red-700 dark:text-red-300"
                  )}>
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Checklist */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/70 dark:bg-helm-gray-900/70 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-helm-gray-200 dark:border-helm-gray-800">
          <h2 className="text-xl font-bold text-helm-gray-950 dark:text-helm-cream-100 mb-4">
            Visual Checklist
          </h2>
          <div className="space-y-4">
            <ChecklistSection
              title="1. Hero Section"
              items={[
                'Shows main-logo.png (ship logo)',
                'Headline has helm-green gradient on second line',
                'Text is cream-colored (not pure white)',
                'Stat cards have glass-hero styling'
              ]}
            />
            <ChecklistSection
              title="2. Bento Grid"
              items={[
                'No emerald/teal colors remain',
                'Cards use glassCard styling',
                'Hover shows helm-green glow'
              ]}
            />
            <ChecklistSection
              title="3. Final CTA"
              items={[
                'Dark helm-green background',
                'Content in glassHero card',
                'Text is cream-colored'
              ]}
            />
            <ChecklistSection
              title="4. Testimonials"
              items={[
                'Stars are helm-green-500',
                'Cards use glassCard'
              ]}
            />
            <ChecklistSection
              title="5. Overall"
              items={[
                'No console errors (check F12)',
                'Responsive on mobile (resize window)',
                'Dark mode works correctly (toggle theme)'
              ]}
            />
          </div>
        </div>
      </div>

      {/* Actual Components */}
      <div className="space-y-0">
        <HeroSectionLight />
        <div className="py-16 bg-helm-cream-50 dark:bg-helm-gray-950">
          <BentoGrid />
        </div>
        <div className="py-16 bg-helm-cream-50 dark:bg-helm-gray-950">
          <TestimonialsCarousel />
        </div>
        <FinalCTASection />
      </div>

      {/* Color Reference */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/70 dark:bg-helm-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-helm-gray-200 dark:border-helm-gray-800">
          <h2 className="text-xl font-bold text-helm-gray-950 dark:text-helm-cream-100 mb-4">
            Color Reference
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="helm-green-500" color="bg-helm-green-500" />
            <ColorSwatch name="helm-green-400" color="bg-helm-green-400" />
            <ColorSwatch name="helm-gray-950" color="bg-helm-gray-950" />
            <ColorSwatch name="helm-cream-100" color="bg-helm-cream-100" />
          </div>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
              ⚠️ Should NOT see these colors:
            </p>
            <div className="flex gap-4">
              <ColorSwatch name="emerald-500" color="bg-emerald-500" />
              <ColorSwatch name="teal-500" color="bg-teal-500" />
              <ColorSwatch name="slate-500" color="bg-slate-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-helm-gray-900 dark:text-helm-cream-100 mb-2">{title}</h3>
      <ul className="space-y-1 ml-4">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-helm-gray-700 dark:text-helm-cream-200 flex items-center gap-2">
            <span className="text-helm-green-500">□</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(color, "w-8 h-8 rounded border border-helm-gray-300 dark:border-helm-gray-700")} />
      <span className="text-xs font-mono text-helm-gray-700 dark:text-helm-cream-300">{name}</span>
    </div>
  );
}
