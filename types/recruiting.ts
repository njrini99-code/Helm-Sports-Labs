export interface RecruitingInterest {
  id: string;
  player_id: string;
  program_id: string | null;
  school_name: string;
  conference: string | null;
  division: string | null;
  status: 'interested' | 'contacted' | 'questionnaire' | 'unofficial_visit' | 'official_visit' | 'offer' | 'verbal' | 'signed';
  interest_level: 'low' | 'medium' | 'high' | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecruitingSnapshot {
  summary: {
    totalSchools: number;
    offers: number;
    visits: number;
    latestUpdate: string | null;
  };
  timeline: Array<{
    id: string;
    schoolName: string;
    status: string;
    date: string;
  }>;
  schools: Array<{
    id: string;
    name: string;
    conference: string | null;
    division: string | null;
    status: string;
    interestLevel: string | null;
  }>;
}

