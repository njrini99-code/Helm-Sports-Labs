'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building, 
  MapPin, 
  Users, 
  ArrowRight, 
  User, 
  Sparkles, 
  TrendingUp,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// State code to name mapping
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

export type EntityType = 'players' | 'teams' | 'juco';

export interface PlayerSummary {
  id: string;
  name: string;
  avatarUrl?: string | null;
  gradYear: number;
  state: string;
  primaryPosition: string;
  secondaryPosition?: string;
  height?: string;
  weight?: number;
  metrics?: string[];
  verified?: boolean;
  trending?: boolean;
  topSchool?: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
  state?: string | null;
  type: 'high_school' | 'showcase';
  playersCount?: number;
  committedCount?: number;
}

export interface JucoSummary {
  id: string;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
  state?: string | null;
  conference?: string | null;
  playersCount?: number;
}

interface DiscoverStatePanelProps {
  selectedState: string | null;
  activeEntityType: EntityType;
  onChangeEntityType: (type: EntityType) => void;
  players: PlayerSummary[];
  teams: TeamSummary[];
  jucos: JucoSummary[];
  loading?: boolean;
  onAddToWatchlist?: (playerId: string) => void;
}

export function DiscoverStatePanel({
  selectedState,
  activeEntityType,
  onChangeEntityType,
  players,
  teams,
  jucos,
  loading = false,
  onAddToWatchlist,
}: DiscoverStatePanelProps) {
  const router = useRouter();

  const stateName = selectedState ? STATE_NAMES[selectedState] || selectedState : null;

  const getCount = () => {
    switch (activeEntityType) {
      case 'players': return players.length;
      case 'teams': return teams.length;
      case 'juco': return jucos.length;
    }
  };

  const getLabel = () => {
    switch (activeEntityType) {
      case 'players': return 'recruits';
      case 'teams': return 'teams';
      case 'juco': return 'programs';
    }
  };

  return (
    <Card className="h-full flex flex-col transition-colors bg-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {selectedState ? 'State Drilldown' : 'Select a State'}
            </p>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              {stateName ? (
                <>
                  <MapPin className="w-4 h-4 text-primary" />
                  {stateName}
                </>
              ) : (
                'No state selected'
              )}
            </h3>
          </div>
          {selectedState && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {getCount()} {getLabel()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 overflow-hidden flex flex-col">
        <Tabs 
          value={activeEntityType} 
          onValueChange={(v) => onChangeEntityType(v as EntityType)}
          className="flex-1 flex flex-col"
        >
          <TabsList className="border w-full grid grid-cols-3 bg-muted/50 border-border">
            <TabsTrigger value="players" className="text-xs">
              <User className="w-3 h-3 mr-1" />
              Players
            </TabsTrigger>
            <TabsTrigger value="teams" className="text-xs">
              <Building className="w-3 h-3 mr-1" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="juco" className="text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              JUCO
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !selectedState ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div>
                <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Click on a state in the map to see recruits, teams, and JUCO programs.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Players Tab */}
              <TabsContent value="players" className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-[400px] pr-3">
                  {players.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No players found in {stateName}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {players.map((player) => (
                        <PlayerCard 
                          key={player.id} 
                          player={player} 
                          onAddToWatchlist={onAddToWatchlist}
                          onView={() => router.push(`/coach/college/player/${player.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Teams Tab */}
              <TabsContent value="teams" className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-[400px] pr-3">
                  {teams.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No teams found in {stateName}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teams.map((team) => (
                        <TeamCard 
                          key={team.id} 
                          team={team}
                          onView={() => router.push(`/coach/college/teams/${team.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* JUCO Tab */}
              <TabsContent value="juco" className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-[400px] pr-3">
                  {jucos.length === 0 ? (
                    <div className="text-center py-8">
                      <GraduationCap className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No JUCO programs found in {stateName}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jucos.map((juco) => (
                        <JucoCard 
                          key={juco.id} 
                          juco={juco}
                          onView={() => router.push(`/coach/college/teams/${juco.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Player Card Component
function PlayerCard({ 
  player, 
  onAddToWatchlist,
  onView 
}: { 
  player: PlayerSummary;
  onAddToWatchlist?: (id: string) => void;
  onView: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-3 hover:border-primary/40 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 rounded-lg">
          {player.avatarUrl ? (
            <AvatarImage src={player.avatarUrl} alt={player.name} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-xs rounded-lg">
              {player.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground">{player.name}</p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {player.gradYear}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {player.primaryPosition}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {player.verified && (
              <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px] gap-0.5 px-1.5 py-0">
                <Sparkles className="w-2.5 h-2.5" /> Verified
              </Badge>
            )}
            {player.trending && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-[10px] gap-0.5 px-1.5 py-0">
                <TrendingUp className="w-2.5 h-2.5" /> Trending
              </Badge>
            )}
          </div>

          {player.metrics && player.metrics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {player.metrics.slice(0, 3).map((metric, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/50">
                  {metric}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Button
            size="sm"
            className="text-[10px] h-7 px-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => onAddToWatchlist?.(player.id)}
          >
            + Watchlist
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-[10px] h-7 px-2"
            onClick={onView}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

// Team Card Component
function TeamCard({ 
  team,
  onView 
}: { 
  team: TeamSummary;
  onView: () => void;
}) {
  const typeLabel = team.type === 'high_school' ? 'High School' : 'Showcase';

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-3 hover:border-primary/40 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center overflow-hidden">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
          ) : (
            <Building className="w-5 h-5 text-blue-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground">{team.name}</p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {typeLabel}
            </Badge>
          </div>

          {team.city && team.state && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {team.city}, {team.state}
            </p>
          )}

          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
            {team.playersCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {team.playersCount} players
              </span>
            )}
            {team.committedCount !== undefined && team.committedCount > 0 && (
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 px-1.5 py-0">
                {team.committedCount} commits
              </Badge>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-[10px] h-7 px-2"
          onClick={onView}
        >
          View <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// JUCO Card Component
function JucoCard({ 
  juco,
  onView 
}: { 
  juco: JucoSummary;
  onView: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-3 hover:border-primary/40 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center overflow-hidden">
          {juco.logoUrl ? (
            <img src={juco.logoUrl} alt={juco.name} className="h-full w-full object-cover" />
          ) : (
            <GraduationCap className="w-5 h-5 text-purple-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground">{juco.name}</p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/30">
              JUCO
            </Badge>
          </div>

          {juco.city && juco.state && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {juco.city}, {juco.state}
            </p>
          )}

          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
            {juco.conference && (
              <span>{juco.conference}</span>
            )}
            {juco.playersCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {juco.playersCount} players
              </span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-[10px] h-7 px-2"
          onClick={onView}
        >
          View <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
