/**
 * Quick validator for coach dashboard buttons/links.
 * - Confirms target pages exist for primary coach routes.
 * - Flags any "coming soon" placeholders in the coach dashboard tree.
 *
 * Run: node scripts/validate-coach-nav.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const routeChecks = [
  {
    name: 'Edit Profile',
    href: '/coach/college/program',
    candidates: ['app/(dashboard)/coach/college/program/page.tsx'],
  },
  {
    name: 'Messages',
    href: '/coach/college/messages',
    candidates: ['app/(dashboard)/coach/college/messages/page.tsx'],
  },
  {
    name: 'Recruiting Planner',
    href: '/coach/college/recruiting-planner',
    candidates: ['app/(dashboard)/coach/college/recruiting-planner/page.tsx'],
  },
  {
    name: 'Discover',
    href: '/coach/college/discover',
    candidates: ['app/(dashboard)/coach/college/discover/page.tsx'],
  },
  {
    name: 'Watchlist',
    href: '/coach/college/watchlist',
    candidates: ['app/(dashboard)/coach/college/watchlist/page.tsx'],
  },
  {
    name: 'Camps',
    href: '/coach/college/camps',
    candidates: ['app/(dashboard)/coach/college/camps/page.tsx'],
  },
  {
    name: 'Program Preview',
    href: '/program/preview',
    candidates: [
      'app/program/preview/page.tsx',
      'app/(public)/program/preview/page.tsx',
      'app/(dashboard)/coach/college/program/preview/page.tsx',
    ],
  },
  {
    name: 'Player Profile',
    href: '/coach/college/player/:id',
    candidates: [
      'app/(dashboard)/coach/college/player/[playerId]/page.tsx',
      'app/(dashboard)/coach/college/player/[id]/page.tsx',
    ],
  },
];

function firstExisting(paths) {
  for (const rel of paths) {
    const full = path.join(repoRoot, rel);
    if (fs.existsSync(full)) {
      return { found: true, path: rel };
    }
  }
  return { found: false, path: null };
}

function walkFiles(startDir, exts = ['.ts', '.tsx']) {
  const results = [];
  const stack = [startDir];

  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        stack.push(path.join(current, entry));
      }
    } else if (exts.includes(path.extname(current))) {
      results.push(current);
    }
  }

  return results;
}

function findComingSoon(root) {
  const hits = [];
  const files = walkFiles(root);
  const pattern = /coming soon/i;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (pattern.test(line)) {
        hits.push({
          file: path.relative(repoRoot, file),
          line: idx + 1,
          snippet: line.trim(),
        });
      }
    });
  }

  return hits;
}

function main() {
  console.log('Coach dashboard navigation check\n');

  let okCount = 0;
  let warnCount = 0;

  for (const check of routeChecks) {
    const res = firstExisting(check.candidates);
    if (res.found) {
      okCount++;
      console.log(`✅ ${check.href} (${check.name}) -> ${res.path}`);
    } else {
      warnCount++;
      console.warn(
        `⚠️  Missing target for ${check.href} (${check.name}). Checked: ${check.candidates.join(', ')}`
      );
    }
  }

  const placeholderHits = findComingSoon(path.join(repoRoot, 'app/(dashboard)/coach/college'));
  if (placeholderHits.length) {
    warnCount += placeholderHits.length;
    console.log('\nPlaceholders flagged (contains "coming soon"):');
    placeholderHits.forEach((hit) => {
      console.log(`⚠️  ${hit.file}:${hit.line} — ${hit.snippet}`);
    });
  }

  console.log(`\nSummary: ${okCount} ok, ${warnCount} warnings`);
  process.exitCode = warnCount ? 1 : 0;
}

main();
