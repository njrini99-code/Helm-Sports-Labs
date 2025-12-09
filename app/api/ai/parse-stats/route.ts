import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Parse stats from PDF/image using AI
 * POST /api/ai/parse-stats
 */
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
    const gameId = formData.get('game_id') as string | null;

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

    // Get team roster for player name matching
    const { data: memberships } = await supabase
      .from('team_memberships')
      .select(`
        player:player_id (
          id,
          full_name,
          first_name,
          last_name
        )
      `)
      .eq('team_id', teamId)
      .eq('status', 'active');

    const roster = memberships?.map((m: any) => m.player).filter(Boolean) || [];

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/pdf';

    // Call AI service (OpenAI or Claude)
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Use OpenAI Vision API or Claude
    const useOpenAI = !!process.env.OPENAI_API_KEY;
    
    let parsedStats;
    if (useOpenAI) {
      parsedStats = await parseWithOpenAI(base64, mimeType, roster);
    } else {
      parsedStats = await parseWithClaude(base64, mimeType, roster);
    }

    if (!parsedStats) {
      return NextResponse.json(
        { error: 'Failed to parse stats from document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      parsed_stats: parsedStats,
      roster: roster,
    });
  } catch (error) {
    console.error('Error parsing stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Parse stats using OpenAI Vision
 */
async function parseWithOpenAI(
  base64: string,
  mimeType: string,
  roster: any[]
): Promise<any> {
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
              text: `Extract baseball statistics from this document. Return a JSON array of player stats with the following format for each player:
{
  "player_name": "string (match to roster if possible)",
  "ab": number (at bats),
  "h": number (hits),
  "2b": number (doubles),
  "3b": number (triples),
  "hr": number (home runs),
  "rbi": number (RBIs),
  "bb": number (walks),
  "k": number (strikeouts),
  "r": number (runs)
}

For pitchers, include:
{
  "player_name": "string",
  "ip": number (innings pitched),
  "h": number (hits allowed),
  "r": number (runs allowed),
  "er": number (earned runs),
  "bb": number (walks),
  "k": number (strikeouts)
}

Available roster: ${JSON.stringify(roster.map((p: any) => ({
  id: p.id,
  name: p.full_name || `${p.first_name} ${p.last_name}`,
})))}`,
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
    return null;
  }

  // Parse JSON from response
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (e) {
    console.error('Error parsing AI response:', e);
    return null;
  }
}

/**
 * Parse stats using Claude
 */
async function parseWithClaude(
  base64: string,
  mimeType: string,
  roster: any[]
): Promise<any> {
  // Similar implementation for Claude
  // This is a placeholder - implement based on Claude API
  return null;
}

