'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, ChevronRight, Users } from 'lucide-react';
import { type CalendarEvent, type CalendarEventType } from '@/lib/queries/calendar';

interface UpcomingEventsPanelProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onViewAll: () => void;
}

const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  camp: 'Camp',
  evaluation: 'Evaluation',
  visit: 'Visit',
  other: 'Other',
};

const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  camp: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  evaluation: 'bg-blue-50 text-blue-700 border-blue-200',
  visit: 'bg-purple-50 text-purple-700 border-purple-200',
  other: 'bg-slate-50 text-slate-700 border-slate-200',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.getTime() === today.getTime()) {
    return 'Today';
  }
  if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
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

export function UpcomingEventsPanel({ events, onEventClick, onViewAll }: UpcomingEventsPanelProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Upcoming Events</h3>
          <p className="text-xs text-slate-400 mt-0.5">Next 14 days</p>
        </div>
        <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px]">
          {events.length} events
        </Badge>
      </div>

      <div className="divide-y divide-slate-100">
        {events.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
            <p className="text-xs text-slate-400">No upcoming events</p>
          </div>
        ) : (
          events.map((event) => (
            <button
              key={event.id}
              className="w-full px-4 py-3 text-left hover:bg-slate-50/50 transition-colors"
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title + Badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                    <Badge className={`text-[10px] px-1.5 py-0 border ${EVENT_TYPE_COLORS[event.type]}`}>
                      {EVENT_TYPE_LABELS[event.type]}
                    </Badge>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(event.date)}
                    </span>
                    {event.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.startTime)}
                      </span>
                    )}
                  </div>

                  {event.location && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {event.location}
                    </p>
                  )}

                  {/* Players */}
                  {event.players && event.players.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex -space-x-1.5">
                        {event.players.slice(0, 3).map((player) => (
                          <Avatar key={player.id} className="w-5 h-5 border border-white">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700">
                              {player.firstName?.[0]}{player.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {event.players.length > 3 && (
                        <span className="text-[10px] text-slate-400 ml-1">
                          +{event.players.length - 3}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-1 flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" />
                        {event.players.length} player{event.players.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </div>
            </button>
          ))
        )}
      </div>

      {events.length > 0 && (
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-slate-600 hover:text-slate-800"
            onClick={onViewAll}
          >
            View all events
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
}

