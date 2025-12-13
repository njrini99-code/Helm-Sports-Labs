'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target } from 'lucide-react';
import type { Coach } from '@/lib/types';

interface RecommendedProgramsProps {
  programs: (Coach & { matchScore?: number; reason?: string })[];
  onFollow?: (programId: string) => void;
}

export function RecommendedPrograms({ programs, onFollow }: RecommendedProgramsProps) {
  return (
    <Card className="bg-[#111315] border-white/5">
      <CardHeader className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <div>
          <CardTitle className="text-lg text-white flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Recommended Programs
          </CardTitle>
          <p className="text-xs text-slate-400">Based on your profile and goals</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {programs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            programs.map((program) => (
          <div key={program.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <Target className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <p className="text-sm font-semibold text-white truncate">
                  {program.program_name || program.school_name || 'Program'}
                </p>
                <Badge variant="outline" className="text-[10px]">
                  {program.program_division || 'College'}
                </Badge>
                {program.matchScore !== undefined && (
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-500/30 text-[10px]">
                    Match {program.matchScore}/100
                  </Badge>
)}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {program.reason || 'Good fit for your grad year, position, and region.'}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline">View Program</Button>
                <Button size="sm" variant="ghost" onClick={() => onFollow?.(program.id)}>Follow</Button>
              </div>
            </div>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  );
}
