export interface Profile {
  id: string;
  role: 'player' | 'coach' | 'admin' | string;
  full_name: string;
  avatar_url: string | null;
  current_org_id: string | null;
}
