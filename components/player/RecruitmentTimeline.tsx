'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  GraduationCap,
  Mail,
  MapPin,
  Calendar,
  Trophy,
  Heart,
  Star,
  MoreVertical,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Plane,
  FileText,
  Handshake,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Target,
  Flag,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type RecruitmentStage = 'prospect' | 'contact' | 'visit' | 'offer' | 'commitment';

export interface CollegeInterest {
  id: string;
  college: {
    id: string;
    name: string;
    logoUrl?: string;
    division?: string;
    conference?: string;
    location?: string;
  };
  stage: RecruitmentStage;
  status: 'active' | 'declined' | 'accepted' | 'waitlist';
  priority: 'dream' | 'high' | 'medium' | 'low';
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  events: RecruitmentEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentEvent {
  id: string;
  type: 'email' | 'call' | 'text' | 'visit' | 'offer' | 'camp' | 'game' | 'meeting' | 'commitment' | 'other';
  title: string;
  description?: string;
  date: string;
  isCompleted: boolean;
}

interface RecruitmentTimelineProps {
  interests: CollegeInterest[];
  onUpdateStage: (interestId: string, newStage: RecruitmentStage) => Promise<boolean>;
  onUpdateInterest: (interest: CollegeInterest) => Promise<boolean>;
  onDeleteInterest: (interestId: string) => Promise<boolean>;
  onAddInterest: (interest: Omit<CollegeInterest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onAddEvent: (interestId: string, event: Omit<RecruitmentEvent, 'id'>) => Promise<boolean>;
  isEditable?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const STAGES: { id: RecruitmentStage; label: string; icon: React.ElementType; color: string; gradient: string }[] = [
  { 
    id: 'prospect', 
    label: 'Prospect', 
    icon: Target,
    color: 'text-slate-500',
    gradient: 'from-slate-400 to-slate-500',
  },
  { 
    id: 'contact', 
    label: 'Contact', 
    icon: Mail,
    color: 'text-blue-500',
    gradient: 'from-blue-400 to-blue-500',
  },
  { 
    id: 'visit', 
    label: 'Visit', 
    icon: Plane,
    color: 'text-purple-500',
    gradient: 'from-purple-400 to-purple-500',
  },
  { 
    id: 'offer', 
    label: 'Offer', 
    icon: FileText,
    color: 'text-amber-500',
    gradient: 'from-amber-400 to-amber-500',
  },
  { 
    id: 'commitment', 
    label: 'Commitment', 
    icon: Handshake,
    color: 'text-emerald-500',
    gradient: 'from-emerald-400 to-emerald-500',
  },
];

const EVENT_TYPES = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'text', label: 'Text Message', icon: MessageSquare },
  { value: 'visit', label: 'Campus Visit', icon: MapPin },
  { value: 'offer', label: 'Offer Received', icon: FileText },
  { value: 'camp', label: 'Camp/Showcase', icon: Trophy },
  { value: 'game', label: 'Game Attended', icon: Eye },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'commitment', label: 'Commitment', icon: Handshake },
  { value: 'other', label: 'Other', icon: Flag },
];

const PRIORITY_COLORS = {
  dream: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
  high: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  medium: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  low: 'bg-slate-200 text-slate-600',
};

// ═══════════════════════════════════════════════════════════════════════════
// Glassmorphism Styles
// ═══════════════════════════════════════════════════════════════════════════

const glassCard = 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5';
const glassCardHover = 'hover:bg-white/80 hover:shadow-xl hover:shadow-black/10 hover:border-white/30';
const glassPanel = 'bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border border-white/30 shadow-xl';

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function RecruitmentTimeline({
  interests,
  onUpdateStage,
  onUpdateInterest,
  onDeleteInterest,
  onAddInterest,
  onAddEvent,
  isEditable = true,
  className,
}: RecruitmentTimelineProps) {
  const [selectedInterest, setSelectedInterest] = useState<CollegeInterest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Group interests by stage
  const interestsByStage = useMemo(() => {
    const grouped: Record<RecruitmentStage, CollegeInterest[]> = {
      prospect: [],
      contact: [],
      visit: [],
      offer: [],
      commitment: [],
    };
    
    interests.forEach(interest => {
      grouped[interest.stage].push(interest);
    });

    // Sort each stage by priority
    const priorityOrder = { dream: 0, high: 1, medium: 2, low: 3 };
    Object.keys(grouped).forEach(stage => {
      grouped[stage as RecruitmentStage].sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    });

    return grouped;
  }, [interests]);

  // Handle drag and drop stage change
  const handleDrop = useCallback(async (interestId: string, newStage: RecruitmentStage) => {
    const interest = interests.find(i => i.id === interestId);
    if (!interest || interest.stage === newStage) return;

    const success = await onUpdateStage(interestId, newStage);
    if (success) {
      toast.success(`Moved to ${STAGES.find(s => s.id === newStage)?.label}`);
    } else {
      toast.error('Failed to update stage');
    }
    setDraggedItem(null);
  }, [interests, onUpdateStage]);

  // Stats summary
  const stats = useMemo(() => ({
    total: interests.length,
    offers: interestsByStage.offer.length + interestsByStage.commitment.length,
    committed: interestsByStage.commitment.length,
    dreamSchools: interests.filter(i => i.priority === 'dream').length,
  }), [interests, interestsByStage]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <div className={cn('rounded-3xl p-6', glassPanel)}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-500" />
              My Recruitment Journey
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Track your college recruitment progress and interactions
            </p>
          </div>
      {/* Stats Pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/20">
              <Target className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{stats.total} Schools</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
              <FileText className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">{stats.offers} Offers</span>
            </div>
            {stats.dreamSchools > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-200">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-pink-700">{stats.dreamSchools} Dream Schools</span>
              </div>
)}
            {isEditable && (
              <Button
                onClick={() => setIsAddCollegeOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add School
              </Button>
)}
          </div>
        </div>
      </div>
      {/* Stage Timeline */}
      <div className="relative">
        {/* Timeline Connection Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-blue-200 via-purple-200 via-amber-200 to-emerald-200 rounded-full hidden lg:block"></div>
{/* Stage Icons Row */}
        <div className="hidden lg:flex justify-between relative z-10 mb-6 px-8">
          {STAGES.map((stage, index) => {
            const count = interestsByStage[stage.id].length;
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="flex flex-col items-center">
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg',
                  `bg-gradient-to-br ${stage.gradient}`,
                  count > 0 ? 'ring-4 ring-white' : 'opacity-60'
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={cn(
                  'text-sm font-semibold mt-2',
                  count > 0 ? 'text-slate-800' : 'text-slate-400'
                )}>
                  {stage.label}
                </span>
                <Badge variant="outline" className={cn(
                  'mt-1 text-xs',
                  count > 0 ? 'bg-white' : 'bg-slate-50 text-slate-400'
                )}>
                  {count}
                </Badge>
              </div>
            );
          })}
        </div>
      {/* Stage Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              interests={interestsByStage[stage.id]}
              isEditable={isEditable}
              draggedItem={draggedItem}
              onDragStart={setDraggedItem}
              onDrop={handleDrop}
              onSelectInterest={(interest) => {
                setSelectedInterest(interest);
                setIsDetailOpen(true);
              }}
              onUpdateStage={onUpdateStage}
            />
          })
        </div>
      </div>
      {/* Detail Modal */}
      <CollegeDetailModal
        interest={selectedInterest}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedInterest(null);
        }}
        onUpdate={onUpdateInterest}
        onDelete={onDeleteInterest}
        onAddEvent={() => setIsAddEventOpen(true)}
        isEditable={isEditable}
      />

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onAdd={async (event) => {
          if (selectedInterest) {
            const success = await onAddEvent(selectedInterest.id, event);
            if (success) {
              toast.success('Event added');
              setIsAddEventOpen(false);
            }
            return success;
          }
          return false;
        }}
      />

      {/* Add College Modal */}
      <AddCollegeModal
        isOpen={isAddCollegeOpen}
        onClose={() => setIsAddCollegeOpen(false)}
        onAdd={onAddInterest}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Stage Column Component
// ═══════════════════════════════════════════════════════════════════════════

interface StageColumnProps {
  stage: typeof STAGES[0];
  interests: CollegeInterest[];
  isEditable: boolean;
  draggedItem: string | null;
  onDragStart: (id: string | null) => void;
  onDrop: (interestId: string, newStage: RecruitmentStage) => void;
  onSelectInterest: (interest: CollegeInterest) => void;
  onUpdateStage: (interestId: string, newStage: RecruitmentStage) => Promise<boolean>;
}

function StageColumn({
  stage,
  interests,
  isEditable,
  draggedItem,
  onDragStart,
  onDrop,
  onSelectInterest,
  onUpdateStage,
}: StageColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const Icon = stage.icon;

  return (
    <div
      className={cn(
        'rounded-2xl p-3 min-h-[300px] transition-all',
        glassCard,
        isOver && draggedItem && 'ring-2 ring-emerald-400 bg-emerald-50/50'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        if (draggedItem) {
          onDrop(draggedItem, stage.id);
        }
      }}
    >
      {/* Column Header (mobile) */}
      <div className="lg:hidden flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          `bg-gradient-to-br ${stage.gradient}`
        )}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-700">{stage.label}</span>
        <Badge variant="outline" className="ml-auto">{interests.length}</Badge>
      </div>
      {/* Cards */}
      <div className="space-y-2">
        <AnimatePresence>
          {interests.map((interest) => (
            <CollegeCard
              key={interest.id}
              interest={interest}
              isEditable={isEditable}
              onDragStart={() => onDragStart(interest.id)}
              onDragEnd={() => onDragStart(null)}
              onClick={() => onSelectInterest(interest)}
              onMoveStage={onUpdateStage}
              currentStage={stage.id}
            />
          })
        </AnimatePresence>
      {interests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-3 opacity-30',
              `bg-gradient-to-br ${stage.gradient}`
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-400">
              {isOver ? 'Drop here' : 'No schools yet'}
            </p>
          </div>
)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// College Card Component
// ═══════════════════════════════════════════════════════════════════════════

interface CollegeCardProps {
  interest: CollegeInterest;
  isEditable: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
  onMoveStage: (interestId: string, newStage: RecruitmentStage) => Promise<boolean>;
  currentStage: RecruitmentStage;
}

function CollegeCard({
  interest,
  isEditable,
  onDragStart,
  onDragEnd,
  onClick,
  onMoveStage,
  currentStage,
}: CollegeCardProps) {
  const { college, priority, events, status } = interest;
  const initials = college.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const recentEvent = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const upcomingEvents = events.filter(e => !e.isCompleted && new Date(e.date) > new Date()).length;

  return (
    <motion.div
      layout
      initial={ opacity: 0, y: 10 }
      animate={ opacity: 1, y: 0 }
      exit={ opacity: 0, scale: 0.9 }
      transition={{duration: 0.2 }}
      draggable={isEditable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'group rounded-xl p-3 cursor-pointer transition-all',
        glassCard,
        glassCardHover,
        isEditable && 'active:scale-[0.98]',
        status === 'declined' && 'opacity-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* College Logo */}
        <Avatar className="w-10 h-10 rounded-2xl ring-2 ring-white/50 shadow-xl">
          <AvatarImage src={college.logoUrl} className="rounded-2xl" />
          <AvatarFallback className="rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div>
              <h4 className="font-semibold text-slate-800 text-sm truncate leading-tight">
                {college.name}
              </h4>
              {college.division && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {college.division} • {college.conference}
                </p>
)}
            </div>
      {/* Priority Badge */}
            <Badge className={cn('text-[9px] px-1.5 py-0 h-4 flex-shrink-0', PRIORITY_COLORS[priority])}>
              {priority === 'dream' && <Heart className="w-2.5 h-2.5 mr-0.5" />}
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
          </div>
      {/* Recent Activity */}
          {recentEvent && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span className="truncate">{recentEvent.title}</span>
              <span>•</span>
              <span>{new Date(recentEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
)}
          {/* Upcoming indicator */}
          {upcomingEvents > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Badge className="text-[9px] py-0 h-4 bg-blue-100 text-blue-700 border-blue-200">
                <Calendar className="w-2.5 h-2.5 mr-0.5" />
                {upcomingEvents} upcoming
              </Badge>
            </div>
)}
        </div>
      {/* Quick Actions */}
        {isEditable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {STAGES.filter(s => s.id !== currentStage).map(stage => (
                <DropdownMenuItem
                  key={stage.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveStage(interest.id, stage.id);
                  }}
                  className="text-xs"
                >
                  <stage.icon className={cn('w-3.5 h-3.5 mr-2', stage.color)} />
                  Move to {stage.label}
                </DropdownMenuItem>
)}
            </DropdownMenuContent>
          </DropdownMenu>
)}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// College Detail Modal
// ═══════════════════════════════════════════════════════════════════════════

interface CollegeDetailModalProps {
  interest: CollegeInterest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (interest: CollegeInterest) => Promise<boolean>;
  onDelete: (interestId: string) => Promise<boolean>;
  onAddEvent: () => void;
  isEditable: boolean;
}

function CollegeDetailModal({
  interest,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAddEvent,
  isEditable,
}: CollegeDetailModalProps) {
  if (!interest) return null;

  const { college, events, priority, stage, contactName, contactEmail, notes } = interest;
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const stageInfo = STAGES.find(s => s.id === stage)!;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 rounded-xl ring-4 ring-white shadow-lg">
              <AvatarImage src={college.logoUrl} className="rounded-xl" />
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 text-white text-lg font-bold">
                {college.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl">{college.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {college.division} • {college.conference}
                {college.location && ` • ${college.location}`}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn('text-xs', PRIORITY_COLORS[priority])}>
                  {priority === 'dream' && <Heart className="w-3 h-3 mr-1" />}
                  {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                </Badge>
                <Badge variant="outline" className={cn('text-xs', stageInfo.color)}>
                  <stageInfo.icon className="w-3 h-3 mr-1" />
                  {stageInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>
      <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Contact Info */}
          {(contactName || contactEmail) && (
            <div className={cn('rounded-xl p-4', glassCard)}>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                Primary Contact
              </h4>
              <div className="space-y-2 text-sm">
                {contactName && (
                  <p className="text-slate-800 font-medium">{contactName}</p>
)}
                {contactEmail && (
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {contactEmail}
                    <ExternalLink className="w-3 h-3" />
                  </a>
)}
              </div>
            </div>
)}
          {/* Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Activity Timeline
              </h4>
              {isEditable && (
                <Button size="sm" variant="outline" onClick={onAddEvent} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Event
                </Button>
)}
            </div>
      {sortedEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No events recorded yet
              </div>
            ) : (
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                {sortedEvents.map((event, index) => {
                  const EventIcon = EVENT_TYPES.find(t => t.value === event.type)?.icon || Flag;
                  const isFirst = index === 0;
                  
                  return (
                    <div key={event.id} className="relative">
                      {/* Timeline dot */}
                      <div className={cn(
                        'absolute -left-[21px] w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center',
                        event.isCompleted 
                          ? 'border-emerald-500' 
                          : isFirst ? 'border-blue-500' : 'border-slate-300'
                      )}>
                        {event.isCompleted && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
      <div className={cn(
                        'ml-4 rounded-lg p-3 transition-colors',
                        isFirst ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'
                      )}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <EventIcon className={cn(
                              'w-4 h-4',
                              event.isCompleted ? 'text-emerald-500' : 'text-slate-400'
                            )} />
                            <span className="font-medium text-sm text-slate-800">{event.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-500 mt-1 ml-6">{event.description}</p>
)}
                      </div>
                    </div>
                  );
                })}
              </div>
)}
          </div>
      {/* Notes */}
          {notes && (
            <div className={cn('rounded-xl p-4', glassCard)}>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Notes
              </h4>
              <p className="text-sm text-slate-600">{notes}</p>
            </div>
)}
        </div>
      <DialogFooter className="flex-shrink-0 border-t pt-4">
          {isEditable && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                if (confirm('Remove this school from your list?')) {
                  const success = await onDelete(interest.id);
                  if (success) {
                    toast.success('School removed');
                    onClose();
                  }
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
)}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Add Event Modal
// ═══════════════════════════════════════════════════════════════════════════

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: Omit<RecruitmentEvent, 'id'>) => Promise<boolean>;
}

function AddEventModal({ isOpen, onClose, onAdd }: AddEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'email' as RecruitmentEvent['type'],
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isCompleted: false,
  });

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('Please enter a title');
      return;
    }
    setLoading(true);
    const success = await onAdd(form);
    setLoading(false);
    if (success) {
      setForm({
        type: 'email',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isCompleted: false,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>
            Record an interaction or upcoming event with this school.
          </DialogDescription>
        </DialogHeader>
      <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm(prev => ({ ...prev, type: value as any }})
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4 text-slate-400" />
                      {type.label}
                    </div>
                  </SelectItem>
)}
              </SelectContent>
            </Select>
          </div>
      <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="e.g., Initial recruiting email"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }})
            />
          </div>
      <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }})
            />
          </div>
      <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              rows={3}
              placeholder="Add any notes about this event..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }})
            />
          </div>
      <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCompleted"
              checked={form.isCompleted}
              onChange={(e) => setForm(prev => ({ ...prev, isCompleted: e.target.checked }})
              className="rounded"
            />
            <Label htmlFor="isCompleted" className="text-sm font-normal">
              Mark as completed
            </Label>
          </div>
        </div>
      <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Add College Modal
// ═══════════════════════════════════════════════════════════════════════════

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (interest: Omit<CollegeInterest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
}

function AddCollegeModal({ isOpen, onClose, onAdd }: AddCollegeModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    collegeName: '',
    division: '',
    conference: '',
    location: '',
    priority: 'medium' as CollegeInterest['priority'],
    stage: 'prospect' as RecruitmentStage,
    contactName: '',
    contactEmail: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!form.collegeName) {
      toast.error('Please enter a college name');
      return;
    }

    setLoading(true);
    const success = await onAdd({
      college: {
        id: crypto.randomUUID(),
        name: form.collegeName,
        division: form.division || undefined,
        conference: form.conference || undefined,
        location: form.location || undefined,
      },
      stage: form.stage,
      status: 'active',
      priority: form.priority,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      notes: form.notes || undefined,
      events: [],
    });
    setLoading(false);

    if (success) {
      toast.success('School added to your list');
      setForm({
        collegeName: '',
        division: '',
        conference: '',
        location: '',
        priority: 'medium',
        stage: 'prospect',
        contactName: '',
        contactEmail: '',
        notes: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add School</DialogTitle>
          <DialogDescription>
            Add a college to track in your recruitment journey.
          </DialogDescription>
        </DialogHeader>
      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>College Name *</Label>
              <Input
                placeholder="e.g., University of Texas"
                value={form.collegeName}
                onChange={(e) => setForm(prev => ({ ...prev, collegeName: e.target.value }})
              />
            </div>
      <div className="space-y-2">
              <Label>Division</Label>
              <Select
                value={form.division}
                onValueChange={(value) => setForm(prev => ({ ...prev, division: value }})
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NCAA Division I">NCAA Division I</SelectItem>
                  <SelectItem value="NCAA Division II">NCAA Division II</SelectItem>
                  <SelectItem value="NCAA Division III">NCAA Division III</SelectItem>
                  <SelectItem value="NAIA">NAIA</SelectItem>
                  <SelectItem value="JUCO">JUCO</SelectItem>
                </SelectContent>
              </Select>
            </div>
      <div className="space-y-2">
              <Label>Conference</Label>
              <Input
                placeholder="e.g., Big 12"
                value={form.conference}
                onChange={(e) => setForm(prev => ({ ...prev, conference: e.target.value }})
              />
            </div>
      <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="e.g., Austin, TX"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }})
              />
            </div>
      <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => setForm(prev => ({ ...prev, priority: value as any }})
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dream">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      Dream School
                    </div>
                  </SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
      <div className="col-span-2 space-y-2">
              <Label>Starting Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(value) => setForm(prev => ({ ...prev, stage: value as any }})
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <stage.icon className={cn('w-4 h-4', stage.color)} />
                        {stage.label}
                      </div>
                    </SelectItem>
)}
                </SelectContent>
              </Select>
            </div>
      <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input
                placeholder="Coach name"
                value={form.contactName}
                onChange={(e) => setForm(prev => ({ ...prev, contactName: e.target.value }})
              />
            </div>
      <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                placeholder="coach@university.edu"
                value={form.contactEmail}
                onChange={(e) => setForm(prev => ({ ...prev, contactEmail: e.target.value }})
              />
            </div>
      <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }})
              />
            </div>
          </div>
        </div>
      <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
            {loading ? 'Adding...' : 'Add School'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RecruitmentTimeline;

