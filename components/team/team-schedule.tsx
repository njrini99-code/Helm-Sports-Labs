'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, CalendarDays, MapPin, Clock, Trash2, Edit2, Star } from 'lucide-react';
import type { ScheduleEvent } from '@/lib/queries/team';
import type { TeamPageMode } from './team-page-shell';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addScheduleEvent, deleteScheduleEvent } from '@/lib/queries/team';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TeamScheduleProps {
  teamId: string;
  events: ScheduleEvent[];
  mode: TeamPageMode;
  onUpdate?: () => void;
}

export function TeamSchedule({ teamId, events, mode, onUpdate }: TeamScheduleProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    event_type: 'game' as ScheduleEvent['event_type'],
    opponent_name: '',
    event_name: '',
    location_name: '',
    location_address: '',
    start_time: '',
    end_time: '',
    notes: '',
    is_public: true,
  });
  const isOwner = mode === 'owner';
  const isViewer = mode === 'viewer';

  const handleAddEvent = async () => {
    if (!formData.start_time) {
      toast.error('Start time is required');
      return;
    }

    const success = await addScheduleEvent(teamId, {
      event_type: formData.event_type,
      opponent_name: formData.opponent_name || null,
      event_name: formData.event_name || null,
      location_name: formData.location_name || null,
      location_address: formData.location_address || null,
      start_time: formData.start_time,
      end_time: formData.end_time || null,
      notes: formData.notes || null,
      is_public: formData.is_public,
    });

    if (success) {
      toast.success('Event added');
      setIsAdding(false);
      setFormData({
        event_type: 'game',
        opponent_name: '',
        event_name: '',
        location_name: '',
        location_address: '',
        start_time: '',
        end_time: '',
        notes: '',
        is_public: true,
      });
      onUpdate?.();
    } else {
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const success = await deleteScheduleEvent(eventId);
    if (success) {
      toast.success('Event deleted');
      onUpdate?.();
    } else {
      toast.error('Failed to delete event');
    }
  };

  const eventTypeColors: Record<ScheduleEvent['event_type'], string> = {
    game: 'bg-blue-500/10 text-blue-200 border-blue-500/30',
    practice: 'bg-slate-500/10 text-slate-200 border-slate-500/30',
    tournament: 'bg-purple-500/10 text-purple-200 border-purple-500/30',
    showcase: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30',
  };

  return (
    <Card className="bg-[#111315] border-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Schedule
          </CardTitle>
          {isOwner && (
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-[#0B0D0F] border-white/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111315] border-white/10 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Schedule Event</DialogTitle>
                  <DialogDescription>
                    Add a game, practice, tournament, or showcase event
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select
                    value={formData.event_type}
                    onValueChange={(v) => setFormData({ ...formData, event_type: v as any })}
                  >
                    <SelectTrigger className="bg-[#0B0D0F] border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111315] border-white/10">
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                      <SelectItem value="showcase">Showcase</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.event_type === 'game' && (
                    <Input
                      placeholder="Opponent name"
                      value={formData.opponent_name}
                      onChange={(e) => setFormData({ ...formData, opponent_name: e.target.value })}
                      className="bg-[#0B0D0F] border-white/10"
                    />
                  )}

                  {(formData.event_type === 'tournament' || formData.event_type === 'showcase') && (
                    <Input
                      placeholder="Event name"
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      className="bg-[#0B0D0F] border-white/10"
                    />
                  )}

                  <Input
                    placeholder="Location name"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    className="bg-[#0B0D0F] border-white/10"
                  />

                  <Input
                    placeholder="Address (optional)"
                    value={formData.location_address}
                    onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                    className="bg-[#0B0D0F] border-white/10"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Start Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="bg-[#0B0D0F] border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">End Time (optional)</label>
                      <Input
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="bg-[#0B0D0F] border-white/10"
                      />
                    </div>
                  </div>

                  <Textarea
                    placeholder="Notes (optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-[#0B0D0F] border-white/10"
                    rows={3}
                  />

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No events scheduled yet
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const startDate = new Date(event.start_time);
              const endDate = event.end_time ? new Date(event.end_time) : null;

              return (
                <div
                  key={event.id}
                  className="p-4 rounded-lg bg-[#0B0D0F] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={eventTypeColors[event.event_type]}>
                          {event.event_type}
                        </Badge>
                        <span className="text-white font-medium">
                          {event.event_type === 'game' && event.opponent_name
                            ? `vs ${event.opponent_name}`
                            : event.event_name || 'Event'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          {format(startDate, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(startDate, 'h:mm a')}
                          {endDate && ` - ${format(endDate, 'h:mm a')}`}
                        </div>
                        {event.location_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.location_name}
                            {event.location_address && `, ${event.location_address}`}
                          </div>
                        )}
                        {event.notes && (
                          <p className="text-slate-500 mt-2">{event.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isViewer && (
                        <Button variant="ghost" size="sm" title="Add to calendar">
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      {isOwner && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
