'use client';

import * as React from 'react';
import { Settings, Type, Contrast, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AccessibilityControlsProps {
  className?: string;
}

export function AccessibilityControls({ className }: AccessibilityControlsProps) {
  const [fontSize, setFontSize] = React.useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    root.classList.add(`font-size-${fontSize}`);
    
    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [fontSize, highContrast, reducedMotion]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(className)} aria-label="Accessibility settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-xl bg-background/95 w-56">
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Font Size</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant={fontSize === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontSize('normal')}
              className="flex-1"
            >
              Normal
            </Button>
            <Button
              variant={fontSize === 'large' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontSize('large')}
              className="flex-1"
            >
              Large
            </Button>
            <Button
              variant={fontSize === 'xlarge' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontSize('xlarge')}
              className="flex-1"
            >
              XL
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setHighContrast(!highContrast)}>
          <Contrast className="mr-2 h-4 w-4" />
          <span>High Contrast</span>
          {highContrast && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setReducedMotion(!reducedMotion)}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Reduce Motion</span>
          {reducedMotion && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
