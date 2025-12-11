import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.string().default('active')
});


const inputSchema = z.object({
  // Add your validation rules here
  // Example: name: z.string().min(1).max(100)
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = schema.parse(body);

    const { data, error } = await supabase
      .from('player_comparison')
      .insert({
        ...validated,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('POST /player-comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to create' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('player_comparison')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET /player-comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
