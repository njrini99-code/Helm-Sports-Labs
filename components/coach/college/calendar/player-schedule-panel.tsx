'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Calendar, User, ChevronRight, X, Clock } from 'lucide-react';
import { 
  type CalendarEvent, 
  type PlayerSummary, 
  searchRecruitsForCalendar,
  getPlayerEvents,
} from '@/lib/queries/calendar';

interface PlayerSchedulePanelProps {
  coachId: string;
  onEventClick: (event: CalendarEvent) => void;
  onViewProfile: (playerId: string) => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  camp: 'bg-emerald-50 text-emerald-700',
  evaluation: 'bg-blue-50 text-blue-700',
  visit: 'bg-purple-50 text-purple-700',
  other: 'bg-slate-50 text-slate-700',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(time?: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function PlayerSchedulePanel({ coachId, onEventClick, onViewProfile }: PlayerSchedulePanelProps) {
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(null);
  const [playerEvents, setPlayerEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load all recruits on mount
  useEffect(() => {
    const loadPlayers = async () => {
      const results = await searchRecruitsForCalendar(coachId, '');
      setPlayers(results);
    };
    loadPlayers();
  }, [coachId]);

  // Filter players based on search
  const filteredPlayers = search
    ? players.filter((p) => {
        const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
      })
    : [];

  // Load events when player is selected
  useEffect(() => {
    if (selectedPlayer) {
      setLoading(true);
      getPlayerEvents(coachId, selectedPlayer.id).then((events) => {
        setPlayerEvents(events);
        setLoading(false);
      });
    }
  }, [coachId, selectedPlayer]);

  const handleSelectPlayer = (player: PlayerSummary) => {
    setSelectedPlayer(player);
    setSearch('');
    setShowResults(false);
  };

  const handleClearPlayer = () => {
    setSelectedPlayer(null);
    setPlayerEvents([]);
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white/10 backdrop-blur-md border border-white/20 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Player-linked Schedule</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          View upcoming events for a specific recruit
        </p>
      </div>

      <div className="p-4">
        {/* Search / Selected Player */}
        {selectedPlayer ? (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
            <Avatar className="w-10 h-10 border border-white shadow-sm">
              <AvatarImage src={selectedPlayer.avatarUrl} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                {selectedPlayer.firstName?.[0]}{selectedPlayer.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">
                {selectedPlayer.firstName} {selectedPlayer.lastName}
              </p>
              <p className="text-xs text-slate-400">
                {selectedPlayer.primaryPosition} • Class of {selectedPlayer.gradYear}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleClearPlayer}
            >
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        ) : (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search recruits..."
              className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            
            {/* Search Results Dropdown */}
            {showResults && filteredPlayers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl border border-slate-200 shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredPlayers.map((player) => (
                  <button
                    key={player.id}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left"
                    onClick={() => handleSelectPlayer(player)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={player.avatarUrl} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {player.firstName?.[0]}{player.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {player.primaryPosition} • {player.gradYear}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Player Events */}
        {selectedPlayer && (
          <div>
            {loading ? (
              <div className="py-6 text-center">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : playerEvents.length === 0 ? (
              <div className="py-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                <p className="text-xs text-slate-400">No upcoming events for this player</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playerEvents.map((event) => (
                  <button
                    key={event.id}
                    className="w-full p-3 bg-slate-50 rounded-xl text-left hover:bg-slate-100 transition-colors"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${EVENT_TYPE_COLORS[event.type]}`}>
                        {event.type}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDate(event.date)}
                        {event.startTime && ` · ${formatTime(event.startTime)}`}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{event.title}</p>
                  </button>
                ))}
              </div>
            )}

            {/* View Profile Link */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 h-8 text-xs text-slate-600 hover:text-emerald-600"
              onClick={() => onViewProfile(selectedPlayer.id)}
            >
              View full profile
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!selectedPlayer && (
          <div className="py-4 text-center">
            <User className="w-8 h-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
            <p className="text-xs text-slate-400">Search for a recruit to view their schedule</p>
          </div>
        )}
      </div>
    </Card>
  );
}

