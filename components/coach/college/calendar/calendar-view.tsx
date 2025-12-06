'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type CalendarEvent, type CalendarEventType } from '@/lib/queries/calendar';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDayClick: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const EVENT_COLORS: Record<CalendarEventType, { bg: string; dot: string; text: string }> = {
  camp: { bg: 'bg-emerald-100', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  evaluation: { bg: 'bg-blue-100', dot: 'bg-blue-500', text: 'text-blue-700' },
  visit: { bg: 'bg-purple-100', dot: 'bg-purple-500', text: 'text-purple-700' },
  other: { bg: 'bg-slate-100', dot: 'bg-slate-500', text: 'text-slate-700' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarView({ events, onDayClick, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: Date | null; dateStr: string; isToday: boolean; isCurrentMonth: boolean }[] = [];

    // Add padding for days before the first day of the month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Add days of the current month
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        isToday: dateStr === todayStr,
        isCurrentMonth: true,
      });
    }

    // Add padding for days after the last day of the month
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isToday: false,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const existing = map.get(event.date) || [];
      existing.push(event);
      map.set(event.date, existing);
    });
    return map;
  }, [events]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">
            {MONTHS[month]} {year}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={goToNextMonth}
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-slate-400 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayEvents = eventsByDate.get(day.dateStr) || [];
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div
              key={idx}
              className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 transition-colors cursor-pointer hover:bg-slate-50/50 ${
                !day.isCurrentMonth ? 'bg-slate-50/30' : ''
              } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              onClick={() => onDayClick(day.dateStr)}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full ${
                    day.isToday
                      ? 'bg-emerald-500 text-white'
                      : day.isCurrentMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {day.date?.getDate()}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{dayEvents.length - 3}</span>
                )}
              </div>

              {/* Events (max 3 visible) */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const colors = EVENT_COLORS[event.type];
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-all hover:shadow-sm ${colors.bg} ${colors.text}`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${colors.dot}`} />
                      {event.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4">
        <span className="text-xs text-slate-400">Event types:</span>
        {Object.entries(EVENT_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
            <span className="text-xs text-slate-500 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

