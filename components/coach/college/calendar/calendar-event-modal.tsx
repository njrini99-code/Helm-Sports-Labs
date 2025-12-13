'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Users, 
  X, 
  Search,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  type CalendarEvent,
  type CalendarEventType,
  type CalendarEventInput,
  type PlayerSummary,
  searchRecruitsForCalendar,
} from '@/lib/queries/calendar';

interface CalendarEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CalendarEventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  coachId: string;
  event?: CalendarEvent | null;
  preselectedDate?: string;
  preselectedType?: CalendarEventType;
}

const EVENT_TYPES: { value: CalendarEventType; label: string; color: string }[] = [
  { value: 'camp', label: 'Camp', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'evaluation', label: 'Player Evaluation', color: 'bg-blue-100 text-blue-700' },
  { value: 'visit', label: 'Player Visit', color: 'bg-purple-100 text-purple-700' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-700' },
];

export function CalendarEventModal({
  open,
  onClose,
  onSave,
  onDelete,
  coachId,
  event,
  preselectedDate,
  preselectedType,
}: CalendarEventModalProps) {
  const isEditing = !!event;

  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<CalendarEventType>(preselectedType || 'evaluation');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(preselectedDate || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [opponentEventName, setOpponentEventName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerSummary[]>([]);
  
  const [playerSearch, setPlayerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerSummary[]>([]);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [allPlayers, setAllPlayers] = useState<PlayerSummary[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load all players on mount
  useEffect(() => {
    if (open) {
      searchRecruitsForCalendar(coachId, '').then(setAllPlayers);
    }
  }, [open, coachId]);

  // Initialize form when editing
  useEffect(() => {
    if (event) {
      setType(event.type);
      setTitle(event.title);
      setDate(event.date);
      setStartTime(event.startTime || '');
      setEndTime(event.endTime || '');
      setLocation(event.location || '');
      setNotes(event.notes || '');
      setOpponentEventName(event.opponentEventName || '');
      setSelectedPlayers(event.players || []);
    } else {
      setType(preselectedType || 'evaluation');
      setTitle('');
      setDate(preselectedDate || '');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setNotes('');
      setOpponentEventName('');
      setSelectedPlayers([]);
    }
  }, [event, preselectedDate, preselectedType, open]);

  // Filter players based on search
  useEffect(() => {
    if (playerSearch) {
      const results = allPlayers.filter((p) => {
        const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        const isNotSelected = !selectedPlayers.some((sp) => sp.id === p.id);
        return fullName.includes(playerSearch.toLowerCase()) && isNotSelected;
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [playerSearch, allPlayers, selectedPlayers]);

  const handleAddPlayer = (player: PlayerSummary) => {
    setSelectedPlayers([...selectedPlayers, player]);
    setPlayerSearch('');
    setShowPlayerSearch(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId));
  };

  const handleSave = async () => {
    if (!title || !date || !type) return;
    
    setSaving(true);
    try {
      await onSave({
        type,
        title,
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location: location || undefined,
        notes: notes || undefined,
        opponentEventName: type === 'evaluation' ? opponentEventName || undefined : undefined,
        playerIds: selectedPlayers.length === 0 ? [] : selectedPlayers.map((p) => p.id),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {isEditing ? 'Edit Event' : 'Add Event'}
          </DialogTitle>
        </DialogHeader>
      <div className="space-y-4 py-2">
          {/* Event Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Event Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    <span className={`px-2 py-0.5 rounded text-xs ${et.color}`}>
                      {et.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Elite Prospect Camp"
              className="h-9"
            />
          </div>
      {/* Opponent/Event Name (for evaluations) */}
          {type === 'evaluation' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Tournament / Event Name</Label>
              <Input
                value={opponentEventName}
                onChange={(e) => setOpponentEventName(e.target.value)}
                placeholder="e.g., Perfect Game - Atlanta"
                className="h-9"
              />
            </div>
)}
          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Start
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                End
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
      {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Stadium, Atlanta GA"
              className="h-9"
            />
          </div>
      {/* Linked Players */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Linked Players
            </Label>
      {/* Selected Players */}
            {selectedPlayers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedPlayers.map((player) => (
                  <Badge
                    key={player.id}
                    variant="secondary"
                    className="pl-1.5 pr-1 py-0.5 gap-1.5 bg-slate-100"
                  >
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={player.avatarUrl} />
                      <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700">
                        {player.firstName?.[0]}{player.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">
                      {player.firstName} {player.lastName}
                    </span>
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="hover:bg-slate-200 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {/* Player Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={playerSearch}
                onChange={(e) => {
                  setPlayerSearch(e.target.value);
                  setShowPlayerSearch(true);
                }}
                onFocus={() => setShowPlayerSearch(true)}
                placeholder="Search recruits to add..."
                className="h-8 pl-8 text-xs"
              />

              {/* Search Results Dropdown */}
              {showPlayerSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl border border-slate-200 shadow-lg z-10 max-h-32 overflow-y-auto">
                  {searchResults.map((player) => (
                    <button
                      key={player.id}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left"
                      onClick={() => handleAddPlayer(player)}
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={player.avatarUrl} />
                        <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700">
                          {player.firstName?.[0]}{player.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-700">
                        {player.firstName} {player.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {player.primaryPosition} • {player.gradYear}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
      {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes / Agenda
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or agenda items..."
              className="min-h-[60px] text-sm resize-none"
            />
          </div>
        </div>
      <DialogFooter className="flex items-center justify-between sm:justify-between">
          {isEditing && onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </>
              )}
            </Button>
          ) : (
            <div></div>
)}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleSave}
              disabled={!title || !date || saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Save Changes' : 'Add Event'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

