'use client';

import { D1Badge } from '@/components/ui/D1Badge';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestD1BadgesPage() {
  const testMetrics = [
    { label: 'Fastball Velocity', value: '88 mph', level: 'd1' as const, verified: true },
    { label: 'Exit Velocity', value: '92 mph', level: 'd1' as const, verified: true },
    { label: '60 Yard Dash', value: '6.8s', level: 'elite' as const, verified: true },
    { label: 'Pop Time', value: '1.95s', level: 'elite' as const, verified: true },
    { label: 'Outfield Velocity', value: '83 mph', level: 'none' as const, verified: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">D1 Badge Component Test</h1>
          <p className="text-slate-600">Testing the new D1 benchmark badges and verification system</p>
        </div>

        {/* Badge Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 w-32">Elite Level:</span>
              <D1Badge level="elite" size="md" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 w-32">D1 Range:</span>
              <D1Badge level="d1" size="md" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 w-32">None (hidden):</span>
              <D1Badge level="none" size="md" />
              <span className="text-xs text-slate-500">(Badge does not render)</span>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Display (Light Theme - Player Dashboard Style) */}
        <Card>
          <CardHeader>
            <CardTitle>Player Dashboard Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {testMetrics.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            testMetrics.map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{metric.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {metric.verified && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                    <D1Badge level={metric.level} size="sm" />
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-900 ml-3">{metric.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Metrics Display (Dark Theme - Public Profile Style) */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Public Profile Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <span className="text-slate-400">{metric.label}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {metric.verified && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                    <D1Badge level={metric.level} size="sm" />
                  </div>
                </div>
                <span className="text-white font-semibold text-lg">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Acceptance Criteria */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">✅ Acceptance Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Stats displayed with proper units (mph, s)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Key measurables: 60-yard time, Exit velo, FB velo, Pop time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>D1 range badges where applicable (emerald gradient)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Elite badges for top performers (amber/gold gradient)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Verification badges for verified metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Clean grid layout with proper spacing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Mobile responsive design (badges stack properly)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
