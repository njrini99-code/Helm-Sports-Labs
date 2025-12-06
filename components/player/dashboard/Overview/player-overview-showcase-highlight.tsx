'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

type Highlight = {
  event: string;
  grade: number;
  evaluator: string;
  tags: string[];
};

export function PlayerOverviewShowcaseHighlight({ playerId }: { playerId: string }) {
  // TODO: pull from evaluations
  const highlight: Highlight = {
    event: 'Southeast Showcase',
    grade: 92,
    evaluator: 'Coach Lee',
    tags: ['High motor', 'Finisher', 'Two-way'],
  };

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-300" />
        <p className="text-sm text-slate-200">Showcase highlight</p>
        <span className="text-[11px] text-slate-500">Player {playerId.slice(0, 6)}…</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Event</p>
            <p className="text-base font-semibold">{highlight.event}</p>
          </div>
          <Badge variant="outline" className="border-emerald-400/60 text-emerald-300 bg-emerald-500/10">
            {highlight.grade}/100
          </Badge>
        </div>
        <p className="text-xs text-slate-400">Evaluator: {highlight.evaluator}</p>
        <div className="flex flex-wrap gap-2">
          {highlight.tags.map((tag) => (
            <Badge key={tag} className="bg-white/10 border-white/20 text-white">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
