'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin } from 'lucide-react';
import type { Coach } from '@/lib/types';

interface FeaturedProgramsProps {
  programs: Coach[];
  onFollow?: (programId: string) => void;
}

export function FeaturedPrograms({ programs, onFollow }: FeaturedProgramsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Featured Programs</h3>
        <p className="text-xs text-slate-400">Hand-picked for visibility</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {{programs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            programs.map((program) => (
          <Card key={program.id} className="bg-[#111315] border-white/5 hover:border-blue-500/30 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center overflow-hidden">
                <Building className="w-5 h-5 text-blue-300" />
              </div>
              <Badge variant="outline" className="text-xs">
                {program.program_division || 'College'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-white leading-tight">
                  {program.program_name || program.school_name || 'Program'}
                </p>
                <p className="text-xs text-slate-400">
                  {program.school_city && program.school_state ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {program.school_city}, {program.school_state}
                    </span>
                  ) : (
                    'Location TBD'
                  )}
                </p>
              </div>

              <p className="text-sm text-slate-300 line-clamp-2">
                {program.program_values || program.about || 'Player development focused. Competitive schedule.'}
              </p>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Program
                </Button>
                <Button size="sm" variant="success" onClick={() => onFollow?.(program.id)}>
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
