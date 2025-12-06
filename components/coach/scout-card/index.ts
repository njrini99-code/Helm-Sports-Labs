// Scout Card Components
// Right-side drawer panels for viewing player and team details from coach perspective

export { 
  ScoutCardShell, 
  ScoutCardSection, 
  ScoutCardActions,
  ScoutCardMetricTile,
  ScoutCardInfoRow,
  ScoutCardStatusPill,
  type ScoutCardShellProps,
} from './scout-card-shell';

export { 
  PlayerScoutCard, 
  type PlayerScoutCardData,
} from './player-scout-card';

export { 
  TeamScoutCard, 
  type TeamScoutCardData,
  type TeamType,
} from './team-scout-card';

// Legacy exports for backwards compatibility
export { TeamScoutCard as HighSchoolScoutCard } from './team-scout-card';
export { TeamScoutCard as ShowcaseScoutCard } from './team-scout-card';
export type { TeamScoutCardData as HighSchoolScoutCardData } from './team-scout-card';
export type { TeamScoutCardData as ShowcaseScoutCardData } from './team-scout-card';
