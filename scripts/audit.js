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
  
  // Check for players without engagement data
  const { data: playersNoEngagement } = await supabase
    .from('players')
    .select('id')
    .eq('onboarding_completed', true);
  
  const { data: engagementPlayers } = await supabase
    .from('player_engagement')
    .select('player_id');
  
  const engagedIds = new Set(engagementPlayers?.map(e => e.player_id) || []);
  const missingEngagement = playersNoEngagement?.filter(p => !engagedIds.has(p.id)) || [];
  
  if (missingEngagement.length > 0) {
    issues.push(`${missingEngagement.length} players missing engagement data (affects trending)`);
  }
  
  // Check for players without full_name
  const { data: playersNoName } = await supabase
    .from('players')
    .select('id')
    .is('full_name', null);
  
  if (playersNoName?.length > 0) {
    issues.push(`${playersNoName.length} players missing full_name`);
  }
  
  // Check for players without metrics
  const { data: playersWithMetrics } = await supabase
    .from('player_metrics')
    .select('player_id');
  
  const metricsIds = new Set(playersWithMetrics?.map(m => m.player_id) || []);
  const playersNoMetrics = playersNoEngagement?.filter(p => !metricsIds.has(p.id)) || [];
  
  if (playersNoMetrics.length > 5) {
    suggestions.push(`${playersNoMetrics.length} players have no metrics (consider adding sample data)`);
  }
  
  // Check coaches without program_needs
  const { data: coaches } = await supabase
    .from('coaches')
    .select('id')
    .eq('coach_type', 'college');
  
  const { data: programNeeds } = await supabase
    .from('program_needs')
    .select('coach_id');
  
  const needsCoachIds = new Set(programNeeds?.map(n => n.coach_id) || []);
  const coachesNoNeeds = coaches?.filter(c => !needsCoachIds.has(c.id)) || [];
  
  if (coachesNoNeeds.length > 0) {
    suggestions.push(`${coachesNoNeeds.length} college coaches without program_needs (affects AI recommendations)`);
  }
  
  console.log('  ✓ Database audit complete');

  // 2. Check for missing avatar URLs
  console.log('\n🖼️  Checking Media...');
  
  const { data: playersNoAvatar } = await supabase
    .from('players')
    .select('id')
    .is('avatar_url', null)
    .eq('onboarding_completed', true);
  
  if (playersNoAvatar?.length > 10) {
    suggestions.push(`${playersNoAvatar.length} players without avatar URLs (shows fallback initials)`);
  }
  
  const { data: coachesNoLogo } = await supabase
    .from('coaches')
    .select('id')
    .is('logo_url', null)
    .eq('onboarding_completed', true);
  
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
  
  const srcDir = path.join(__dirname, '..');
  
  // Check for console.log statements
  const checkForConsoleLog = (dir) => {
    let count = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        count += checkForConsoleLog(path.join(dir, file.name));
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
        const matches = content.match(/console\.log/g);
        if (matches) count += matches.length;
      }
    }
    return count;
  };
  
  try {
    const consoleLogCount = checkForConsoleLog(path.join(srcDir, 'app'));
    if (consoleLogCount > 10) {
      suggestions.push(`${consoleLogCount} console.log statements in app/ (consider removing for production)`);
    }
  } catch (e) {}
  
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

