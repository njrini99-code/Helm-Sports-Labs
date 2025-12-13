import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'Get them from: https://supabase.com/dashboard → Settings → API'
    );
  }

  if (key.includes('PASTE_YOUR') || key.includes('your-')) {
    throw new Error(
      'Supabase API key is still a placeholder. Please replace it with your actual key.\n' +
      '1. Go to: https://supabase.com/dashboard\n' +
      '2. Select your project → Settings → API\n' +
      '3. Copy the "anon" "public" key\n' +
      '4. Replace PASTE_YOUR_ANON_KEY_HERE in .env.local\n' +
      '5. Restart your dev server'
    );
  }

  return createBrowserClient(url, key);
}

