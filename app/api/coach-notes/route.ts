import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sanitizeInput, sanitizeUuid } from '@/lib/utils/sanitize';
import { rateLimit } from '@/lib/utils/rateLimit';

/**
 * Create or update coach note for a player
 * POST /api/coach-notes
 */

const coachNoteInputSchema = z.object({
  player_id: z.string().uuid('Invalid player ID'),
  note_content: z.string().min(1, 'Note content is required').max(5000, 'Note too long'),
  is_private: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = rateLimit(`coach-notes:${user.id}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 20, // 20 requests per minute
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate input
    const validationResult = coachNoteInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { player_id, note_content, is_private } = validationResult.data;

    // Sanitize inputs
    const sanitizedPlayerId = sanitizeUuid(player_id);
    if (!sanitizedPlayerId) {
      return NextResponse.json(
        { error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    const sanitizedNoteContent = sanitizeInput(note_content, 5000);

    // Get coach profile
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (coachError || !coach) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 }
      );
    }

    // Check if note exists in recruit_watchlist
    const { data: existing } = await supabase
      .from('recruit_watchlist')
      .select('id, notes')
      .eq('coach_id', coach.id)
      .eq('player_id', sanitizedPlayerId)
      .maybeSingle();

    if (existing) {
      // Update existing notes (append new note with timestamp)
      const timestamp = new Date().toLocaleString();
      const updatedNotes = existing.notes 
        ? `${existing.notes}\n\n[${timestamp}] ${sanitizedNoteContent}`
        : `[${timestamp}] ${sanitizedNoteContent}`;
      
      const { error: updateError } = await supabase
        .from('recruit_watchlist')
        .update({
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating note:', updateError);
        return NextResponse.json(
          { error: 'Failed to update note' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Note updated' });
    }

    // If not in watchlist, add to watchlist with note
    const { error: insertError } = await supabase
      .from('recruit_watchlist')
      .insert({
        coach_id: coach.id,
        player_id: player_id,
        status: 'watchlist',
        notes: `[${new Date().toLocaleString()}] ${note_content}`,
      });

    if (insertError) {
      console.error('Error creating note:', insertError);
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Note created' },
      {
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Error in coach-notes route:', error);
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(isDevelopment && { details: error instanceof Error ? error.message : String(error) }),
      },
      { status: 500 }
    );
  }
}

/**
 * Get coach notes for a player
 * GET /api/coach-notes?player_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const player_id = searchParams.get('player_id');

    if (!player_id) {
      return NextResponse.json(
        { error: 'player_id is required' },
        { status: 400 }
      );
    }

    // Get coach profile
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (coachError || !coach) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 }
      );
    }

    // Get notes from recruit_watchlist
    const { data: watchlistEntry, error } = await supabase
      .from('recruit_watchlist')
      .select('notes, updated_at')
      .eq('coach_id', coach.id)
      .eq('player_id', player_id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notes: watchlistEntry?.notes || null,
      updated_at: watchlistEntry?.updated_at || null,
    });
  } catch (error) {
    console.error('Error in coach-notes GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
