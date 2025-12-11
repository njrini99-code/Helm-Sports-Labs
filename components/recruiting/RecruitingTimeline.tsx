'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Mail, Phone, FileText, Award, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  event_type: 'contact' | 'visit' | 'offer' | 'commitment' | 'message' | 'call' | 'deadline' | 'custom';
  title: string;
  description?: string;
  date: string;
  status?: 'completed' | 'scheduled' | 'missed' | 'cancelled';
  location?: string;
  metadata?: Record<string, any>;
}

interface RecruitingTimelineProps {
  playerId: string;
  coachId?: string;
  className?: string;
}

const EVENT_ICONS = {
  contact: Mail,
  visit: MapPin,
  offer: Award,
  commitment: CheckCircle2,
  message: Mail,
  call: Phone,
  deadline: AlertCircle,
  custom: FileText,
};

const EVENT_COLORS = {
  contact: 'bg-blue-500',
  visit: 'bg-purple-500',
  offer: 'bg-emerald-500',
  commitment: 'bg-green-600',
  message: 'bg-slate-500',
  call: 'bg-indigo-500',
  deadline: 'bg-red-500',
  custom: 'bg-amber-500',
};

export function RecruitingTimeline({ playerId, coachId, className }: RecruitingTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [playerId, coachId]);

  const loadTimeline = async () => {
    try {
      const supabase = createClient();
      
      // Get timeline events from player_journey_events
      const { data: journeyEvents, error } = await supabase
        .from('player_journey_events')
        .select('*')
        .eq('player_id', playerId)
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Error loading timeline:', error);
        setEvents([]);
        return;
      }

      // Transform to timeline events
      const timelineEvents: TimelineEvent[] = (journeyEvents || []).map((event: any) => ({
        id: event.id,
        event_type: event.event_type as TimelineEvent['event_type'],
        title: event.title,
        description: event.description,
        date: event.event_date,
        status: event.status as TimelineEvent['status'],
        location: event.location,
        metadata: event.metadata,
      }));

      // Add NCAA deadlines if coach is viewing
      if (coachId) {
        const currentYear = new Date().getFullYear();
        const deadlines = getNCAADeadlines(currentYear);
        timelineEvents.push(...deadlines);
      }

      // Sort by date (newest first)
      timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error in loadTimeline:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getNCAADeadlines = (year: number): TimelineEvent[] => {
    // NCAA recruiting calendar deadlines
    return [
      {
        id: `deadline-early-signing-${year}`,
        event_type: 'deadline',
        title: 'Early Signing Period',
        description: 'NCAA Early Signing Period begins',
        date: `${year}-11-08`,
        status: 'scheduled',
      },
      {
        id: `deadline-regular-signing-${year + 1}`,
        event_type: 'deadline',
        title: 'Regular Signing Period',
        description: 'NCAA Regular Signing Period begins',
        date: `${year + 1}-04-01`,
        status: 'scheduled',
      },
    ];
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recruiting Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recruiting Timeline
          </CardTitle>
          <Button variant="outline" size="sm">
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p>No timeline events yet</p>
            <p className="text-sm mt-2">Start by adding a contact or milestone</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
            
            <div className="space-y-6">
              {events.map((event, index) => {
                const Icon = EVENT_ICONS[event.event_type] || FileText;
                const colorClass = EVENT_COLORS[event.event_type] || 'bg-slate-500';
                const isUpcoming = new Date(event.date) > new Date();
                const isPast = new Date(event.date) < new Date();

                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className={cn(
                      'relative z-10 flex items-center justify-center w-12 h-12 rounded-full',
                      colorClass,
                      'ring-4 ring-white dark:ring-slate-900',
                      isUpcoming && 'ring-amber-200 dark:ring-amber-900',
                      isPast && 'ring-slate-200 dark:ring-slate-700'
                    )}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {event.title}
                            </h4>
                            {event.status && (
                              <Badge
                                variant={
                                  event.status === 'completed' ? 'default' :
                                  event.status === 'scheduled' ? 'secondary' :
                                  event.status === 'missed' ? 'destructive' : 'outline'
                                }
                                className="text-xs"
                              >
                                {event.status}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(event.date)}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-slate-400">
                          {formatDate(event.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
