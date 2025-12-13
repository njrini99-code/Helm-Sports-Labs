# Dashboard Components

This directory contains reusable dashboard components created in Phase 3 refactoring.

## Components

### ActivityFeed

**Location**: `components/dashboard/ActivityFeed.tsx`

A comprehensive, reusable activity feed component for displaying recent user interactions across all dashboards.

#### Features
- 9 activity types with unique icons and colors
- Loading skeleton states
- Empty state with helpful messaging
- Actor avatars with fallbacks
- Time formatting (relative time with date-fns)
- Dark/light theme support
- Metadata badges
- Click handlers for navigation
- Fully typed with TypeScript

#### Activity Types
- `player_view` - Player viewed profile
- `profile_view` - Profile view event
- `college_follow` - College followed
- `offer_made` - Offer extended
- `message_sent` - Message sent
- `message_received` - Message received
- `player_added` - Player added to team
- `achievement` - Achievement unlocked
- `custom` - Custom activity

#### Usage

```typescript
import ActivityFeed from '@/components/dashboard/ActivityFeed';

const activities = [
  {
    id: '1',
    type: 'player_view',
    title: 'John Doe viewed your profile',
    description: 'SS • Class of 2025 • California',
    created_at: '2025-12-13T10:30:00Z',
    actor: {
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg'
    }
  },
  // ... more activities
];

<ActivityFeed
  items={activities}
  loading={false}
  title="Recent Activity"
  maxItems={10}
  isDark={true}
  onItemClick={(item) => console.log('Clicked:', item)}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `ActivityItem[]` | Yes | - | Array of activity items to display |
| `loading` | `boolean` | No | `false` | Show loading skeleton |
| `title` | `string` | No | `'Recent Activity'` | Feed title |
| `maxItems` | `number` | No | `10` | Maximum items to display |
| `isDark` | `boolean` | No | `true` | Use dark theme styling |
| `onItemClick` | `(item: ActivityItem) => void` | No | - | Click handler for items |

#### ActivityItem Interface

```typescript
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  created_at: string; // ISO datetime
  actor?: {
    name?: string;
    avatar?: string | null;
  };
  metadata?: Record<string, string> | null;
}
```

---

### RosterList

**Location**: `components/dashboard/RosterList.tsx`

A searchable, configurable roster list component for displaying team rosters across all dashboards.

#### Features
- Real-time search (name, position, jersey, state)
- useMemo optimization for search performance
- Loading skeleton states (6 shimmer rows)
- Empty state with "Add Players" CTA
- Configurable display options
- Player click handlers for navigation
- Responsive design
- Avatar support with fallbacks
- Jersey numbers, grad year, state display

#### Usage

```typescript
import RosterList from '@/components/dashboard/RosterList';

const players = [
  {
    id: '1',
    full_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
    primary_position: 'SS',
    grad_year: 2025,
    jersey_number: 12,
    high_school_state: 'CA'
  },
  // ... more players
];

<RosterList
  players={players}
  loading={false}
  searchable={true}
  maxPlayers={6}
  viewAllLink="/roster"
  addPlayerLink="/roster/add"
  onPlayerClick={(playerId) => console.log('Clicked:', playerId)}
  showJersey={true}
  showGradYear={true}
  showState={true}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `players` | `RosterPlayer[]` | Yes | - | Array of players to display |
| `loading` | `boolean` | No | `false` | Show loading skeleton |
| `searchable` | `boolean` | No | `false` | Enable search functionality |
| `maxPlayers` | `number` | No | `6` | Maximum players to display before "View All" |
| `viewAllLink` | `string` | No | - | Link for "View All" button |
| `addPlayerLink` | `string` | No | - | Link for "Add Players" button (empty state) |
| `onPlayerClick` | `(playerId: string) => void` | No | - | Click handler for player rows |
| `showJersey` | `boolean` | No | `false` | Display jersey numbers |
| `showGradYear` | `boolean` | No | `true` | Display graduation year |
| `showState` | `boolean` | No | `true` | Display state |

#### RosterPlayer Interface

```typescript
export interface RosterPlayer {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  primary_position?: string | null;
  grad_year?: number | null;
  jersey_number?: number | null;
  high_school_state?: string | null;
}
```

---

### DashboardStatCard

**Location**: `components/dashboard/DashboardStatCard.tsx`

Reusable stat cards with trend indicators and 6 color themes (created in Phase 2).

#### Usage

```typescript
import { DashboardStatCard, DashboardStatsGrid } from '@/components/dashboard';
import { Users } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: 245,
    label: 'Total Players',
    trend: { direction: 'up', value: 12 },
    color: 'emerald'
  },
  // ... more stats
];

<DashboardStatsGrid stats={stats} columns={4} />
```

---

## Best Practices

### 1. Use These Components Across All Dashboards
These components are designed to work across College Coach, High School Coach, JUCO Coach, and Player dashboards. Always use these instead of creating custom implementations.

### 2. Type Safety
All components are fully typed with TypeScript. Import the interfaces for proper type checking:

```typescript
import ActivityFeed, { type ActivityItem } from '@/components/dashboard/ActivityFeed';
import RosterList, { type RosterPlayer } from '@/components/dashboard/RosterList';
```

### 3. Loading States
Always pass the `loading` prop when data is being fetched:

```typescript
const [activities, setActivities] = useState<ActivityItem[]>([]);
const [loading, setLoading] = useState(true);

<ActivityFeed items={activities} loading={loading} />
```

### 4. Empty States
Components handle empty states automatically, but you can customize with links:

```typescript
<RosterList
  players={[]}
  loading={false}
  addPlayerLink="/roster/add"  // Shows "Add Players" button when empty
/>
```

### 5. Dark/Light Theme
Components respect theme context but ActivityFeed allows override:

```typescript
<ActivityFeed items={activities} isDark={false} />  // Force light theme
```

## Migration Guide

### Replacing Old Activity Feed Code

**Before** (custom implementation):
```typescript
<div className="space-y-2">
  {activities.map(activity => (
    <div key={activity.id} className="flex items-center gap-3 p-3">
      {/* Custom activity rendering */}
    </div>
  ))}
</div>
```

**After** (reusable component):
```typescript
import ActivityFeed from '@/components/dashboard/ActivityFeed';

<ActivityFeed items={activities} loading={loading} />
```

### Replacing Old Roster Code

**Before** (custom implementation):
```typescript
<div className="grid gap-2">
  {players.map(player => (
    <div key={player.id} className="flex items-center gap-3">
      {/* Custom player rendering */}
    </div>
  ))}
</div>
```

**After** (reusable component):
```typescript
import RosterList from '@/components/dashboard/RosterList';

<RosterList
  players={players}
  loading={loading}
  searchable={true}
  onPlayerClick={(id) => router.push(`/player/${id}`)}
/>
```

## Related Documentation

- **Phase 3 Documentation**: `REFACTORING_PHASE3_COMPLETE.md`
- **Zod Schemas**: `lib/schemas/dashboard.ts`
- **Type Definitions**: All types are exported from component files
- **E2E Tests**: `e2e/dashboard-navigation.spec.ts`

## Contributing

When adding new dashboard functionality:

1. Check if existing components can be extended
2. Add new props instead of creating new components
3. Update TypeScript interfaces
4. Add E2E tests for new features
5. Update this README

## Support

For questions or issues:
- Review `REFACTORING_PHASE3_COMPLETE.md` for implementation details
- Check E2E tests for usage examples
- Refer to Zod schemas for data validation
