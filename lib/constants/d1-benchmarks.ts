/**
 * D1 Baseball Recruiting Benchmarks
 * Based on typical Division 1 college baseball recruiting standards
 */

export interface D1Benchmark {
  metricLabel: string;
  d1Threshold: number;
  eliteThreshold: number;
  unit: string;
  comparison: 'lower' | 'higher'; // lower = lower is better (e.g., 60-yard), higher = higher is better (e.g., exit velo)
}

export const D1_BENCHMARKS: Record<string, D1Benchmark> = {
  // Speed Metrics (lower is better)
  '60-yard': {
    metricLabel: '60-Yard Dash',
    d1Threshold: 7.0,
    eliteThreshold: 6.7,
    unit: 's',
    comparison: 'lower'
  },
  'home-to-first': {
    metricLabel: 'Home to First',
    d1Threshold: 4.3,
    eliteThreshold: 4.0,
    unit: 's',
    comparison: 'lower'
  },
  'pop-time': {
    metricLabel: 'Pop Time',
    d1Threshold: 2.0,
    eliteThreshold: 1.9,
    unit: 's',
    comparison: 'lower'
  },

  // Velocity Metrics (higher is better)
  'exit-velocity': {
    metricLabel: 'Exit Velocity',
    d1Threshold: 90,
    eliteThreshold: 95,
    unit: 'mph',
    comparison: 'higher'
  },
  'fastball-velocity': {
    metricLabel: 'Fastball Velocity',
    d1Threshold: 87,
    eliteThreshold: 92,
    unit: 'mph',
    comparison: 'higher'
  },
  'fb-velo': {
    metricLabel: 'FB Velocity',
    d1Threshold: 87,
    eliteThreshold: 92,
    unit: 'mph',
    comparison: 'higher'
  },
  'outfield-velocity': {
    metricLabel: 'Outfield Velocity',
    d1Threshold: 85,
    eliteThreshold: 90,
    unit: 'mph',
    comparison: 'higher'
  },
  'of-velo': {
    metricLabel: 'OF Velocity',
    d1Threshold: 85,
    eliteThreshold: 90,
    unit: 'mph',
    comparison: 'higher'
  },
  'infield-velocity': {
    metricLabel: 'Infield Velocity',
    d1Threshold: 82,
    eliteThreshold: 87,
    unit: 'mph',
    comparison: 'higher'
  },
  'if-velo': {
    metricLabel: 'IF Velocity',
    d1Threshold: 82,
    eliteThreshold: 87,
    unit: 'mph',
    comparison: 'higher'
  }
};

/**
 * Check if a metric value meets D1 or Elite standards
 */
export function checkD1Standard(metricLabel: string, value: number): 'elite' | 'd1' | 'none' {
  // Normalize metric label for lookup
  const normalizedLabel = metricLabel.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/yard/i, 'yard')
    .replace(/time/i, 'time')
    .replace(/velocity/i, 'velocity')
    .replace(/velo/i, 'velo');

  const benchmark = D1_BENCHMARKS[normalizedLabel];
  if (!benchmark) return 'none';

  if (benchmark.comparison === 'lower') {
    // Lower is better (e.g., 60-yard dash time)
    if (value <= benchmark.eliteThreshold) return 'elite';
    if (value <= benchmark.d1Threshold) return 'd1';
  } else {
    // Higher is better (e.g., exit velocity)
    if (value >= benchmark.eliteThreshold) return 'elite';
    if (value >= benchmark.d1Threshold) return 'd1';
  }

  return 'none';
}

/**
 * Parse a metric value string to extract numeric value
 * Handles formats like "6.8s", "92 mph", "6.8", "92"
 */
export function parseMetricValue(valueString: string): number | null {
  if (!valueString) return null;

  // Remove common units and parse
  const cleaned = valueString.toString()
    .replace(/mph/gi, '')
    .replace(/\s+/g, '')
    .replace(/s$/i, '')
    .replace(/″/g, '')
    .replace(/"/g, '')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}
