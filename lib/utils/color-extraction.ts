/**
 * Color Extraction Utility
 * Extracts dominant colors from images for dynamic theming
 */

export interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
}

// Default brand colors (pulse green)
export const DEFAULT_COLORS: ExtractedColors = {
  primary: '#00C27A',
  secondary: '#003B2A',
  accent: '#B8F8D0',
  dark: '#001A12',
  light: '#E8FFF5',
};

/**
 * Extract dominant color from an image URL
 * Uses canvas to sample the image and find the most common color
 */
export async function extractColorsFromImage(
  imageUrl: string | null | undefined
): Promise<ExtractedColors> {
  if (!imageUrl) return DEFAULT_COLORS;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(DEFAULT_COLORS);
          return;
        }

        // Scale down for faster processing
        const scale = Math.min(1, 100 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Color frequency map
        const colorMap: Record<string, number> = {};
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;
          
          // Skip very light or very dark pixels
          const brightness = (r + g + b) / 3;
          if (brightness < 20 || brightness > 235) continue;

          // Quantize colors to reduce noise
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          
          const key = `${qr},${qg},${qb}`;
          colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Find dominant color
        let maxCount = 0;
        let dominantColor = [0, 194, 122]; // Default to pulse green

        for (const [key, count] of Object.entries(colorMap)) {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = key.split(',').map(Number);
          }
        }

        const [r, g, b] = dominantColor;
        const primary = rgbToHex(r, g, b);
        
        // Generate color palette from dominant color
        const hsl = rgbToHsl(r, g, b);
        
        resolve({
          primary,
          secondary: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 30, 10)),
          accent: hslToHex(hsl.h, Math.min(hsl.s + 20, 100), Math.min(hsl.l + 40, 90)),
          dark: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 40, 5)),
          light: hslToHex(hsl.h, Math.max(hsl.s - 40, 20), Math.min(hsl.l + 50, 95)),
        });
      } catch {
        resolve(DEFAULT_COLORS);
      }
    };

    img.onerror = () => resolve(DEFAULT_COLORS);
    
    // Set timeout for slow images
    setTimeout(() => resolve(DEFAULT_COLORS), 3000);
    
    img.src = imageUrl;
  });
}

// Utility functions
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/**
 * Generate CSS gradient from extracted colors
 */
export function generateGradient(colors: ExtractedColors, angle: number = 135): string {
  return `linear-gradient(${angle}deg, ${colors.dark} 0%, ${colors.secondary} 50%, ${colors.primary}20 100%)`;
}

/**
 * Generate a subtle glow effect
 */
export function generateGlow(color: string, size: string = '60px'): string {
  return `0 0 ${size} ${color}40, 0 0 ${parseInt(size) * 2}px ${color}20`;
}

