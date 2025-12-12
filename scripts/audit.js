/**
 * ScoutPulse Optimization Audit
 * Checks for missing optimizations and potential improvements
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function audit() {
  console.log('🔍 ScoutPulse Optimization Audit\n');
  console.log('='.repeat(60));

  const issues = [];
  const suggestions = [];

  // 1. Check Database Indexes
  console.log('\n📊 Checking Database...');

  // Run all database queries in parallel for speed
  const [
    { data: playersNoEngagement },
    { data: engagementPlayers },
    { data: playersNoName },
    { data: playersWithMetrics },
    { data: coaches },
    { data: programNeeds }
  ] = await Promise.all([
    supabase.from('players').select('id').eq('onboarding_completed', true),
    supabase.from('player_engagement').select('player_id'),
    supabase.from('players').select('id').is('full_name', null),
    supabase.from('player_metrics').select('player_id'),
    supabase.from('coaches').select('id').eq('coach_type', 'college'),
    supabase.from('program_needs').select('coach_id')
  ]);

  // Check for players without engagement data
  const engagedIds = new Set(engagementPlayers?.map(e => e.player_id) || []);
  const missingEngagement = playersNoEngagement?.filter(p => !engagedIds.has(p.id)) || [];

  if (missingEngagement.length > 0) {
    issues.push(`${missingEngagement.length} players missing engagement data (affects trending)`);
  }

  // Check for players without full_name
  if (playersNoName?.length > 0) {
    issues.push(`${playersNoName.length} players missing full_name`);
  }

  // Check for players without metrics
  const metricsIds = new Set(playersWithMetrics?.map(m => m.player_id) || []);
  const playersNoMetrics = playersNoEngagement?.filter(p => !metricsIds.has(p.id)) || [];

  if (playersNoMetrics.length > 5) {
    suggestions.push(`${playersNoMetrics.length} players have no metrics (consider adding sample data)`);
  }

  // Check coaches without program_needs
  const needsCoachIds = new Set(programNeeds?.map(n => n.coach_id) || []);
  const coachesNoNeeds = coaches?.filter(c => !needsCoachIds.has(c.id)) || [];

  if (coachesNoNeeds.length > 0) {
    suggestions.push(`${coachesNoNeeds.length} college coaches without program_needs (affects AI recommendations)`);
  }

  console.log('  ✓ Database audit complete');

  // 2. Check for missing avatar URLs
  console.log('\n🖼️  Checking Media...');

  // Run media queries in parallel
  const [
    { data: playersNoAvatar },
    { data: coachesNoLogo }
  ] = await Promise.all([
    supabase.from('players').select('id').is('avatar_url', null).eq('onboarding_completed', true),
    supabase.from('coaches').select('id').is('logo_url', null).eq('onboarding_completed', true)
  ]);

  if (playersNoAvatar?.length > 10) {
    suggestions.push(`${playersNoAvatar.length} players without avatar URLs (shows fallback initials)`);
  }

  if (coachesNoLogo?.length > 0) {
    suggestions.push(`${coachesNoLogo.length} coaches/programs without logos`);
  }

  console.log('  ✓ Media audit complete');

  // 3. Check state coverage for map
  console.log('\n🗺️  Checking Map Coverage...');
  
  const { data: stateCoverage } = await supabase
    .from('players')
    .select('high_school_state')
    .eq('onboarding_completed', true)
    .not('high_school_state', 'is', null);
  
  const states = [...new Set(stateCoverage?.map(p => p.high_school_state) || [])];
  
  const majorStates = ['TX', 'CA', 'FL', 'GA', 'NC', 'AZ', 'NY', 'IL', 'OH', 'PA', 'NJ', 'VA', 'TN', 'SC', 'AL', 'LA', 'OK', 'MO', 'IN', 'MI'];
  const missingMajorStates = majorStates.filter(s => !states.includes(s));
  
  if (missingMajorStates.length > 10) {
    suggestions.push(`${missingMajorStates.length} major baseball states have no players (map will show empty)`);
  }
  
  console.log(`  ✓ ${states.length} states have players`);

  // 4. Check code files for common issues
  console.log('\n📝 Checking Code Patterns...');

  const { execSync } = require('child_process');

  // Check for console.log statements using grep (much faster!)
  try {
    const grepResult = execSync(
      'grep -r "console\\.log" app --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l',
      { encoding: 'utf8', cwd: path.join(__dirname, '..') }
    ).trim();

    const consoleLogCount = parseInt(grepResult) || 0;
    if (consoleLogCount > 10) {
      suggestions.push(`${consoleLogCount} console.log statements in app/ (consider removing for production)`);
    }
  } catch (e) {
    // If grep fails (e.g., no matches found), that's fine
  }

  console.log('  ✓ Code pattern check complete');

  // 5. Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 AUDIT SUMMARY\n');
  
  if (issues.length === 0) {
    console.log('✅ No critical issues found!\n');
  } else {
    console.log('❌ Issues to Fix:');
    issues.forEach(issue => console.log(`   • ${issue}`));
    console.log('');
  }
  
  if (suggestions.length === 0) {
    console.log('✨ No optimization suggestions - looking good!\n');
  } else {
    console.log('💡 Optimization Suggestions:');
    suggestions.forEach(suggestion => console.log(`   • ${suggestion}`));
    console.log('');
  }

  // 6. Additional Recommendations
  console.log('📚 Additional Recommendations:\n');
  
  const recommendations = [
    'Add more players across all 50 states for better map coverage',
    'Add sample conversations/messages for messaging UI testing',
    'Consider adding image upload to Supabase Storage for avatars/logos',
    'Add error boundary components for graceful error handling',
    'Implement React Query or SWR for better data caching',
    'Add skeleton loaders for better perceived performance',
    'Set up Supabase Edge Functions for complex operations',
    'Configure Supabase Realtime for live message updates',
    'Add PWA support for mobile app-like experience',
    'Set up analytics (Vercel Analytics, Posthog, etc.)',
  ];
  
  recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
  
  console.log('\n' + '='.repeat(60));
}

audit().catch(console.error);

