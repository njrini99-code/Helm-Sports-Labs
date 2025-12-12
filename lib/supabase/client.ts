import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5e57ddaf-a4e9-4035-836d-3aff839f6b8f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'supabase-client-check',
      hypothesisId: 'A',
      location: 'lib/supabase/client.ts:createClient',
      message: 'Checking environment variables',
      data: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'N/A',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) || 'N/A',
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        hasPlaceholder: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('PASTE_YOUR') || false,
      },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion agent log

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5e57ddaf-a4e9-4035-836d-3aff839f6b8f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'supabase-client-check',
        hypothesisId: 'B',
        location: 'lib/supabase/client.ts:createClient',
        message: 'Missing env vars error',
        data: { url: !!url, key: !!key },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion agent log
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'Get them from: https://supabase.com/dashboard → Settings → API'
    );
  }

  if (key.includes('PASTE_YOUR') || key.includes('your-')) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5e57ddaf-a4e9-4035-836d-3aff839f6b8f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'supabase-client-check',
        hypothesisId: 'C',
        location: 'lib/supabase/client.ts:createClient',
        message: 'Placeholder key detected',
        data: { keyPreview: key.substring(0, 50) },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion agent log
    throw new Error(
      'Supabase API key is still a placeholder. Please replace it with your actual key.\n' +
      '1. Go to: https://supabase.com/dashboard\n' +
      '2. Select your project → Settings → API\n' +
      '3. Copy the "anon" "public" key\n' +
      '4. Replace PASTE_YOUR_ANON_KEY_HERE in .env.local\n' +
      '5. Restart your dev server'
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5e57ddaf-a4e9-4035-836d-3aff839f6b8f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'supabase-client-check',
      hypothesisId: 'D',
      location: 'lib/supabase/client.ts:createClient',
      message: 'Creating Supabase client successfully',
      data: { url: url.substring(0, 30), keyLength: key.length },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion agent log

  return createBrowserClient(url, key);
}

