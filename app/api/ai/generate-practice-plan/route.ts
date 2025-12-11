import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate practice plan from text using AI
 * POST /api/ai/generate-practice-plan
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

    const body = await request.json();
    const { text, template, event_date, duration_minutes = 90 } = body;

    if (!text && !template) {
      return NextResponse.json(
        { error: 'Text or template is required' },
        { status: 400 }
      );
    }

    // Get coach ID
    const { data: coach } = await supabase
      .from('coaches')
      .select('id, full_name, school_name')
      .eq('user_id', user.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Call AI service
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const useOpenAI = !!process.env.OPENAI_API_KEY;
    let practicePlan;
    
    if (useOpenAI) {
      practicePlan = await generatePlanWithOpenAI(
        text,
        template,
        event_date,
        duration_minutes,
        coach
      );
    } else {
      practicePlan = await generatePlanWithClaude(
        text,
        template,
        event_date,
        duration_minutes,
        coach
      );
    }

    if (!practicePlan) {
      return NextResponse.json(
        { error: 'Failed to generate practice plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      practice_plan: practicePlan,
    });
  } catch (error) {
    console.error('Error generating practice plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate practice plan using OpenAI
 */
async function generatePlanWithOpenAI(
  text: string | null,
  template: string | null,
  eventDate: string | null,
  duration: number,
  coach: any
): Promise<string | null> {
  const prompt = template
    ? `Generate a professional baseball practice plan using the "${template}" template. Duration: ${duration} minutes.`
    : `Transform these informal practice notes into a professional, structured practice plan:\n\n"${text}"\n\nDuration: ${duration} minutes.`;

  const fullPrompt = `${prompt}

Format the practice plan as follows:

PRACTICE PLAN - ${eventDate ? new Date(eventDate).toLocaleDateString() : 'Date TBD'}
Duration: ${duration} minutes
Focus: [Main focus areas]

WARM-UP (15 min)
• [Specific warm-up activities]

[STATION NAME] (XX min)
• [Drill 1]
• [Drill 2]
• [Drill 3]

[Continue with all stations]

EQUIPMENT NEEDED:
• [List equipment]

Make it professional, detailed, and actionable.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional baseball coach assistant. Generate detailed, structured practice plans.',
        },
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

/**
 * Generate practice plan using Claude
 */
async function generatePlanWithClaude(
  text: string | null,
  template: string | null,
  eventDate: string | null,
  duration: number,
  coach: any
): Promise<string | null> {
  // Placeholder for Claude implementation
  return null;
}

