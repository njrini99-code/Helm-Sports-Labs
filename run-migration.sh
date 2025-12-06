#!/bin/bash
# Run this from your terminal (outside Cursor) to apply the migration

cd "$(dirname "$0")"

echo "🏃 Running ScoutPulse Migration 006..."
echo ""

# Set DATABASE_URL for the Node migration script
DATABASE_URL="postgresql://postgres:zDcut4GG2fw85v9I@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres" \
  node scripts/run-migration.js

echo ""
echo "✅ Done!"
