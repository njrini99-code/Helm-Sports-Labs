'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ClipboardCheck, 
  UserCheck, 
  Tent, 
  Cloud,
} from 'lucide-react';
import { type CalendarEventType } from '@/lib/queries/calendar';

interface QuickActionsPanelProps {
  onAddEvent: (preselectedType?: CalendarEventType) => void;
  onSyncGoogle: () => void;
}

export function QuickActionsPanel({ onAddEvent, onSyncGoogle }: QuickActionsPanelProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white/10 backdrop-blur-md border border-white/20 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
      </div>

      <div className="p-3 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-9 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
          onClick={() => onAddEvent('evaluation')}
        >
          <ClipboardCheck className="w-4 h-4" strokeWidth={2} />
          Schedule Player Evaluation
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-9 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
          onClick={() => onAddEvent('visit')}
        >
          <UserCheck className="w-4 h-4" strokeWidth={2} />
          Schedule Player Visit
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-9 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
          onClick={() => onAddEvent('camp')}
        >
          <Tent className="w-4 h-4" strokeWidth={2} />
          Create Camp Event
        </Button>

        <div className="pt-2 border-t border-slate-100 mt-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-xs text-slate-600 hover:text-slate-800"
            onClick={onSyncGoogle}
          >
            <Cloud className="w-4 h-4" strokeWidth={2} />
            Sync Google Calendar
          </Button>
        </div>
      </div>
    </Card>
  );
}

