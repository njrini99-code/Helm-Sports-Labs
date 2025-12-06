export interface Organization {
  id: string;
  name: string;
  type: 'high_school' | 'showcase_org' | 'juco' | 'college' | 'travel_ball';
  location_city: string | null;
  location_state: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  description: string | null;
  conference: string | null;
  division: string | null;
  created_at: string;
  updated_at: string;
}

// High school-specific alias for HS coach dashboards
export type HighSchoolOrganization = Organization & {
  type: 'high_school';
};
