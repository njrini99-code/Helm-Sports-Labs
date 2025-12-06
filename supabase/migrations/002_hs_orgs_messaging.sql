-- Adds high school org, events, messaging, and player settings/recruiting tables
-- Safe to run if tables do not yet exist

-- Organizations (generic) and memberships
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('high_school','showcase_org','juco','college','travel_ball')),
  location_city text,
  location_state text,
  logo_url text,
  banner_url text,
  website_url text,
  description text,
  conference text,
  division text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  role text,
  created_at timestamptz default now() not null
);

-- Add org_id to teams if missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'teams' and column_name = 'org_id') then
    alter table teams add column org_id uuid references organizations(id);
  end if;
end $$;

-- Events + participants for schedules
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  type text not null default 'game',
  start_time timestamptz not null,
  end_time timestamptz,
  location_city text,
  location_state text,
  location_venue text,
  level text,
  opponent_name text,
  is_home_game boolean,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists event_team_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade not null,
  result text check (result in ('win','loss','tie')),
  score_for integer,
  score_against integer,
  created_at timestamptz default now() not null
);

-- Player settings
create table if not exists player_settings (
  player_id uuid primary key references players(id) on delete cascade,
  is_discoverable boolean default true,
  show_gpa boolean default true,
  notify_on_eval boolean default true,
  notify_on_interest boolean default true,
  updated_at timestamptz default now() not null
);

-- Recruiting interests (player to college programs)
create table if not exists recruiting_interests (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade not null,
  college_program_id uuid references organizations(id),
  status text check (status in ('watching','interested','offered','visited','committed')) default 'watching',
  notes text,
  updated_at timestamptz default now() not null
);

-- Messaging tables
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  type text not null check (type in ('direct','group','team','broadcast')),
  title text,
  created_by uuid references profiles(id),
  created_at timestamptz default now() not null
);

create table if not exists conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  role text,
  joined_at timestamptz default now() not null
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_profile_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null,
  read_by_profile_ids uuid[] default '{}'::uuid[]
);

-- Basic RLS enablement
alter table organizations enable row level security;
alter table organization_memberships enable row level security;
alter table events enable row level security;
alter table event_team_participants enable row level security;
alter table player_settings enable row level security;
alter table recruiting_interests enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;

-- Policies (coarse; refine as needed)
-- Organizations readable by authenticated
create policy if not exists "orgs_read" on organizations for select to authenticated using (true);
-- Memberships: member can read
create policy if not exists "org_memberships_read" on organization_memberships for select to authenticated using (profile_id = auth.uid());
-- Events: org members can manage
create policy if not exists "events_manage" on events for all to authenticated using (
  exists (select 1 from organization_memberships om where om.organization_id = events.org_id and om.profile_id = auth.uid())
);
create policy if not exists "event_participants_manage" on event_team_participants for all to authenticated using (
  exists (
    select 1
    from events e
    join organization_memberships om on om.organization_id = e.org_id
    where e.id = event_team_participants.event_id and om.profile_id = auth.uid()
  )
);
-- Player settings: owner can manage
create policy if not exists "player_settings_manage" on player_settings for all to authenticated using (
  exists (select 1 from players p where p.id = player_settings.player_id and p.user_id = auth.uid())
);
-- Recruiting interests: player owner can manage; coaches can read
create policy if not exists "recruiting_interests_read_coaches" on recruiting_interests for select to authenticated using (
  exists (select 1 from coaches c where c.user_id = auth.uid())
);
create policy if not exists "recruiting_interests_manage_player" on recruiting_interests for all to authenticated using (
  exists (select 1 from players p where p.id = recruiting_interests.player_id and p.user_id = auth.uid())
);
-- Conversations: participants can read/write
create policy if not exists "conversations_read" on conversations for select to authenticated using (
  exists (select 1 from conversation_participants cp where cp.conversation_id = conversations.id and cp.profile_id = auth.uid())
);
create policy if not exists "conversations_write_creator" on conversations for insert to authenticated with check (created_by = auth.uid());
create policy if not exists "conversation_participants_manage" on conversation_participants for all to authenticated using (
  exists (select 1 from conversations c join conversation_participants cp on cp.conversation_id = c.id where c.id = conversation_participants.conversation_id and cp.profile_id = auth.uid())
);
create policy if not exists "messages_manage" on messages for all to authenticated using (
  exists (select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid())
);
