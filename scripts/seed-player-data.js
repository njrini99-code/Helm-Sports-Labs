/**
 * Seed Player Dashboard Data
 * Populates organizations, events, player_stats, evaluations, player_settings
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample organizations
const organizations = [
  { name: 'Greensboro High School', type: 'high_school', location_city: 'Greensboro', location_state: 'NC' },
  { name: 'Central High School', type: 'high_school', location_city: 'Houston', location_state: 'TX' },
  { name: 'Lakewood High School', type: 'high_school', location_city: 'Orlando', location_state: 'FL' },
  { name: 'Southeast Elite', type: 'showcase_org', location_city: 'Atlanta', location_state: 'GA' },
  { name: 'Texas Prime', type: 'showcase_org', location_city: 'Dallas', location_state: 'TX' },
  { name: 'Perfect Game', type: 'showcase_org', location_city: 'Cedar Rapids', location_state: 'IA' },
  { name: 'East Coast Sox', type: 'travel_ball', location_city: 'Birmingham', location_state: 'AL' },
  { name: 'San Jacinto College', type: 'juco', location_city: 'Houston', location_state: 'TX', conference: 'NJCAA Region XIV' },
  { name: 'Coastal Carolina', type: 'college', location_city: 'Conway', location_state: 'SC', conference: 'Sun Belt', division: 'D1' },
  { name: 'UNC Greensboro', type: 'college', location_city: 'Greensboro', location_state: 'NC', conference: 'SoCon', division: 'D1' },
  { name: 'Elon University', type: 'college', location_city: 'Elon', location_state: 'NC', conference: 'CAA', division: 'D1' },
];

async function seed() {
  console.log('🌱 Seeding player dashboard data...\n');

  // 1. Create organizations
  console.log('📍 Creating organizations...');
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .upsert(organizations, { onConflict: 'name', ignoreDuplicates: true })
    .select();
  
  if (orgError) {
    console.log('   ⚠️ Organizations might already exist:', orgError.message);
  } else {
    console.log(`   ✓ Created/updated ${orgs?.length || 0} organizations`);
  }

  // Get all organizations for reference
  const { data: allOrgs } = await supabase.from('organizations').select('*');
  const orgMap = new Map((allOrgs || []).map(o => [o.name, o]));
  
  // Get showcase orgs
  const showcaseOrgs = (allOrgs || []).filter(o => o.type === 'showcase_org' || o.type === 'travel_ball');
  const hsOrgs = (allOrgs || []).filter(o => o.type === 'high_school');

  // 2. Get players to seed data for
  const { data: players } = await supabase
    .from('players')
    .select('id, user_id, first_name, last_name, high_school_name, high_school_city, high_school_state, primary_position')
    .eq('onboarding_completed', true)
    .limit(20);

  if (!players || players.length === 0) {
    console.log('   ⚠️ No players found to seed data for');
    return;
  }

  console.log(`   Found ${players.length} players to seed data for`);

  // 3. Link players to high school organizations
  console.log('\n🏫 Linking players to high school organizations...');
  let linkedCount = 0;
  for (const player of players) {
    // Find matching HS org or create one
    let hsOrg = hsOrgs.find(o => 
      o.name === player.high_school_name || 
      o.location_state === player.high_school_state
    );
    
    if (!hsOrg && player.high_school_name) {
      // Create HS org
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert({
          name: player.high_school_name,
          type: 'high_school',
          location_city: player.high_school_city,
          location_state: player.high_school_state,
        })
        .select()
        .single();
      hsOrg = newOrg;
    }

    if (hsOrg) {
      await supabase
        .from('players')
        .update({ high_school_org_id: hsOrg.id })
        .eq('id', player.id);
      linkedCount++;
    }
  }
  console.log(`   ✓ Linked ${linkedCount} players to HS organizations`);

  // 4. Create events
  console.log('\n📅 Creating events...');
  const events = [];
  const now = new Date();
  
  // High school games
  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    const hsOrg = hsOrgs[i % hsOrgs.length] || hsOrgs[0];
    
    if (hsOrg) {
      events.push({
        org_id: hsOrg.id,
        name: `${hsOrg.name} vs ${['Central', 'North', 'South', 'East', 'West'][i % 5]} HS`,
        type: 'game',
        start_time: date.toISOString(),
        location_city: hsOrg.location_city,
        location_state: hsOrg.location_state,
        level: 'Varsity',
        is_public: true,
      });
    }
  }

  // Showcase events
  for (const showcaseOrg of showcaseOrgs) {
    const eventTypes = ['showcase', 'tournament', 'camp'];
    for (const eventType of eventTypes) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      
      events.push({
        org_id: showcaseOrg.id,
        name: `${showcaseOrg.name} ${eventType === 'showcase' ? 'Elite Showcase' : eventType === 'tournament' ? 'Classic Tournament' : 'Prospect Camp'}`,
        type: eventType,
        start_time: date.toISOString(),
        location_city: showcaseOrg.location_city,
        location_state: showcaseOrg.location_state,
        level: '17U',
        is_public: true,
      });
    }
  }

  const { data: createdEvents, error: eventError } = await supabase
    .from('events')
    .insert(events)
    .select();

  if (eventError) {
    console.log('   ⚠️ Events error:', eventError.message);
  } else {
    console.log(`   ✓ Created ${createdEvents?.length || 0} events`);
  }

  // Get all events
  const { data: allEvents } = await supabase.from('events').select('*');

  // 5. Create player stats
  console.log('\n📊 Creating player stats...');
  const stats = [];
  
  for (const player of players) {
    // Create 3-8 stat entries per player
    const numStats = 3 + Math.floor(Math.random() * 6);
    const playerEvents = (allEvents || []).slice(0, numStats);
    
    for (const event of playerEvents) {
      const isPitcher = player.primary_position?.toLowerCase().includes('pitcher');
      
      stats.push({
        player_id: player.id,
        event_id: event.id,
        // Hitting stats
        at_bats: isPitcher ? Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3),
        hits: isPitcher ? Math.floor(Math.random() * 1) : Math.floor(Math.random() * 3),
        doubles: Math.floor(Math.random() * 2),
        home_runs: Math.floor(Math.random() * 2),
        rbis: Math.floor(Math.random() * 4),
        runs: Math.floor(Math.random() * 3),
        stolen_bases: Math.floor(Math.random() * 2),
        walks: Math.floor(Math.random() * 2),
        strikeouts: Math.floor(Math.random() * 3),
        // Pitching stats (for pitchers)
        innings_pitched: isPitcher ? 3 + Math.floor(Math.random() * 5) : null,
        strikeouts_pitched: isPitcher ? 3 + Math.floor(Math.random() * 8) : null,
        walks_allowed: isPitcher ? Math.floor(Math.random() * 3) : null,
        hits_allowed: isPitcher ? Math.floor(Math.random() * 5) : null,
        earned_runs: isPitcher ? Math.floor(Math.random() * 3) : null,
        source: 'manual',
      });
    }
  }

  const { data: createdStats, error: statsError } = await supabase
    .from('player_stats')
    .insert(stats)
    .select();

  if (statsError) {
    console.log('   ⚠️ Stats error:', statsError.message);
  } else {
    console.log(`   ✓ Created ${createdStats?.length || 0} stat entries`);
  }

  // 6. Create evaluations
  console.log('\n📝 Creating evaluations...');
  const evaluations = [];
  const showcaseEvents = (allEvents || []).filter(e => e.type === 'showcase' || e.type === 'tournament');
  
  for (const player of players.slice(0, 10)) {
    const event = showcaseEvents[Math.floor(Math.random() * showcaseEvents.length)];
    if (!event) continue;
    
    const tags = [
      ['High motor', 'Good arm', 'Fast twitch'],
      ['Smooth swing', 'Power hitter', 'Patient'],
      ['Glove wizard', 'Quick feet', 'Strong arm'],
      ['Leader', 'Coachable', 'High baseball IQ'],
    ][Math.floor(Math.random() * 4)];
    
    evaluations.push({
      player_id: player.id,
      event_id: event.id,
      evaluator_name: ['Coach Smith', 'Scout Johnson', 'Coach Williams', 'Scout Davis'][Math.floor(Math.random() * 4)],
      overall_grade: 70 + Math.floor(Math.random() * 25),
      arm_grade: 60 + Math.floor(Math.random() * 30),
      bat_grade: 60 + Math.floor(Math.random() * 30),
      speed_grade: 55 + Math.floor(Math.random() * 35),
      fielding_grade: 60 + Math.floor(Math.random() * 30),
      baseball_iq_grade: 65 + Math.floor(Math.random() * 30),
      tags,
      notes: 'Shows potential at the next level. Needs to continue developing consistency.',
      is_public: true,
    });
  }

  const { data: createdEvals, error: evalError } = await supabase
    .from('evaluations')
    .insert(evaluations)
    .select();

  if (evalError) {
    console.log('   ⚠️ Evaluations error:', evalError.message);
  } else {
    console.log(`   ✓ Created ${createdEvals?.length || 0} evaluations`);
  }

  // 7. Create player settings
  console.log('\n⚙️ Creating player settings...');
  const settings = players.map(p => ({
    player_id: p.id,
    is_discoverable: true,
    show_gpa: Math.random() > 0.5,
    show_test_scores: Math.random() > 0.7,
    show_contact_info: Math.random() > 0.5,
    notify_on_eval: true,
    notify_on_interest: true,
    notify_on_message: true,
    notify_on_watchlist_add: true,
  }));

  const { error: settingsError } = await supabase
    .from('player_settings')
    .upsert(settings, { onConflict: 'player_id' });

  if (settingsError) {
    console.log('   ⚠️ Settings error:', settingsError.message);
  } else {
    console.log(`   ✓ Created settings for ${settings.length} players`);
  }

  // 8. Create recruiting interests
  console.log('\n🎓 Creating recruiting interests...');
  const collegeOrgs = (allOrgs || []).filter(o => o.type === 'college');
  const interests = [];
  const statuses = ['interested', 'contacted', 'questionnaire', 'unofficial_visit', 'offer'];
  
  for (const player of players.slice(0, 8)) {
    // Each player has 2-4 interested colleges
    const numInterests = 2 + Math.floor(Math.random() * 3);
    const shuffledColleges = [...collegeOrgs].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numInterests && i < shuffledColleges.length; i++) {
      const college = shuffledColleges[i];
      interests.push({
        player_id: player.id,
        school_name: college.name,
        conference: college.conference,
        division: college.division,
        status: statuses[Math.min(i, statuses.length - 1)],
        interest_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        notes: i === 0 ? 'Primary target school' : null,
      });
    }
  }

  const { error: interestError } = await supabase
    .from('recruiting_interests')
    .insert(interests);

  if (interestError) {
    console.log('   ⚠️ Recruiting interests error:', interestError.message);
  } else {
    console.log(`   ✓ Created ${interests.length} recruiting interests`);
  }

  console.log('\n✅ Player dashboard seeding complete!');
}

seed().catch(console.error);

