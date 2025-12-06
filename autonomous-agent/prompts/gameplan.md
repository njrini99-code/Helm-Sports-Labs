# ScoutPulse - Coach's Game Plan

## Vision

ScoutPulse is a premium baseball recruiting platform connecting players, coaches, and programs. The goal is to create an elite-quality application that rivals industry leaders like Perfect Game and NCSA.

---

## User Personas

### 1. College Coach
- **Primary Goal**: Find, evaluate, and recruit talented players
- **Key Features**: Discover recruits, Watchlist/Pipeline, Recruiting Planner, Calendar, Program Profile
- **Pain Points**: Information overload, manual tracking, disorganized communication

### 2. High School/Showcase Coach
- **Primary Goal**: Promote players, connect with college programs, manage team
- **Key Features**: Team roster, Player profiles, Communication, Camp management

### 3. JUCO Coach
- **Primary Goal**: Find transfers, promote program, track commitments
- **Key Features**: Transfer portal integration, Player search, Program visibility

### 4. Player
- **Primary Goal**: Get recruited, showcase skills, connect with programs
- **Key Features**: Profile, Stats, Videos, College Journey, Team Hub, Messages

---

## Priority Areas (Ranked)

### Priority 1: Core Player Experience
- [ ] Player Dashboard polish (hero, stats, journey)
- [ ] Player Profile public view
- [ ] Video upload and showcase
- [ ] Stats and measurables display
- [ ] College Interest tracking
- [ ] Messaging with coaches

### Priority 2: College Coach Workflow
- [x] Dashboard with analytics
- [x] Discover recruits with map
- [x] Watchlist/Pipeline management
- [x] Recruiting Planner with diamond
- [x] Calendar with events
- [x] Program profile page

### Priority 3: Communication System
- [ ] Real-time messaging
- [ ] Message threading
- [ ] Read receipts
- [ ] Push notifications (web)
- [ ] Email notifications

### Priority 4: Integration & Data
- [ ] Supabase real-time subscriptions
- [ ] Image/video upload to storage
- [ ] Player metrics tracking
- [ ] Analytics and engagement
- [ ] Export functionality

### Priority 5: Other Coach Types
- [ ] High School coach dashboard
- [ ] Showcase coach dashboard
- [ ] JUCO coach dashboard

---

## UI/UX Standards

### Design System
- **Theme**: Neo-glassmorphism with ScoutPulse green (#00C27A)
- **Background**: Light neutral (#F7F9FB) or deep emerald gradients
- **Cards**: Rounded (16-20px), soft shadows, glass effects
- **Typography**: Modern, clean, hierarchical
- **Icons**: Lucide icons only (no emojis)
- **Animations**: Subtle, purposeful, not distracting

### Component Library
- Use existing components in `/components/ui/`
- Glass components: GlassCard, GlassButton, GlassInput, GlassModal
- Consistent padding, margins, and spacing

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640), md (768), lg (1024), xl (1280)
- Stack layouts vertically on mobile

---

## Database Schema

### Core Tables
- `players` - Player profiles and data
- `coaches` - Coach profiles and program info
- `organizations` - Teams, schools, programs
- `messages` / `conversations` - Communication
- `recruit_watchlist` - Coach recruiting pipeline
- `player_metrics` - Stats and measurables
- `player_videos` - Video showcase
- `camp_events` - Camps and events
- `coach_calendar_events` - Coach calendar

### Key Relationships
- Players belong to organizations
- Coaches belong to programs
- Messages link players and coaches
- Watchlist entries link coaches to players

---

## Technical Requirements

### Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: React hooks, context, URL state
- **Forms**: React Hook Form (where applicable)

### Code Quality
- TypeScript strict mode
- Proper error handling with toasts
- Loading states for all async operations
- Optimistic UI updates where appropriate

### Performance
- Lazy loading for images/videos
- Pagination for lists
- Memoization for expensive computations
- Minimal re-renders

---

## Current Status

### Completed ✅
- College Coach Dashboard (premium redesign)
- College Coach Discover (map + filters)
- College Coach Watchlist (pipeline board)
- College Coach Recruiting Planner (diamond view)
- College Coach Calendar (events + modals)
- College Coach Program Profile (theme editor)
- Scout Card system (player/team quick views)
- Glass UI components

### In Progress 🔄
- Player Dashboard polish
- Player Profile public view
- Real-time messaging

### Not Started ❌
- High School coach dashboard
- Showcase coach dashboard
- JUCO coach dashboard
- Push notifications
- Export functionality

---

## Quality Gates

Before marking any improvement complete:

1. **Functionality**: Feature works end-to-end
2. **Visual**: Matches design system, no visual bugs
3. **Responsive**: Works on mobile and desktop
4. **Performance**: No lag, proper loading states
5. **Errors**: No console errors, proper error handling
6. **TypeScript**: No type errors
7. **Linting**: Passes eslint

---

## Notes

- Do NOT break existing authentication
- Do NOT modify database schema without migration
- Do NOT change URL structure without redirect
- ALWAYS preserve existing data fetching patterns
- ALWAYS use existing UI components where possible

