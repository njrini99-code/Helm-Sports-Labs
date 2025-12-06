'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TeamType = 'high_school' | 'showcase' | 'juco';

const TYPE_LABEL: Record<TeamType, string> = {
  high_school: 'High School',
  showcase: 'Showcase',
  juco: 'JUCO',
};

export interface TeamCard {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  type: TeamType;
  logoUrl?: string | null;
  playersCount?: number;
  committedCount?: number;
}

interface DiscoverTeamListProps {
  teams: TeamCard[];
}

export function DiscoverTeamList({ teams }: DiscoverTeamListProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {teams.map((team) => (
        <Card
          key={team.id}
          className="bg-[#111315] border-white/5 hover:border-blue-500/30 transition-all duration-200 hover:-translate-y-[1px]"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center overflow-hidden">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <Building className="w-5 h-5 text-blue-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{team.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABEL[team.type] || team.type}
                  </Badge>
                  {team.city && team.state && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" /> {team.city}, {team.state}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-slate-400 mt-2">
                  {team.playersCount !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> {team.playersCount} on ScoutPulse
                    </span>
                  )}
                  {team.committedCount !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-200 border-emerald-500/30">
                        {team.committedCount} commitments
                      </Badge>
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/coach/college/teams/${team.id}`)}
                    className="gap-2"
                  >
                    View Team
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
