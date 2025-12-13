'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';

export interface CampCard {
  id: string;
  programName: string;
  campName: string;
  date: string;
  location: string;
  type: string;
  interested?: boolean;
  attending?: boolean;
}

interface DiscoverCampsProps {
  camps: CampCard[];
  onInterested?: (id: string) => void;
  onAttending?: (id: string) => void;
}

export function DiscoverCamps({ camps, onInterested, onAttending }: DiscoverCampsProps) {
  return (
    <Card className="bg-[#111315] border-white/5">
      <CardHeader>
        <CardTitle className="text-lg text-white">Camps & Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {camps.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            camps.map((camp) => (
          <div key={camp.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start justify-between gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <div>
              <p className="text-sm font-semibold text-white">{camp.campName}</p>
              <p className="text-xs text-slate-400">{camp.programName}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <span className="inline-flex items-center gap-1 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                  <Calendar className="w-3 h-3" /> {camp.date}
                </span>
                <span className="inline-flex items-center gap-1 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                  <MapPin className="w-3 h-3" /> {camp.location}
                </span>
                <Badge variant="outline" className="text-[10px]">{camp.type}</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant={camp.interested ? 'success' : 'outline'}
                onClick={() => onInterested?.(camp.id)}
              >
                {camp.interested ? 'Interested' : 'Mark Interested'}
              </Button>
              <Button
                size="sm"
                variant={camp.attending ? 'default' : 'outline'}
                onClick={() => onAttending?.(camp.id)}
              >
                {camp.attending ? 'Attending' : 'Attending?'}
              </Button>
            </div>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  );
}
