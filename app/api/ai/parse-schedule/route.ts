import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Parse schedule from PDF/image using AI
 * POST /api/ai/parse-schedule
 */

const inputSchema = z.object({
  // Add your validation rules here
  // Example: name: z.string().min(1).max(100)
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const teamId = formData.get('team_id') as string;

    if (!file || !teamId) {
      return NextResponse.json(
        { error: 'File and team_id are required' },
        { status: 400 }
      );
    }

    // Verify coach owns this team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('coach_id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get coach ID
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!coach || coach.id !== team.coach_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/pdf';

    // Call AI service
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const useOpenAI = !!process.env.OPENAI_API_KEY;
    let parsedEvents;
    
    if (useOpenAI) {
      parsedEvents = await parseScheduleWithOpenAI(base64, mimeType);
    } else {
      parsedEvents = await parseScheduleWithClaude(base64, mimeType);
    }

    if (!parsedEvents || parsedEvents.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse schedule from document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: parsedEvents,
    });
  } catch (error) {
    console.error('Error parsing schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Parse schedule using OpenAI Vision
 */
async function parseScheduleWithOpenAI(
  base64: string,
  mimeType: string
): Promise<any[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract all baseball games and events from this schedule. Return a JSON array with the following format for each event:
{
  "event_type": "game" | "practice" | "tournament" | "showcase",
  "event_name": "string (optional)",
  "opponent_name": "string (for games)",
  "location_name": "string",
  "location_address": "string (optional)",
  "start_time": "ISO 8601 datetime string",
  "end_time": "ISO 8601 datetime string (optional)",
  "is_home": boolean (for games),
  "notes": "string (optional)"
}

Parse dates and times carefully. Use the current year if not specified.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    return [];
  }

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (e) {
    console.error('Error parsing AI response:', e);
    return [];
  }
}

/**
 * Parse schedule using Claude
 */
async function parseScheduleWithClaude(
  base64: string,
  mimeType: string
): Promise<any[]> {
  // Placeholder for Claude implementation
  return [];
}

