// Development mode utilities
// Bypasses Supabase auth for local development

export function isDevMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('dev_mode') === 'true';
}

export function getDevRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dev_role');
}

export function clearDevMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('dev_mode');
  localStorage.removeItem('dev_role');
}

// User IDs for development (maps to auth.users.id)
export const DEV_USER_IDS = {
  player: '0d4e6731-1f97-4e97-877c-066c56659861', // Noah Garcia - sample player
  college: 'd266db51-afa3-4b0f-9d81-efeafb0b42b1', // Nicholas Rini - coach
  'high-school': 'd266db51-afa3-4b0f-9d81-efeafb0b42b1',
  showcase: 'd266db51-afa3-4b0f-9d81-efeafb0b42b1',
  juco: 'd266db51-afa3-4b0f-9d81-efeafb0b42b1',
};

// Direct entity IDs for development (maps to players.id or coaches.id)
export const DEV_ENTITY_IDS = {
  player: '7ee8e59c-8e6a-44f4-a5b0-0308d5aee9b4', // Noah Garcia player record
  coach: '298e357a-eace-45ac-8c60-6d41669e2953', // Nicholas Rini coach record
};

// Get mock user for dev mode
export function getDevUser() {
  const role = getDevRole();
  if (!role) return null;
  
  return {
    id: DEV_USER_IDS[role as keyof typeof DEV_USER_IDS] || DEV_USER_IDS.player,
    email: 'dev@helm-sports-labs.com',
    role,
  };
}

