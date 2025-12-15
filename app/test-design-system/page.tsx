'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';

export default function DesignSystemTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-helm-cream-50 via-white to-helm-cream-100 dark:from-helm-gray-950 dark:via-helm-gray-900 dark:to-helm-gray-950 p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-helm-gray-950 dark:text-helm-cream-100">
            Design System Test Page
          </h1>
          <p className="text-helm-gray-600 dark:text-helm-gray-400">
            Testing all button variants, badge variants, glass card elevations, and input focus states
          </p>
        </div>

        {/* Button Variants Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-helm-gray-950 dark:text-helm-cream-100">
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="success">Success</Button>
          </div>
        </section>

        {/* Badge Variants Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-helm-gray-950 dark:text-helm-cream-100">
            Badge Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-helm-green-500 text-white hover:bg-helm-green-600">
              Success
            </Badge>
            <Badge className="bg-helm-amber text-white hover:bg-helm-amber/90">
              Warning
            </Badge>
            <Badge className="bg-helm-red text-white hover:bg-helm-red/90">
              Error
            </Badge>
            <Badge className="bg-helm-blue text-white hover:bg-helm-blue/90">
              Info
            </Badge>
          </div>
        </section>

        {/* Glass Card Elevation Levels Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-helm-gray-950 dark:text-helm-cream-100">
            Glass Card Elevation Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Level 1: Subtle */}
            <GlassCard variant="subtle" size="md">
              <h3 className="text-lg font-semibold text-helm-gray-950 dark:text-helm-cream-100 mb-2">
                Level 1: Subtle
              </h3>
              <p className="text-sm text-helm-gray-600 dark:text-helm-gray-400">
                Use for subtle backgrounds, overlays, and low-elevation surfaces
              </p>
            </GlassCard>

            {/* Level 2: Default */}
            <GlassCard variant="default" size="md">
              <h3 className="text-lg font-semibold text-helm-gray-950 dark:text-helm-cream-100 mb-2">
                Level 2: Default
              </h3>
              <p className="text-sm text-helm-gray-600 dark:text-helm-gray-400">
                Use for most cards, panels, and standard UI elements
              </p>
            </GlassCard>

            {/* Level 3: Elevated */}
            <GlassCard variant="elevated" size="md">
              <h3 className="text-lg font-semibold text-helm-gray-950 dark:text-helm-cream-100 mb-2">
                Level 3: Elevated
              </h3>
              <p className="text-sm text-helm-gray-600 dark:text-helm-gray-400">
                Use for hover states, active cards, and elevated interactions
              </p>
            </GlassCard>

            {/* Level 4: Hero */}
            <GlassCard variant="hero" size="md">
              <h3 className="text-lg font-semibold text-helm-gray-950 dark:text-helm-cream-100 mb-2">
                Level 4: Hero
              </h3>
              <p className="text-sm text-helm-gray-600 dark:text-helm-gray-400">
                Use for hero sections, landing page features, and premium content
              </p>
            </GlassCard>

            {/* Level 5: Modal */}
            <GlassCard variant="modal" size="md">
              <h3 className="text-lg font-semibold text-helm-gray-950 dark:text-helm-cream-100 mb-2">
                Level 5: Modal
              </h3>
              <p className="text-sm text-helm-gray-600 dark:text-helm-gray-400">
                Use for modals, dialogs, popovers, and high-elevation overlays
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Input with Helm-Green Focus State Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-helm-gray-950 dark:text-helm-cream-100">
            Input with Helm-Green Focus State
          </h2>
          <div className="max-w-md space-y-4">
            <Input
              label="Default Input"
              placeholder="Focus to see helm-green focus state"
            />
            <Input
              label="Input with Success State"
              placeholder="This input shows success state"
              success
            />
            <Input
              label="Input with Error State"
              placeholder="This input shows error state"
              error
              errorMessage="This is an error message"
            />
          </div>
        </section>

        {/* Combined Example Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-helm-gray-950 dark:text-helm-cream-100">
            Combined Example
          </h2>
          <GlassCard variant="elevated" size="lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-helm-gray-950 dark:text-helm-cream-100 mb-2">
                  Card with Form Elements
                </h3>
                <p className="text-sm text-helm-gray-600 dark:text-helm-gray-400 mb-4">
                  This card demonstrates the elevated glass variant with form elements
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Name"
                  placeholder="Enter your name"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Tag 1</Badge>
                <Badge variant="secondary">Tag 2</Badge>
                <Badge variant="outline">Tag 3</Badge>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="default">Submit</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
