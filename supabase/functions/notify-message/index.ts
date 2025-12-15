// ═══════════════════════════════════════════════════════════════════════════
// Helm Sports Labs Email Notification Edge Function
// ═══════════════════════════════════════════════════════════════════════════
// 
// This edge function sends email notifications when triggered by:
// 1. Direct HTTP calls
// 2. Database webhooks (triggered by notification_queue inserts)
// 
// To deploy: supabase functions deploy notify-message
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationPayload {
  type: 'new_message' | 'camp_registration' | 'profile_view' | 'watchlist_add' | 'evaluation_added';
  user_id: string;
  payload: Record<string, unknown>;
}

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Email Templates
// ═══════════════════════════════════════════════════════════════════════════

const templates = {
  new_message: {
    subject: (data: any) => `New message from ${data.senderName}`,
    body: (data: any) => `
      <h2>You have a new message!</h2>
      <p><strong>${data.senderName}</strong> sent you a message on Helm Sports Labs.</p>
      ${data.messagePreview ? `<blockquote>${data.messagePreview}</blockquote>` : ''}
      <p><a href="https://helm-sports-labs.app/messages" class="cta-button">View Message</a></p>
    `,
  },
  camp_registration: {
    subject: (data: any) => `${data.playerName} is interested in ${data.campName}`,
    body: (data: any) => `
      <h2>New Camp Interest!</h2>
      <p><strong>${data.playerName}</strong> has registered interest in your camp:</p>
      <p><strong>${data.campName}</strong></p>
      <p><a href="https://helm-sports-labs.app/coach/camps" class="cta-button">View Registrations</a></p>
    `,
  },
  profile_view: {
    subject: (data: any) => `${data.viewerName} viewed your profile`,
    body: (data: any) => `
      <h2>Someone viewed your profile!</h2>
      <p><strong>${data.viewerName}</strong> (${data.viewerType}) viewed your Helm Sports Labs profile.</p>
      <p><a href="https://helm-sports-labs.app/profile" class="cta-button">View Your Profile</a></p>
    `,
  },
  watchlist_add: {
    subject: (data: any) => `${data.coachName} added you to their watchlist`,
    body: (data: any) => `
      <h2>Great news!</h2>
      <p><strong>${data.coachName}</strong> from <strong>${data.programName}</strong> added you to their recruiting watchlist.</p>
      <p>This means they're interested in your playing abilities!</p>
      <p><a href="https://helm-sports-labs.app/player" class="cta-button">View Your Dashboard</a></p>
    `,
  },
  evaluation_added: {
    subject: (data: any) => `New evaluation from ${data.coachName}`,
    body: (data: any) => `
      <h2>You received a new evaluation!</h2>
      <p><strong>${data.coachName}</strong> from <strong>${data.programName}</strong> submitted an evaluation of your performance.</p>
      <p><a href="https://helm-sports-labs.app/player/evaluations" class="cta-button">View Evaluation</a></p>
    `,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Generate Full Email HTML
// ═══════════════════════════════════════════════════════════════════════════

function generateEmailHTML(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f1f5f9;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981, #059669);
      text-align: center;
      padding: 24px;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: white;
    }
    .content {
      padding: 32px;
    }
    h2 {
      color: #0f172a;
      margin-top: 0;
    }
    blockquote {
      background: #f8fafc;
      border-left: 4px solid #10b981;
      margin: 16px 0;
      padding: 12px 16px;
      color: #475569;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white !important;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 16px;
    }
    .footer {
      text-align: center;
      padding: 24px;
      background: #f8fafc;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">◈ Helm Sports Labs</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>You're receiving this email because you have notifications enabled.</p>
      <p>
        <a href="https://helm-sports-labs.app/settings/notifications">Manage preferences</a> | 
        <a href="https://helm-sports-labs.app/unsubscribe">Unsubscribe</a>
      </p>
      <p>© ${new Date().getFullYear()} Helm Sports Labs. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// Send Email (using Resend, SendGrid, or similar)
// ═══════════════════════════════════════════════════════════════════════════

async function sendEmail(request: EmailRequest): Promise<boolean> {
  // Using Resend API (recommended for Supabase Edge Functions)
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Helm Sports Labs <notifications@helm-sports-labs.app>',
        to: request.to,
        subject: request.subject,
        html: request.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Rate Limiting
// ═══════════════════════════════════════════════════════════════════════════

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 emails per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }
  
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Handler
// ═══════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { type, user_id, payload } = await req.json() as NotificationPayload;

    // Check rate limit
    if (!checkRateLimit(user_id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's email and preferences
    const { data: user } = await supabase
      .from('profiles')
      .select('email, notification_preferences(*)')
      .eq('id', user_id)
      .single();

    if (!user?.email) {
      return new Response(
        JSON.stringify({ error: 'User not found or no email' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check notification preferences
    const prefs = user.notification_preferences;
    const prefMap: Record<string, string> = {
      new_message: 'email_new_messages',
      camp_registration: 'email_camp_updates',
      profile_view: 'email_profile_views',
      watchlist_add: 'email_watchlist_adds',
      evaluation_added: 'email_evaluations',
    };

    const prefKey = prefMap[type];
    if (prefs && prefs[prefKey] === false) {
      return new Response(
        JSON.stringify({ message: 'Notification disabled by user preferences' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get template
    const template = templates[type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Unknown notification type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate and send email
    const emailHTML = generateEmailHTML(template.body(payload));
    const success = await sendEmail({
      to: user.email,
      subject: template.subject(payload),
      html: emailHTML,
    });

    // Log the notification
    await supabase.from('notification_log').insert({
      user_id,
      type,
      payload,
      sent_at: success ? new Date().toISOString() : null,
      error: success ? null : 'Failed to send email',
    });

    return new Response(
      JSON.stringify({ success, message: success ? 'Email sent' : 'Failed to send email' }),
      { status: success ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  });


