/**
 * Helm Sports Labs Seed Data Script
 * 
 * This script populates the database with sample data for testing.
 * 
 * Usage:
 *   node scripts/seed-data.js
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - Database migration must be run first
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Use service role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample data
const samplePlayers = [
  // Texas players
  { first_name: 'Jake', last_name: 'Martinez', grad_year: 2026, high_school_name: 'Central High School', high_school_city: 'Austin', high_school_state: 'TX', primary_position: 'Pitcher', secondary_position: 'First Base', throws: 'R', bats: 'R', height_feet: 6, height_inches: 2, weight_lbs: 185, primary_goal: 'Play D1 Baseball', about_me: 'Hard-working pitcher with a passion for the game.' },
  { first_name: 'Marcus', last_name: 'Johnson', grad_year: 2025, high_school_name: 'Westfield High', high_school_city: 'Houston', high_school_state: 'TX', primary_position: 'Shortstop', secondary_position: 'Second Base', throws: 'R', bats: 'R', height_feet: 5, height_inches: 11, weight_lbs: 170, primary_goal: 'Play D1 Baseball', about_me: 'Versatile infielder with strong defensive skills.' },
  { first_name: 'Tyler', last_name: 'Williams', grad_year: 2027, high_school_name: 'South High School', high_school_city: 'Dallas', high_school_state: 'TX', primary_position: 'Catcher', secondary_position: 'Third Base', throws: 'R', bats: 'R', height_feet: 5, height_inches: 10, weight_lbs: 195, primary_goal: 'Get playing time', about_me: 'Dedicated catcher with strong arm.' },
  { first_name: 'Ryan', last_name: 'Davis', grad_year: 2026, high_school_name: 'North High School', high_school_city: 'San Antonio', high_school_state: 'TX', primary_position: 'Center Field', secondary_position: 'Left Field', throws: 'R', bats: 'L', height_feet: 6, height_inches: 0, weight_lbs: 180, primary_goal: 'Win a championship', about_me: 'Fast outfielder with excellent range.' },
  // California players
  { first_name: 'Brandon', last_name: 'Chen', grad_year: 2025, high_school_name: 'Mater Dei High', high_school_city: 'Santa Ana', high_school_state: 'CA', primary_position: 'Pitcher', secondary_position: null, throws: 'R', bats: 'R', height_feet: 6, height_inches: 3, weight_lbs: 195, primary_goal: 'Play D1 Baseball', about_me: 'Power pitcher with high velocity.' },
  { first_name: 'Kevin', last_name: 'Park', grad_year: 2026, high_school_name: 'JSerra High', high_school_city: 'San Juan Capistrano', high_school_state: 'CA', primary_position: 'Shortstop', secondary_position: 'Third Base', throws: 'R', bats: 'R', height_feet: 6, height_inches: 0, weight_lbs: 175, primary_goal: 'Play D1 Baseball', about_me: 'Dynamic shortstop with plus arm.' },
  { first_name: 'Daniel', last_name: 'Nguyen', grad_year: 2027, high_school_name: 'Harvard-Westlake', high_school_city: 'Studio City', high_school_state: 'CA', primary_position: 'Catcher', secondary_position: null, throws: 'R', bats: 'R', height_feet: 5, height_inches: 11, weight_lbs: 190, primary_goal: 'Play D1 Baseball', about_me: 'Elite receiver with quick pop time.' },
  // Florida players
  { first_name: 'Jayden', last_name: 'Robinson', grad_year: 2025, high_school_name: 'IMG Academy', high_school_city: 'Bradenton', high_school_state: 'FL', primary_position: 'Pitcher', secondary_position: 'First Base', throws: 'L', bats: 'L', height_feet: 6, height_inches: 4, weight_lbs: 210, primary_goal: 'Play D1 Baseball', about_me: 'Left-handed power pitcher.' },
  { first_name: 'Chris', last_name: 'Thompson', grad_year: 2026, high_school_name: 'American Heritage', high_school_city: 'Plantation', high_school_state: 'FL', primary_position: 'Center Field', secondary_position: 'Right Field', throws: 'R', bats: 'R', height_feet: 6, height_inches: 1, weight_lbs: 185, primary_goal: 'Play D1 Baseball', about_me: 'Five-tool outfielder with speed.' },
  { first_name: 'Mike', last_name: 'Sullivan', grad_year: 2027, high_school_name: 'Jesuit High', high_school_city: 'Tampa', high_school_state: 'FL', primary_position: 'Second Base', secondary_position: 'Shortstop', throws: 'R', bats: 'S', height_feet: 5, height_inches: 10, weight_lbs: 165, primary_goal: 'Play D1 Baseball', about_me: 'Quick hands, great range.' },
  // Georgia players
  { first_name: 'Damon', last_name: 'Wright', grad_year: 2025, high_school_name: 'Parkview High', high_school_city: 'Lilburn', high_school_state: 'GA', primary_position: 'First Base', secondary_position: 'Third Base', throws: 'L', bats: 'L', height_feet: 6, height_inches: 3, weight_lbs: 215, primary_goal: 'Play D1 Baseball', about_me: 'Power hitter with discipline.' },
  { first_name: 'Jordan', last_name: 'Harris', grad_year: 2026, high_school_name: 'Walton High', high_school_city: 'Marietta', high_school_state: 'GA', primary_position: 'Pitcher', secondary_position: 'Outfield', throws: 'R', bats: 'R', height_feet: 6, height_inches: 2, weight_lbs: 190, primary_goal: 'Play D1 Baseball', about_me: 'Two-way player with elite athleticism.' },
  { first_name: 'Andre', last_name: 'Jackson', grad_year: 2027, high_school_name: 'Collins Hill', high_school_city: 'Suwanee', high_school_state: 'GA', primary_position: 'Shortstop', secondary_position: 'Second Base', throws: 'R', bats: 'R', height_feet: 5, height_inches: 11, weight_lbs: 170, primary_goal: 'Play D1 Baseball', about_me: 'Explosive athlete, great defender.' },
  // Arizona players
  { first_name: 'Cole', last_name: 'Anderson', grad_year: 2025, high_school_name: 'Hamilton High', high_school_city: 'Chandler', high_school_state: 'AZ', primary_position: 'Pitcher', secondary_position: null, throws: 'R', bats: 'R', height_feet: 6, height_inches: 5, weight_lbs: 205, primary_goal: 'Play D1 Baseball', about_me: 'Tall right-hander with movement.' },
  { first_name: 'Derek', last_name: 'Scott', grad_year: 2026, high_school_name: 'Desert Mountain', high_school_city: 'Scottsdale', high_school_state: 'AZ', primary_position: 'Catcher', secondary_position: 'First Base', throws: 'R', bats: 'R', height_feet: 6, height_inches: 0, weight_lbs: 195, primary_goal: 'Play D1 Baseball', about_me: 'Strong arm behind the plate.' },
  // North Carolina players
  { first_name: 'Ethan', last_name: 'Brown', grad_year: 2025, high_school_name: 'Ardrey Kell', high_school_city: 'Charlotte', high_school_state: 'NC', primary_position: 'Pitcher', secondary_position: null, throws: 'L', bats: 'L', height_feet: 6, height_inches: 3, weight_lbs: 200, primary_goal: 'Play D1 Baseball', about_me: 'Left-handed pitcher with excellent command.' },
  { first_name: 'Noah', last_name: 'Garcia', grad_year: 2027, high_school_name: 'South Mecklenburg', high_school_city: 'Charlotte', high_school_state: 'NC', primary_position: 'First Base', secondary_position: 'Designated Hitter', throws: 'R', bats: 'R', height_feet: 6, height_inches: 4, weight_lbs: 220, primary_goal: 'Be the best', about_me: 'Power hitter with strong defense.' },
  // New York players
  { first_name: 'Lucas', last_name: 'Rodriguez', grad_year: 2026, high_school_name: 'Iona Prep', high_school_city: 'New Rochelle', high_school_state: 'NY', primary_position: 'Second Base', secondary_position: 'Shortstop', throws: 'R', bats: 'S', height_feet: 5, height_inches: 9, weight_lbs: 165, primary_goal: 'Play D2 Baseball', about_me: 'Switch-hitting infielder with great speed.' },
  { first_name: 'Mason', last_name: 'Lee', grad_year: 2025, high_school_name: 'Archbishop Molloy', high_school_city: 'Queens', high_school_state: 'NY', primary_position: 'Third Base', secondary_position: 'First Base', throws: 'R', bats: 'R', height_feet: 6, height_inches: 1, weight_lbs: 190, primary_goal: 'Play D1 Baseball', about_me: 'Strong third baseman with power.' },
  // Illinois players
  { first_name: 'Aiden', last_name: 'Wilson', grad_year: 2027, high_school_name: 'Marist High', high_school_city: 'Chicago', high_school_state: 'IL', primary_position: 'Right Field', secondary_position: 'Center Field', throws: 'R', bats: 'R', height_feet: 5, height_inches: 11, weight_lbs: 175, primary_goal: 'Make it far', about_me: 'Athletic outfielder with strong arm.' },
  { first_name: 'Carter', last_name: 'Moore', grad_year: 2026, high_school_name: 'St. Rita High', high_school_city: 'Chicago', high_school_state: 'IL', primary_position: 'Pitcher', secondary_position: 'Outfield', throws: 'R', bats: 'R', height_feet: 6, height_inches: 1, weight_lbs: 185, primary_goal: 'Play D1 Baseball', about_me: 'Two-way player with strong pitching.' },
  // Ohio players
  { first_name: 'Nate', last_name: 'Turner', grad_year: 2025, high_school_name: 'Archbishop Moeller', high_school_city: 'Cincinnati', high_school_state: 'OH', primary_position: 'Pitcher', secondary_position: null, throws: 'R', bats: 'R', height_feet: 6, height_inches: 2, weight_lbs: 195, primary_goal: 'Play D1 Baseball', about_me: 'Power arm with three pitches.' },
  { first_name: 'Zach', last_name: 'Miller', grad_year: 2026, high_school_name: 'St. Ignatius', high_school_city: 'Cleveland', high_school_state: 'OH', primary_position: 'Shortstop', secondary_position: 'Third Base', throws: 'R', bats: 'R', height_feet: 6, height_inches: 0, weight_lbs: 175, primary_goal: 'Play D1 Baseball', about_me: 'Smooth fielder with consistent bat.' },
];

const sampleCoaches = [
  { full_name: 'Coach Mike Thompson', coach_type: 'college', school_name: 'State University', school_city: 'Austin', school_state: 'TX', program_division: 'D1', athletic_conference: 'Big 12', staff_role: 'Head Coach', email_contact: 'mthompson@stateuniv.edu', phone_contact: '(512) 555-0101', about: 'State University Baseball is committed to developing student-athletes both on and off the field. We compete in the Big 12 Conference and have a tradition of excellence.', program_values: 'Excellence, Integrity, Teamwork, Academic Success', what_we_look_for: 'We look for players with strong character, work ethic, and the ability to compete at the Division 1 level. Academic performance is also a priority.', academic_profile: 'State University offers over 100 majors and maintains a strong academic support system for student-athletes.', facility_summary: 'State-of-the-art facilities including a 5,000-seat stadium, indoor hitting facility, and modern weight room.', onboarding_completed: true },
  { full_name: 'Coach Sarah Martinez', coach_type: 'college', school_name: 'Regional College', school_city: 'Houston', school_state: 'TX', program_division: 'D2', athletic_conference: 'Lone Star Conference', staff_role: 'Assistant Coach', email_contact: 'smartinez@regionalcollege.edu', phone_contact: '(713) 555-0202', about: 'Regional College Baseball focuses on developing well-rounded student-athletes who excel both academically and athletically.', program_values: 'Growth, Perseverance, Community', what_we_look_for: 'Players who are coachable, hard-working, and committed to their education.', academic_profile: 'Strong academic programs with dedicated support staff for student-athletes.', facility_summary: 'Modern facilities with excellent training resources.', onboarding_completed: true },
  { full_name: 'Coach David Chen', coach_type: 'juco', organization_name: 'Community College', organization_city: 'Dallas', organization_state: 'TX', staff_role: 'Head Coach', email_contact: 'dchen@communitycollege.edu', phone_contact: '(214) 555-0303', about: 'Community College Baseball provides opportunities for players to develop and move on to 4-year programs.', program_values: 'Development, Opportunity, Success', what_we_look_for: 'Players ready to work hard and take the next step in their baseball journey.', onboarding_completed: true },
  { full_name: 'Coach Jennifer Adams', coach_type: 'high_school', school_name: 'Central High School', school_city: 'Austin', school_state: 'TX', staff_role: 'Head Coach', email_contact: 'jadams@centralhs.edu', phone_contact: '(512) 555-0404', about: 'Central High School Baseball program focused on developing young athletes.', onboarding_completed: true },
  { full_name: 'Coach Robert Taylor', coach_type: 'showcase', organization_name: 'Elite Baseball Academy', organization_city: 'San Antonio', organization_state: 'TX', staff_role: 'Director', email_contact: 'rtaylor@elitebaseball.com', phone_contact: '(210) 555-0505', about: 'Elite Baseball Academy provides top-level training and exposure for serious baseball players.', onboarding_completed: true },
];

const sampleMetrics = [
  { metric_label: 'Fastball Velocity', metric_value: '88 mph', metric_type: 'pitching', verified_date: '2024-01-15' },
  { metric_label: 'Exit Velocity', metric_value: '92 mph', metric_type: 'hitting', verified_date: '2024-02-01' },
  { metric_label: '60 Yard Dash', metric_value: '6.8 sec', metric_type: 'speed', verified_date: '2024-01-20' },
  { metric_label: 'Pop Time', metric_value: '1.95 sec', metric_type: 'catching', verified_date: '2024-02-10' },
  { metric_label: 'Changeup Velocity', metric_value: '78 mph', metric_type: 'pitching' },
];

const sampleVideos = [
  { title: '2024 Spring Game Highlights', video_type: 'Game', video_url: 'https://youtube.com/watch?v=example1', recorded_date: '2024-03-15' },
  { title: 'Bullpen Session - March', video_type: 'Training', video_url: 'https://youtube.com/watch?v=example2', recorded_date: '2024-03-10' },
  { title: 'Batting Practice', video_type: 'Training', video_url: 'https://youtube.com/watch?v=example3', recorded_date: '2024-03-05' },
];

const sampleAchievements = [
  { achievement_text: 'All-District First Team', achievement_date: '2023-05-15' },
  { achievement_text: 'Team MVP', achievement_date: '2023-05-20' },
  { achievement_text: 'Academic All-State', achievement_date: '2023-06-01' },
];

async function seedData() {
  console.log('🌱 Starting seed data script...\n');

  try {
    // Step 1: Create auth users and profiles
    console.log('📝 Creating auth users and profiles...');
    const userIds = [];
    
    for (const player of samplePlayers) {
      const email = `${player.first_name.toLowerCase()}.${player.last_name.toLowerCase()}@test.com`;
      const password = 'testpassword123';
      
      let userId = null;
      
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);
      
      if (existingUser) {
        userId = existingUser.id;
        console.log(`  ✓ User already exists: ${email}`);
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: 'player' }
        });

        if (authError) {
          console.error(`  ✗ Error creating user ${email}:`, authError.message);
          continue;
        }

        if (!authData?.user) {
          continue;
        }

        userId = authData.user.id;
        console.log(`  ✓ Created user: ${email}`);
      }

      userIds.push({ userId, email, player });

      // Create/update profile
      await supabase.from('profiles').upsert({
        id: userId,
        role: 'player'
      }, { onConflict: 'id' });

      // Create/update player record
      const { error: playerError } = await supabase.from('players').upsert({
        user_id: userId,
        ...player,
        onboarding_completed: true,
        top_schools: ['State University', 'Regional College', 'Big State U', 'Tech University', 'State College']
      }, { onConflict: 'user_id' });

      if (playerError) {
        console.error(`  ✗ Error creating player for ${email}:`, playerError.message);
      }
    }

    console.log(`✅ Processed ${userIds.length} players\n`);

    // Step 2: Create coaches
    console.log('👔 Creating coaches...');
    const coachIds = [];
    
    for (const coach of sampleCoaches) {
      const email = coach.email_contact || `${coach.full_name.toLowerCase().replace(/\s+/g, '.')}@test.com`;
      const password = 'testpassword123';
      
      let userId = null;
      
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);
      
      if (existingUser) {
        userId = existingUser.id;
        console.log(`  ✓ Coach user already exists: ${email}`);
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: 'coach', coach_type: coach.coach_type }
        });

        if (authError) {
          console.error(`  ✗ Error creating coach ${email}:`, authError.message);
          continue;
        }

        if (!authData?.user) {
          continue;
        }

        userId = authData.user.id;
        console.log(`  ✓ Created coach user: ${email}`);
      }

      // Create/update profile
      await supabase.from('profiles').upsert({
        id: userId,
        role: 'coach'
      }, { onConflict: 'id' });

      // Create/update coach record
      const { data: coachData, error: coachError } = await supabase.from('coaches').upsert({
        user_id: userId,
        ...coach
      }, { onConflict: 'user_id' }).select('id').single();

      if (coachError) {
        console.error(`  ✗ Error creating coach record for ${email}:`, coachError.message);
        continue;
      }

      if (coachData) {
        coachIds.push(coachData.id);
      }
    }

    console.log(`✅ Processed ${coachIds.length} coaches\n`);

    // Step 3: Add metrics, videos, and achievements to players
    console.log('📊 Adding player metrics, videos, and achievements...');
    const { data: allPlayers } = await supabase.from('players').select('id').limit(10);
    
    if (allPlayers && allPlayers.length > 0) {
      let metricsCount = 0;
      let videosCount = 0;
      let achievementsCount = 0;
      
      for (let i = 0; i < allPlayers.length; i++) {
        const player = allPlayers[i];
        
        // Add metrics (skip if already exist)
        const metricsToAdd = sampleMetrics.slice(0, 3 + (i % 3));
        for (const metric of metricsToAdd) {
          const { error } = await supabase.from('player_metrics').insert({
            player_id: player.id,
            ...metric
          });
          if (!error) metricsCount++;
        }

        // Add videos
        const videosToAdd = sampleVideos.slice(0, 2 + (i % 2));
        for (const video of videosToAdd) {
          const { error } = await supabase.from('player_videos').insert({
            player_id: player.id,
            ...video
          });
          if (!error) videosCount++;
        }

        // Add achievements
        const achievementsToAdd = sampleAchievements.slice(0, 2 + (i % 2));
        for (const achievement of achievementsToAdd) {
          const { error } = await supabase.from('player_achievements').insert({
            player_id: player.id,
            ...achievement
          });
          if (!error) achievementsCount++;
        }
      }
      
      console.log(`  ✓ Added ${metricsCount} metrics, ${videosCount} videos, ${achievementsCount} achievements`);
    } else {
      console.log('  ⚠ No players found to add content to');
    }

    console.log('✅ Added player content\n');

    // Step 4: Create camp events
    console.log('🏕️ Creating camp events...');
    if (coachIds.length > 0) {
      const campEvents = [
        { name: 'Spring Prospect Camp', event_date: '2024-04-15', event_type: 'Prospect Camp', location: 'State University Baseball Field', description: 'Join us for a day of evaluation and instruction.', coach_id: coachIds[0], start_time: '09:00', end_time: '17:00' },
        { name: 'Summer Showcase', event_date: '2024-06-20', event_type: 'Showcase', location: 'Regional College Stadium', description: 'Showcase your skills in front of college coaches.', coach_id: coachIds[1] || coachIds[0], start_time: '10:00', end_time: '16:00' },
        { name: 'Elite Training Camp', event_date: '2024-05-10', event_type: 'Training Camp', location: 'Community College Field', description: 'Intensive training camp for serious players.', coach_id: coachIds[2] || coachIds[0], start_time: '08:00', end_time: '18:00' },
      ];

      let eventsCreated = 0;
      for (const event of campEvents) {
        if (!event.coach_id) continue;
        const { error } = await supabase.from('camp_events').insert(event);
        if (!error) eventsCreated++;
      }
      console.log(`  ✓ Created ${eventsCreated} camp events`);
    } else {
      console.log('  ⚠ No coaches found to create events for');
    }

    console.log('✅ Created camp events\n');

    // Step 5: Create teams and memberships
    console.log('👥 Creating teams and memberships...');
    if (coachIds.length > 3 && allPlayers && allPlayers.length > 0) {
      // Find high school coach
      const { data: hsCoach } = await supabase
        .from('coaches')
        .select('id')
        .eq('coach_type', 'high_school')
        .limit(1)
        .single();

      if (hsCoach) {
        // Check if team already exists
        const { data: existingTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('coach_id', hsCoach.id)
          .eq('name', 'Central High School Varsity')
          .maybeSingle();

        let teamId = existingTeam?.id;

        if (!teamId) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .insert({
              coach_id: hsCoach.id,
              team_type: 'high_school',
              name: 'Central High School Varsity',
              level: 'Varsity',
              city: 'Austin',
              state: 'TX'
            })
            .select('id')
            .single();

          if (teamError) {
            console.error('  ✗ Error creating team:', teamError.message);
          } else if (teamData) {
            teamId = teamData.id;
            console.log('  ✓ Created team: Central High School Varsity');
          }
        } else {
          console.log('  ✓ Team already exists: Central High School Varsity');
        }

        if (teamId) {
          // Add first 5 players to the team (skip if already members)
          let membersAdded = 0;
          for (const player of allPlayers.slice(0, 5)) {
            const { error } = await supabase.from('team_memberships').insert({
              team_id: teamId,
              player_id: player.id
            });
            if (!error) membersAdded++;
          }
          console.log(`  ✓ Added ${membersAdded} players to team`);
        }
      } else {
        console.log('  ⚠ No high school coach found');
      }
    } else {
      console.log('  ⚠ Skipping teams (need coaches and players)');
    }

    console.log('✅ Created teams\n');

    // Step 6: Create additional teams (Showcase, JUCO)
    console.log('👥 Creating additional teams...');
    if (coachIds.length > 0 && allPlayers && allPlayers.length > 0) {
      // Find showcase coach
      const { data: showcaseCoach } = await supabase
        .from('coaches')
        .select('id')
        .eq('coach_type', 'showcase')
        .limit(1)
        .single();

      if (showcaseCoach) {
        const { data: existingShowcaseTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('coach_id', showcaseCoach.id)
          .maybeSingle();

        if (!existingShowcaseTeam) {
          const { data: showcaseTeam, error: showcaseError } = await supabase
            .from('teams')
            .insert({
              coach_id: showcaseCoach.id,
              team_type: 'showcase',
              name: 'Elite Baseball Academy 17U',
              level: '17U',
              city: 'San Antonio',
              state: 'TX'
            })
            .select('id')
            .single();

          if (!showcaseError && showcaseTeam) {
            // Add 3-4 players to showcase team
            let membersAdded = 0;
            for (const player of allPlayers.slice(5, 9)) {
              const { error } = await supabase.from('team_memberships').insert({
                team_id: showcaseTeam.id,
                player_id: player.id
              });
              if (!error) membersAdded++;
            }
            console.log(`  ✓ Created showcase team with ${membersAdded} players`);
          }
        }
      }

      // Find JUCO coach
      const { data: jucoCoach } = await supabase
        .from('coaches')
        .select('id')
        .eq('coach_type', 'juco')
        .limit(1)
        .single();

      if (jucoCoach) {
        const { data: existingJucoTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('coach_id', jucoCoach.id)
          .maybeSingle();

        if (!existingJucoTeam) {
          const { data: jucoTeam, error: jucoError } = await supabase
            .from('teams')
            .insert({
              coach_id: jucoCoach.id,
              team_type: 'juco',
              name: 'Community College Baseball',
              level: 'JUCO',
              city: 'Dallas',
              state: 'TX'
            })
            .select('id')
            .single();

          if (!jucoError && jucoTeam) {
            // Add 2-3 players to JUCO team
            let membersAdded = 0;
            for (const player of allPlayers.slice(9, 12)) {
              const { error } = await supabase.from('team_memberships').insert({
                team_id: jucoTeam.id,
                player_id: player.id
              });
              if (!error) membersAdded++;
            }
            console.log(`  ✓ Created JUCO team with ${membersAdded} players`);
          }
        }
      }
    }

    console.log('✅ Created additional teams\n');

    // Step 7: Create team schedule events
    console.log('📅 Creating team schedule events...');
    const { data: allTeams } = await supabase.from('teams').select('id, coach_id, name');
    
    if (allTeams && allTeams.length > 0) {
      let eventsCreated = 0;
      const today = new Date();
      
      for (const team of allTeams) {
        // Create 5-8 events per team (mix of games, practices, tournaments)
        const eventTypes = ['game', 'practice', 'tournament', 'showcase'];
        const opponents = ['Riverside High', 'Westfield High', 'Memorial High', 'Lincoln High', 'Jefferson High'];
        const tournaments = ['Spring Classic', 'Summer Showcase', 'Elite Tournament', 'Championship Series'];
        
        for (let i = 0; i < 6; i++) {
          const eventDate = new Date(today);
          eventDate.setDate(today.getDate() + (i * 7) + Math.floor(Math.random() * 3)); // Spread over weeks
          
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          let eventName = null;
          let opponentName = null;
          
          if (eventType === 'game') {
            opponentName = opponents[Math.floor(Math.random() * opponents.length)];
          } else if (eventType === 'tournament' || eventType === 'showcase') {
            eventName = tournaments[Math.floor(Math.random() * tournaments.length)];
          }
          
          const startHour = eventType === 'practice' ? 15 : 18; // Practices at 3pm, games at 6pm
          const startTime = `${String(startHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`;
          const endTime = eventType === 'practice' 
            ? `${String(startHour + 2).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`
            : null;
          
          // Use camp_events as placeholder (will be team_schedule later)
          const { error } = await supabase.from('camp_events').insert({
            coach_id: team.coach_id,
            name: eventName || opponentName || `${eventType} event`,
            event_date: eventDate.toISOString().split('T')[0],
            event_type: eventType === 'game' ? 'Game' : eventType === 'practice' ? 'Practice' : eventType === 'tournament' ? 'Tournament' : 'Prospect Camp',
            location: `${team.name} Field`,
            description: eventType === 'game' ? `Game vs ${opponentName}` : `Team ${eventType}`,
            start_time: startTime,
            end_time: endTime,
            is_public: true,
          });
          
          if (!error) eventsCreated++;
        }
      }
      
      console.log(`  ✓ Created ${eventsCreated} schedule events`);
    } else {
      console.log('  ⚠ No teams found to create events for');
    }
    
    console.log('✅ Created schedule events\n');

    // Step 8: Create player engagement data (for trending)
    console.log('📈 Creating player engagement data...');
    const { data: playersForEngagement } = await supabase.from('players').select('id').limit(10);
    
    if (playersForEngagement && playersForEngagement.length > 0) {
      let engagementCreated = 0;
      
      for (const player of playersForEngagement) {
        // Create varied engagement scores
        const recentViews = Math.floor(Math.random() * 50) + 10;
        const watchlistAdds = Math.floor(Math.random() * 15) + 2;
        const recentUpdates = Math.floor(Math.random() * 10) + 1;
        const daysAgo = Math.floor(Math.random() * 14);
        const lastActivity = new Date();
        lastActivity.setDate(lastActivity.getDate() - daysAgo);
        
        const { error } = await supabase.from('player_engagement').upsert({
          player_id: player.id,
          profile_views_count: recentViews * 3,
          watchlist_adds_count: watchlistAdds,
          recent_views_7d: recentViews,
          recent_updates_30d: recentUpdates,
          last_viewed_at: new Date().toISOString(),
          last_activity_at: lastActivity.toISOString(),
        }, {
          onConflict: 'player_id'
        });
        
        if (!error) engagementCreated++;
      }
      
      console.log(`  ✓ Created/updated ${engagementCreated} player engagement records`);
    } else {
      console.log('  ⚠ No players found for engagement data');
    }
    
    console.log('✅ Created engagement data\n');

    // Step 9: Create program needs for college coaches
    console.log('🎯 Creating program needs...');
    const { data: collegeCoaches } = await supabase
      .from('coaches')
      .select('id')
      .eq('coach_type', 'college')
      .limit(2);
    
    if (collegeCoaches && collegeCoaches.length > 0) {
      let needsCreated = 0;
      const positions = ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Shortstop', 'Third Base', 'Outfield'];
      const states = ['TX', 'CA', 'FL', 'GA', 'NC'];
      
      for (const coach of collegeCoaches) {
        const positionsNeeded = positions.slice(0, Math.floor(Math.random() * 4) + 2);
        const gradYears = [2025, 2026, 2027];
        const preferredStates = states.slice(0, Math.floor(Math.random() * 3) + 2);
        
        const { error } = await supabase.from('program_needs').upsert({
          coach_id: coach.id,
          positions_needed: positionsNeeded,
          grad_years_needed: gradYears,
          min_height: 70, // 5'10"
          max_height: 78, // 6'6"
          min_pitch_velo: 85,
          min_exit_velo: 88,
          max_sixty_time: 7.0,
          preferred_states: preferredStates,
        }, {
          onConflict: 'coach_id'
        });
        
        if (!error) needsCreated++;
      }
      
      console.log(`  ✓ Created/updated ${needsCreated} program needs records`);
    } else {
      console.log('  ⚠ No college coaches found');
    }
    
    console.log('✅ Created program needs\n');

    // Step 10: Create recruit watchlist entries
    console.log('⭐ Creating recruit watchlist entries...');
    if (collegeCoaches && collegeCoaches.length > 0 && playersForEngagement && playersForEngagement.length > 0) {
      let watchlistCreated = 0;
      const statuses = ['watchlist', 'high_priority', 'offer_extended', 'committed'];
      
      // Add 3-5 players per coach to watchlist
      for (const coach of collegeCoaches) {
        const playersToAdd = playersForEngagement
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 3) + 3);
        
        for (const player of playersToAdd) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          const { error } = await supabase.from('recruit_watchlist').upsert({
            coach_id: coach.id,
            player_id: player.id,
            status: status,
            position_role: status === 'high_priority' ? 'Weekend Starter' : null,
            notes: status === 'committed' ? 'Player has committed to our program' : null,
          }, {
            onConflict: 'coach_id,player_id'
          });
          
          if (!error) watchlistCreated++;
        }
      }
      
      console.log(`  ✓ Created ${watchlistCreated} watchlist entries`);
    } else {
      console.log('  ⚠ Need coaches and players for watchlist');
    }
    
    console.log('✅ Created watchlist entries\n');

    // Step 11: Update players with additional data (pitch_velo, exit_velo, sixty_time, full_name)
    console.log('📝 Updating players with additional metrics...');
    if (playersForEngagement && playersForEngagement.length > 0) {
      let updated = 0;
      
      for (const player of playersForEngagement) {
        const { data: playerData } = await supabase
          .from('players')
          .select('first_name, last_name, primary_position')
          .eq('id', player.id)
          .single();
        
        if (playerData) {
          const updates = {
            full_name: `${playerData.first_name || ''} ${playerData.last_name || ''}`.trim(),
          };
          
          // Add position-specific metrics
          if (playerData.primary_position === 'Pitcher' || playerData.primary_position?.includes('Pitcher')) {
            updates.pitch_velo = 85 + Math.floor(Math.random() * 10); // 85-95 mph
          } else {
            updates.exit_velo = 88 + Math.floor(Math.random() * 8); // 88-96 mph
            updates.sixty_time = 6.5 + (Math.random() * 0.8); // 6.5-7.3 sec
          }
          
          // Randomly add has_video and verified_metrics flags
          if (Math.random() > 0.3) {
            updates.has_video = true;
          }
          if (Math.random() > 0.4) {
            updates.verified_metrics = true;
          }
          
          const { error } = await supabase
            .from('players')
            .update(updates)
            .eq('id', player.id);
          
          if (!error) updated++;
        }
      }
      
      console.log(`  ✓ Updated ${updated} players with metrics`);
    }
    
    console.log('✅ Updated player metrics\n');

    console.log('🎉 Seed data script completed successfully!\n');
    console.log('📋 Test Accounts Created:');
    console.log('  Players:');
    samplePlayers.slice(0, 3).forEach(p => {
      console.log(`    - ${p.first_name.toLowerCase()}.${p.last_name.toLowerCase()}@test.com / testpassword123`);
    });
    console.log('  Coaches:');
    sampleCoaches.forEach(c => {
      const email = c.email_contact || `${c.full_name.toLowerCase().replace(/\s+/g, '.')}@test.com`;
      console.log(`    - ${email} / testpassword123`);
    });
    console.log('\n📊 Data Created:');
    console.log('  - Teams with rosters (High School, Showcase, JUCO)');
    console.log('  - Schedule events for teams');
    console.log('  - Player engagement (for trending)');
    console.log('  - Program needs (for AI recommendations)');
    console.log('  - Recruit watchlist entries');
    console.log('  - Player metrics (pitch_velo, exit_velo, sixty_time, has_video, verified_metrics)');
    console.log('\n✅ All done!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed script
seedData();

