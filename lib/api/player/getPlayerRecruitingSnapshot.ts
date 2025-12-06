import { createClient } from '@/lib/supabase/client';

export type RecruitingStatus = 'watching' | 'interested' | 'offered' | 'visited' | 'committed';

export interface RecruitingTimelineItem {
  id: string;
  date: string;
  school: string;
  status: RecruitingStatus;
  notes?: string | null;
}

export interface RecruitingSchool {
  id: string;
  name: string;
  conference?: string | null;
  status: RecruitingStatus;
  lastUpdated: string;
  notes?: string | null;
}

export interface PlayerRecruitingSnapshot {
  summary: {
    totalSchools: number;
    offers: number;
    visits: number;
    latestUpdate: string | null;
  } | null;
  timeline: RecruitingTimelineItem[];
  schools: RecruitingSchool[];
}

// Fetch recruiting interests from the database
export async function getPlayerRecruitingSnapshot(playerId: string): Promise<PlayerRecruitingSnapshot> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('recruiting_interests')
    .select('id, program_id, school_name, conference, division, status, interest_level, coach_name, notes, last_contact_at, updated_at')
    .eq('player_id', playerId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('getPlayerRecruitingSnapshot error', error);
    return { summary: null, timeline: [], schools: [] };
  }

  // Map status from DB to UI status
  const statusMap: Record<string, RecruitingStatus> = {
    'interested': 'watching',
    'contacted': 'interested',
    'questionnaire': 'interested',
    'unofficial_visit': 'visited',
    'official_visit': 'visited',
    'offer': 'offered',
    'verbal': 'committed',
    'signed': 'committed',
    'declined': 'watching',
  };

  const schools: RecruitingSchool[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.school_name || 'Program',
    conference: row.conference || null,
    status: statusMap[row.status] || 'watching',
    lastUpdated: row.updated_at,
    notes: row.notes,
  }));

  const timeline: RecruitingTimelineItem[] = (data || []).map((row: any) => ({
    id: row.id,
    date: row.last_contact_at || row.updated_at,
    school: row.school_name || 'Program',
    status: statusMap[row.status] || 'watching',
    notes: row.notes,
  }));

  return {
    summary: {
      totalSchools: schools.length,
      offers: schools.filter((s) => s.status === 'offered' || s.status === 'committed').length,
      visits: schools.filter((s) => s.status === 'visited').length,
      latestUpdate: timeline[0]?.date || null,
    },
    timeline: timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    schools,
  };
}
