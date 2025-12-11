'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Highlight = {
  event: string;
  grade: number;
  evaluator: string;
  tags: string[];
};

export function PlayerOverviewShowcaseHighlight({ playerId }: { playerId: string }) {
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluation();
  }, [playerId]);

  // Loads real evaluation data from evaluations table
  const loadEvaluation = async () => {
    try {
      const supabase = createClient();
      
      // Get the most recent evaluation
      const { data: evaluations, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          evaluator:evaluator_id (
            full_name,
            program_name
          ),
          events:event_id (
            event_name
          )
        `)
        .eq('player_id', playerId)
        .order('eval_date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading evaluation:', error);
        setHighlight(null);
        setLoading(false);
        return;
      }

      if (!evaluations || evaluations.length === 0) {
        setHighlight(null);
        setLoading(false);
        return;
      }

      const eval = evaluations[0];
      const evaluator = eval.evaluator as any;
      const event = eval.events as any;

      // Extract tags from evaluation notes or strengths
      const tags: string[] = [];
      if (eval.strengths && Array.isArray(eval.strengths)) {
        tags.push(...eval.strengths.slice(0, 3));
      } else if (eval.evaluation_notes) {
        // Try to extract key phrases
        const notes = eval.evaluation_notes.toLowerCase();
        if (notes.includes('high motor')) tags.push('High motor');
        if (notes.includes('finisher')) tags.push('Finisher');
        if (notes.includes('two-way')) tags.push('Two-way');
        if (notes.includes('athletic')) tags.push('Athletic');
        if (notes.includes('defensive')) tags.push('Defensive');
      }

      setHighlight({
        event: event?.event_name || eval.event_name || 'Showcase Event',
        grade: eval.overall_grade || eval.grade || 0,
        evaluator: evaluator?.full_name || evaluator?.program_name || 'Evaluator',
        tags: tags.length > 0 ? tags : ['Showcase performance'],
      });
    } catch (error) {
      console.error('Error in loadEvaluation:', error);
      setHighlight(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <p className="text-sm text-slate-200">Showcase highlight</p>
        </div>
        <div className="text-center py-8 text-slate-500">Loading...</div>
      </Card>
    );
  }

  if (!highlight) {
    return (
      <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full flex flex-col gap-3">
        <div className="flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <p className="text-sm text-slate-200">Showcase highlight</p>
          <span className="text-[11px] text-slate-500">Player {playerId.slice(0, 6)}…</span>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-white/60 mb-4">No showcase evaluations yet</p>
          <p className="text-white/40 text-sm">Check back later</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <Sparkles className="w-4 h-4 text-emerald-300" />
        <p className="text-sm text-slate-200">Showcase highlight</p>
        <span className="text-[11px] text-slate-500">Player {playerId.slice(0, 6)}…</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
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
          {highlight.tags.length === 0 ? (
            <Badge className="bg-white/10 border-white/20 text-white">Showcase performance</Badge>
          ) : (
            highlight.tags.map((tag) => (
              <Badge key={tag} className="bg-white/10 border-white/20 text-white">
                {tag}
              </Badge>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
