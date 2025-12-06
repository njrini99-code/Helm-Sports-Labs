# ScoutPulse

A modern, hyper-personalized platform connecting baseball players and coaches for recruiting and team management.

## Features

### For Players
- **Personalized Profile** - Showcase grad year, stats, videos, achievements, and goals
- **Video Library** - Upload game highlights and training clips
- **College Matching** - Find programs that fit your goals
- **Exposure Insights** - See which programs viewed your profile

### For Coaches

#### 4-Year College Coaches
- **Discover Players** - Interactive search with filters by state, position, grad year
- **Watchlist Management** - Track recruits, add notes, manage pipeline
- **Program Profile** - Showcase facilities, culture, and what you look for
- **Camp Management** - Create events and track interested players

#### JUCO Coaches
- **Roster Management** - Track player development
- **Player Placement** - Promote players to 4-year programs
- **Team Communication** - Messaging hub for players and parents

#### High School & Showcase Coaches
- **Roster Management** - Manage team rosters
- **Schedule Events** - Games, practices, and tournaments
- **Team Messaging** - Communicate with players and families

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scoutpulse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the database migrations:
- Go to your Supabase project's SQL Editor
- Run the SQL from `supabase/migrations/001_initial_schema.sql`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
scoutpulse/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── coach/             # Coach dashboard & pages
│   ├── onboarding/        # Onboarding flows
│   └── player/            # Player dashboard & pages
├── components/            # Reusable components
│   └── ui/               # UI primitives
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
│   ├── supabase/         # Supabase client setup
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── supabase/
    └── migrations/       # Database migrations
```

## Design System

ScoutPulse uses a dark, premium aesthetic:

- **Background**: Slate 950 (#020617)
- **Primary**: Blue 500 (#3B82F6)
- **Success**: Emerald 500 (#10B981)
- **Border Radius**: 12-16px
- **Animations**: Subtle fade-ins and micro-interactions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

